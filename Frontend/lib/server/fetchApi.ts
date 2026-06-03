import { createClient } from '@/lib/supabase/server';
import { buildApiUrl } from '@/lib/config/api';

type FetchOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Server-side authenticated fetch to Express API.
 */
export async function fetchApi<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  const { cache = 'no-store', revalidate, tags } = options;
  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json',
    },
    cache,
  };

  if (revalidate !== undefined || tags) {
    init.next = {};
    if (revalidate !== undefined) init.next.revalidate = revalidate;
    if (tags) init.next.tags = tags;
  }

  try {
    const res = await fetch(buildApiUrl(endpoint), init);
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

/**
 * Public fetch (storefront, no auth).
 */
export async function fetchPublicApi<T = unknown>(
  endpoint: string,
  revalidate = 60
): Promise<T | null> {
  try {
    const res = await fetch(buildApiUrl(endpoint), {
      next: { revalidate },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}
