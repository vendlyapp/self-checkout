import { createClient } from '@/lib/supabase/server';
import { buildApiUrl } from '@/lib/config/api';
import type { StoreData } from '@/hooks/queries/useMyStore';

export async function prefetchMyStore(): Promise<StoreData | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  try {
    const res = await fetch(buildApiUrl('/api/store/my-store'), {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}
