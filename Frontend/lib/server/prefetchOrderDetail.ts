import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RecentOrder } from '@/lib/services/orderService';

export type PrefetchOrderDetailResult = {
  order: RecentOrder;
  queryKey: readonly unknown[];
};

export async function prefetchOrderDetail(
  orderId: string
): Promise<PrefetchOrderDetailResult | null> {
  if (!orderId) return null;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) return null;

  try {
    const res = await fetch(buildApiUrl(`/api/orders/${orderId}`), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data) return null;

    return {
      order: json.data as RecentOrder,
      queryKey: queryKeys.orders.detail(orderId),
    };
  } catch {
    return null;
  }
}
