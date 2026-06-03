import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import { getLocalDateString } from '@/lib/utils';

export type OrderStatsData = {
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  averageOrderValue: number;
};

export type PrefetchOrderStatsResult = {
  stats: OrderStatsData;
  queryKey: readonly unknown[];
};

/** Stats de hoy para Heute + Tagesziel (misma clave que useOrderStats). */
export async function prefetchTodayOrderStats(
  ownerId: string
): Promise<PrefetchOrderStatsResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token || !ownerId) return null;

  const today = getLocalDateString();

  try {
    const params = new URLSearchParams({ date: today, ownerId });
    const res = await fetch(buildApiUrl(`/api/orders/stats?${params}`), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data) return null;

    return {
      stats: json.data as OrderStatsData,
      queryKey: queryKeys.orders.stats(today, ownerId),
    };
  } catch {
    return null;
  }
}
