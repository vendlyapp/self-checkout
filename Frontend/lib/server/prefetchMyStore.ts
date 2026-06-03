import { createClient } from '@/lib/supabase/server';
import { buildApiUrl } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { StoreData } from '@/hooks/queries/useMyStore';

export type PrefetchMyStoreResult = {
  store: StoreData;
  queryKey: readonly unknown[];
};

export async function prefetchMyStore(): Promise<PrefetchMyStoreResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || !session.user?.id) return null;

  try {
    const res = await fetch(buildApiUrl('/api/store/my-store'), {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const store = json?.data as StoreData | undefined;
    if (!store?.id) return null;

    return {
      store,
      queryKey: [...queryKeys.myStore.all(), session.user.id],
    };
  } catch {
    return null;
  }
}
