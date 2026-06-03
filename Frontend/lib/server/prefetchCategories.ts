import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Category } from '@/lib/services/categoryService';

export type PrefetchCategoriesResult = {
  categories: Category[];
  queryKey: readonly unknown[];
};

export async function prefetchCategories(): Promise<PrefetchCategoriesResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  const userId = session?.user?.id;
  if (!token || !userId) return null;

  try {
    const res = await fetch(buildApiUrl('/api/categories'), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return null;

    return {
      categories: json.data as Category[],
      queryKey: [...queryKeys.categories.all(), userId],
    };
  } catch {
    return null;
  }
}
