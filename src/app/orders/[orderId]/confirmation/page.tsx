import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface OrderItem {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping_total: number;
  total: number;
  status: string;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, order_number, customer_name, customer_email,
      subtotal, shipping_total, total, status,
      email_sent, email_error, created_at,
      order_items(id, product_name, variant_name, quantity, unit_price, line_total)
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (error || !order) notFound();

  const typedOrder = order as Order;

  const orderDate = new Date(typedOrder.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      {/* Header */}
      <div className="bg-slate py-10 md:py-14">
        <div className="container-content text-center">
          <CheckCircleIcon className="w-14 h-14 text-success mx-auto mb-4" />
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">Order confirmed</p>
          <h1 className="font-serif text-display-sm text-chalk">Thank you, {typedOrder.customer_name}!</h1>
          <p className="text-body-md text-fog mt-3">
            Your order <span className="text-chalk font-semibold">{typedOrder.order_number}</span> has been placed.
          </p>
        </div>
      </div>

      <div className="container-content py-10 md:py-16 max-w-3xl mx-auto">
        {/* Email status */}
        {typedOrder.email_sent ? (
          <div className="bg-green-50 border border-green-200 rounded-card px-5 py-4 mb-6 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <p className="text-body-sm text-green-800">
              Confirmation email sent to <strong>{typedOrder.customer_email}</strong>
            </p>
          </div>
        ) : typedOrder.email_error ? (
          <div className="bg-amber-50 border border-amber-200 rounded-card px-5 py-4 mb-6">
            <p className="text-body-sm text-amber-800 font-medium mb-1">Email delivery issue</p>
            <p className="text-label-sm text-amber-700">
              Your order was placed successfully but the confirmation email could not be sent.
              Your order number is <strong>{typedOrder.order_number}</strong> — please save it for reference.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-label-sm text-amber-600 mt-2 font-mono break-all">
                Debug: {typedOrder.email_error}
              </p>
            )}
          </div>
        ) : null}

        {/* Order meta */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-label-sm text-fog uppercase tracking-wide mb-1">Order</p>
              <p className="text-body-sm font-semibold text-ink">{typedOrder.order_number}</p>
            </div>
            <div>
              <p className="text-label-sm text-fog uppercase tracking-wide mb-1">Date</p>
              <p className="text-body-sm font-semibold text-ink">{orderDate}</p>
            </div>
            <div>
              <p className="text-label-sm text-fog uppercase tracking-wide mb-1">Status</p>
              <span className="inline-block px-2 py-0.5 rounded-pill bg-linen text-label-sm font-medium text-ink capitalize">
                {typedOrder.status}
              </span>
            </div>
            <div>
              <p className="text-label-sm text-fog uppercase tracking-wide mb-1">Total</p>
              <p className="text-body-sm font-semibold text-ink">£{Number(typedOrder.total).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6 mb-6">
          <h2 className="font-serif text-heading-md text-ink mb-5">Items ordered</h2>
          <div className="space-y-4">
            {typedOrder.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="text-body-sm font-medium text-ink">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-label-sm text-fog mt-0.5">{item.variant_name}</p>
                  )}
                  <p className="text-label-sm text-fog mt-0.5">Qty: {item.quantity} × £{Number(item.unit_price).toFixed(2)}</p>
                </div>
                <p className="text-body-sm font-semibold text-ink flex-shrink-0">
                  £{Number(item.line_total).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-border space-y-2">
            <div className="flex justify-between text-body-sm text-fog">
              <span>Subtotal</span>
              <span>£{Number(typedOrder.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-fog">
              <span>Shipping</span>
              <span className="text-success">{Number(typedOrder.shipping_total) === 0 ? 'Free' : `£${Number(typedOrder.shipping_total).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-body-lg font-semibold text-ink pt-2 border-t border-border">
              <span>Total</span>
              <span>£{Number(typedOrder.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/orders" className="btn-primary flex-1 text-center">
            View all orders
          </Link>
          <Link href="/shop" className="btn-ghost flex-1 text-center">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
