import { getOrders } from '@/lib/pocketbase';
import OrderListClient from './OrderListClient';
import type { Order } from '@/lib/types';
import type { SweatshirtType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: {
    search?: string;
    type?: SweatshirtType | string;
  };
}) {
  const search = searchParams?.search || '';
  const type = searchParams?.type || '';

  const orders: Order[] = await getOrders(search, type);

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
