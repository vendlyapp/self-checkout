'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchStorefrontPaymentOptions,
  type StorefrontPaymentOption,
} from '@/lib/services/storefrontApi';

const PM_STALE_MS = 20 * 60 * 1000; // 20 min
const PM_CACHE_KEY = (slug: string) => `sf_pm_${slug}`;

function readPmCache(slug: string): StorefrontPaymentOption[] | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(PM_CACHE_KEY(slug));
    if (!raw) return undefined;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > PM_STALE_MS) return undefined;
    return data as StorefrontPaymentOption[];
  } catch {
    return undefined;
  }
}

function writePmCache(slug: string, data: StorefrontPaymentOption[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PM_CACHE_KEY(slug), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full — ignore
  }
}

/**
 * Fetches active payment options for the store by slug.
 * Uses the slug-based storefront endpoint — no storeId required in the buyer context.
 * Returned options exclude sensitive config (QR IBAN, etc.).
 */
export function useStorefrontPaymentOptions(slug: string | undefined | null) {
  return useQuery<StorefrontPaymentOption[]>({
    queryKey: ['storefront', 'paymentOptions', slug],
    queryFn: async () => {
      const options = await fetchStorefrontPaymentOptions(slug!);
      writePmCache(slug!, options);
      return options;
    },
    initialData: () => (slug ? readPmCache(slug) : undefined),
    initialDataUpdatedAt: () => {
      if (!slug || typeof window === 'undefined') return 0;
      try {
        const raw = localStorage.getItem(PM_CACHE_KEY(slug));
        return raw ? JSON.parse(raw).ts ?? 0 : 0;
      } catch {
        return 0;
      }
    },
    enabled: !!slug,
    staleTime: PM_STALE_MS,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
