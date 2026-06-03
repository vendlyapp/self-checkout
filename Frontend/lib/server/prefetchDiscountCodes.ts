import { createClient } from '@/lib/supabase/server';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { queryKeys } from '@/lib/queryKeys';
import type { DiscountCode } from '@/lib/services/discountCodeService';

export type PrefetchDiscountCodesResult = {
  codes: DiscountCode[];
  queryKey: readonly unknown[];
};

export async function prefetchDiscountCodes(): Promise<PrefetchDiscountCodesResult | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) return null;

  try {
    const res = await fetch(buildApiUrl('/api/discount-codes'), {
      headers: getAuthHeaders(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !Array.isArray(json.data)) return null;

    return {
      codes: json.data as DiscountCode[],
      queryKey: queryKeys.discountCodes.all(),
    };
  } catch {
    return null;
  }
}
