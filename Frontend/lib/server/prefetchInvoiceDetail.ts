import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Invoice } from '@/lib/services/invoiceService';

export type PrefetchInvoiceDetailResult = {
  invoice: Invoice;
  queryKey: readonly unknown[];
};

export async function prefetchInvoiceDetail(
  invoiceId: string
): Promise<PrefetchInvoiceDetailResult | null> {
  if (!invoiceId) return null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) return null;

  const fetchInvoice = async (path: string) => {
    const res = await fetch(buildApiUrl(path), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data) return null;
    return json.data as Invoice;
  };

  try {
    let invoice = await fetchInvoice(`/api/invoices/${invoiceId}`);
    if (!invoice) {
      invoice = await fetchInvoice(`/api/invoices/number/${invoiceId}`);
    }
    if (!invoice) return null;

    return {
      invoice,
      queryKey: queryKeys.invoices.detail(invoiceId),
    };
  } catch {
    return null;
  }
}
