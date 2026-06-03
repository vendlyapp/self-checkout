import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { prefetchInvoiceDetail } from '@/lib/server/prefetchInvoiceDetail';
import SalesInvoiceDetailClient from './SalesInvoiceDetailClient';

export const dynamic = 'force-dynamic';

export default async function SalesInvoiceDetailPage({
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
      <SalesInvoiceDetailClient invoiceId={invoiceId} />
    </HydrationBoundary>
  );
}
