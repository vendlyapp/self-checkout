import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Invoice } from '@/lib/services/invoiceService';

export type PrefetchInvoicesByOrderResult = {
  invoices: Invoice[];
  queryKey: readonly unknown[];
};

export async function prefetchInvoicesByOrder(
  orderId: string
): Promise<PrefetchInvoicesByOrderResult | null> {
  if (!orderId) return null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) return null;

  try {
    const res = await fetch(buildApiUrl(`/api/invoices/order/${orderId}`), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return null;

    return {
      invoices: json.data as Invoice[],
      queryKey: queryKeys.invoices.byOrder(orderId),
    };
  } catch {
    return null;
  }
}
