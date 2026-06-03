import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';

export type ProductStatsData = {
  total: number;
  active: number;
  inactive: number;
  promotional: number;
  totalStock: number;
  categories: Record<string, number>;
};

export type PrefetchProductStatsResult = {
  stats: ProductStatsData;
  queryKey: readonly unknown[];
};

export async function prefetchProductStats(): Promise<PrefetchProductStatsResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const userId = session?.user?.id;
  if (!token || !userId) return null;

  try {
    const res = await fetch(buildApiUrl('/api/products/stats'), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data) return null;

    return {
      stats: json.data as ProductStatsData,
      queryKey: [...queryKeys.products.stats(), userId],
    };
  } catch {
    return null;
  }
}
