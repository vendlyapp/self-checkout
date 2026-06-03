import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RecentOrder } from '@/lib/services/orderService';

export type PrefetchRecentOrdersResult = {
  orders: RecentOrder[];
  queryKey: readonly unknown[];
};

export async function prefetchRecentOrders(
  storeId: string,
  limit = 10
): Promise<PrefetchRecentOrdersResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const userId = session?.user?.id;
  if (!token || !userId || !storeId) return null;

  try {
    const params = new URLSearchParams({ limit: String(limit), storeId });
    const res = await fetch(buildApiUrl(`/api/orders/recent?${params}`), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return null;

    return {
      orders: json.data as RecentOrder[],
      queryKey: queryKeys.orders.recent(storeId, limit),
    };
  } catch {
    return null;
  }
}
