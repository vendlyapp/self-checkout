import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchInvoiceDetail } from '@/lib/server/prefetchInvoiceDetail';
import StoreInvoiceDetailClient from './StoreInvoiceDetailClient';

export const dynamic = 'force-dynamic';

export default async function StoreInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: invoiceId } = await params;
  const queryClient = new QueryClient();

  try {
    const prefetch = await prefetchInvoiceDetail(invoiceId);
    if (prefetch) {
      queryClient.setQueryData(prefetch.queryKey, prefetch.invoice);
    }
  } catch {
    // SSR darf die Seite nicht blockieren
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StoreInvoiceDetailClient invoiceId={invoiceId} />
    </HydrationBoundary>
  );
}
