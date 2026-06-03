import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchOrderDetail } from '@/lib/server/prefetchOrderDetail';
import { prefetchInvoicesByOrder } from '@/lib/server/prefetchInvoicesByOrder';
import SalesOrderDetailClient from './SalesOrderDetailClient';

export const dynamic = 'force-dynamic';

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orderId } = await params;
  const queryClient = new QueryClient();

  try {
    const [orderPrefetch, invoicesPrefetch] = await Promise.all([
      prefetchOrderDetail(orderId),
      prefetchInvoicesByOrder(orderId),
    ]);

    if (orderPrefetch) {
      queryClient.setQueryData(orderPrefetch.queryKey, orderPrefetch.order);
    }
    if (invoicesPrefetch) {
      queryClient.setQueryData(invoicesPrefetch.queryKey, invoicesPrefetch.invoices);
    }
  } catch {
    // SSR darf die Seite nicht blockieren
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SalesOrderDetailClient orderId={orderId} />
    </HydrationBoundary>
  );
}
