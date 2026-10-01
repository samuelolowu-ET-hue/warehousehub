import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface OrderItemInput {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantName: string | null;
  sku: string | null;
}

interface CreateOrderBody {
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    address: string;
    city: string;
    postcode: string;
    country: string;
  };
  items: OrderItemInput[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateOrderBody = await req.json();
    const { customerName, customerEmail, shippingAddress, items } = body;

    // Basic validation
    if (!customerName?.trim() || !customerEmail?.trim()) {
      return NextResponse.json({ error: 'Customer name and email are required' }, { status: 400 });
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    // Validate quantities
    for (const item of items) {
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid quantity for product: ${item.productName}` },
          { status: 400 }
        );
      }
    }

    // Validate inventory for each product
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock_qty')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productName}` },
          { status: 400 }
        );
      }

      if (product.stock_qty < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Available: ${product.stock_qty}, requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError || !orderNumberData) {
      console.error('[orders] Failed to generate order number:', orderNumberError?.message);
      return NextResponse.json({ error: 'Failed to generate order number' }, { status: 500 });
    }

    const orderNumber: string = orderNumberData;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shippingTotal = 0; // Free shipping
    const total = subtotal + shippingTotal;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'confirmed',
        subtotal,
        shipping_total: shippingTotal,
        total,
        customer_name: customerName,
        customer_email: customerEmail,
        shipping_address: shippingAddress,
        // ── Payment ──────────────────────────────────────────────────────────
        // Currently: direct order creation — no payment gateway.
        // To add Stripe later:
        //   1. Create a PaymentIntent server-side before this insert.
        //   2. Return { clientSecret } to the client; render Stripe Elements.
        //   3. Move this insert into a Supabase webhook triggered by
        //      `payment_intent.succeeded` so the order only commits after
        //      payment is confirmed.
        //   4. Populate payment_intent_id and stripe_customer_id here.
        //   5. Set payment_method: 'stripe', payment_status: 'paid'.
        // ─────────────────────────────────────────────────────────────────────
        payment_method: 'direct',
        payment_status: 'paid',
        email_sent: false,
      })
      .select('id, order_number, created_at')
      .single();

    if (orderError || !order) {
      console.error('[orders] Failed to create order:', orderError?.message);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Insert order items
    const orderItemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      product_name: item.productName,
      variant_name: item.variantName ?? null,
      sku: item.sku ?? null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);

    if (itemsError) {
      // Order exists but items failed — log and return error (order is orphaned but preserved)
      console.error('[orders] Failed to insert order items:', itemsError.message);
      return NextResponse.json(
        { error: 'Order created but items could not be saved. Please contact support with order: ' + order.order_number },
        { status: 500 }
      );
    }

    // ── Send confirmation email via Supabase Edge Function ─────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    let emailSent = false;
    let emailError: string | null = null;

    try {
      const emailPayload = {
        order: {
          id: order.id,
          order_number: order.order_number,
          customer_name: customerName,
          customer_email: customerEmail,
          subtotal,
          shipping_total: shippingTotal,
          total,
          created_at: order.created_at,
          items: orderItemsPayload.map((item) => ({
            product_name: item.product_name,
            variant_name: item.variant_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            line_total: item.line_total,
          })),
        },
      };

      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-order-confirmation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(emailPayload),
        }
      );

      const emailData = await emailResponse.json();

      if (emailResponse.ok && emailData.success) {
        emailSent = true;
        console.log('[orders] Confirmation email sent. Resend message ID:', emailData.messageId);
      } else {
        emailError = emailData.error ?? `HTTP ${emailResponse.status}`;
        console.error('[orders] Email send failed:', emailError);
      }
    } catch (emailException) {
      emailError =
        emailException instanceof Error ? emailException.message : String(emailException);
      console.error('[orders] Email exception:', emailError);
    }

    // Update order with email status (non-blocking — order is already committed)
    await supabase
      .from('orders')
      .update({
        email_sent: emailSent,
        email_error: emailError,
      })
      .eq('id', order.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      emailSent,
      emailError: emailError ?? undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    console.error('[orders] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
