import { getOrders } from '@/lib/pocketbase';
import OrderListClient from './OrderListClient';
import type { Order } from '@/lib/types';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    category?: Product['category'] | 'all';
  };
}) {
  const search = searchParams?.search || '';
  const category = searchParams?.category === 'all' ? '' : searchParams?.category || '';

  const orders: Order[] = await getOrders(search, category);

  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Lista Ordini
        </h1>
        <p className="mt-2 text-lg leading-8 text-muted-foreground">
          Cerca e filtra tra gli ordini ricevuti.
        </p>
      </div>
      <OrderListClient orders={orders} />
    </div>
  );
}
