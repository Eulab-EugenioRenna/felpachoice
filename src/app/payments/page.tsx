import { getOrders } from '@/lib/pocketbase';
import PaymentListClient from './PaymentListClient';
import type { Order } from '@/lib/types';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const orders: Order[] = await getOrders();

  return (
    <div className="container mx-auto py-8 md:py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Gestione Pagamenti
        </h1>
        <p className="mt-2 text-lg leading-8 text-muted-foreground">
          Segna gli ordini come pagati e tieni traccia degli incassi.
        </p>
      </div>
      <PaymentListClient orders={orders} />
    </div>
  );
}
