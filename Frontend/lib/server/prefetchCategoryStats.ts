import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';

export type CategoryStatsData = {
  total: number;
  withProducts: number;
  withoutProducts: number;
};

export type PrefetchCategoryStatsResult = {
  stats: CategoryStatsData;
  queryKey: readonly unknown[];
};

export async function prefetchCategoryStats(): Promise<PrefetchCategoryStatsResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const userId = session?.user?.id;
  if (!token || !userId) return null;

  try {
    const res = await fetch(buildApiUrl('/api/categories/stats'), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json?.data) return null;

    return {
      stats: json.data as CategoryStatsData,
      queryKey: [...queryKeys.categories.stats(), userId],
    };
  } catch {
    return null;
  }
}
