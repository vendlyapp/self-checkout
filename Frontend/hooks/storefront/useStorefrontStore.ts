'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStorefrontStore, type StorefrontStore } from '@/lib/services/storefrontApi';

const STORE_CACHE_TTL_MS = 10 * 60 * 1000; // 10 min

/**
 * Loads store branding and settings from the buyer-safe storefront API.
 * Does NOT expose internal IDs or admin-only fields.
 */
export function useStorefrontStore(slug: string | undefined | null) {
  return useQuery<StorefrontStore>({
    queryKey: ['storefront', 'store', slug],
    queryFn: () => fetchStorefrontStore(slug!),
    enabled: !!slug,
    staleTime: STORE_CACHE_TTL_MS,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}
