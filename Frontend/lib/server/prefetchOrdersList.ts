import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { RecentOrder } from '@/lib/services/orderService';

export type PrefetchOrdersListResult = {
  orders: RecentOrder[];
  queryKey: readonly unknown[];
};

export async function prefetchOrdersList(
  storeId: string,
  options: { limit?: number; offset?: number; status?: string } = {}
): Promise<PrefetchOrdersListResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token || !storeId) return null;

  const limit = options.limit ?? 100;
  const offset = options.offset ?? 0;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    storeId,
  });
  if (options.status) params.append('status', options.status);

  try {
    const res = await fetch(buildApiUrl(`/api/orders?${params}`), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return null;

    return {
      orders: json.data as RecentOrder[],
      queryKey: queryKeys.orders.list(storeId, { limit, offset, status: options.status }),
    };
  } catch {
    return null;
  }
}
