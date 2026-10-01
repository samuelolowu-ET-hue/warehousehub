import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { id: string }[];
}

export default async function OrdersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, created_at, order_items(id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const typedOrders = (orders ?? []) as Order[];

  return (
    <div className="bg-chalk min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      <div className="bg-slate py-10 md:py-14">
        <div className="container-content">
          <p className="text-label-sm font-medium text-brass uppercase tracking-widest mb-2">Account</p>
          <h1 className="font-serif text-display-sm text-chalk">Order history</h1>
        </div>
      </div>

      <div className="container-content py-10 md:py-16 max-w-3xl mx-auto">
        {typedOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBagIcon className="w-16 h-16 text-fog mx-auto mb-6" />
            <h2 className="font-serif text-heading-lg text-ink mb-3">No orders yet</h2>
            <p className="text-body-md text-fog mb-8">Your order history will appear here.</p>
            <Link href="/shop" className="btn-primary">Start shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {typedOrders.map((order) => {
              const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              const itemCount = order.order_items?.length ?? 0;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}/confirmation`}
                  className="card p-5 flex items-center justify-between gap-4 hover:border-brass transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-ink group-hover:text-brass transition-colors">
                      {order.order_number}
                    </p>
                    <p className="text-label-sm text-fog mt-0.5">
                      {orderDate} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-body-sm font-semibold text-ink">£{Number(order.total).toFixed(2)}</p>
                    <span className="inline-block px-2 py-0.5 rounded-pill bg-linen text-label-sm font-medium text-ink capitalize mt-1">
                      {order.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
