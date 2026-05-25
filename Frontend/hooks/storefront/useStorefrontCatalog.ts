'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchStorefrontCatalog,
  type StorefrontProduct,
  type CatalogOptions,
} from '@/lib/services/storefrontApi';

const CATALOG_STALE_MS = 15 * 60 * 1000; // 15 min
const CATALOG_CACHE_KEY = (slug: string) => `sf_catalog_${slug}`;

function readCatalogCache(slug: string): StorefrontProduct[] | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(CATALOG_CACHE_KEY(slug));
    if (!raw) return undefined;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CATALOG_STALE_MS) return undefined;
    return data as StorefrontProduct[];
  } catch {
    return undefined;
  }
}

function writeCatalogCache(slug: string, data: StorefrontProduct[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATALOG_CACHE_KEY(slug), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage full — ignore
  }
}

interface UseStorefrontCatalogOptions extends CatalogOptions {
  slug: string | undefined | null;
  enabled?: boolean;
}

/**
 * Fetches the product catalog from the buyer-safe storefront API.
 * Returned products exclude internal fields (ownerId, costPrice, margin, etc.).
 */
export function useStorefrontCatalog({ slug, enabled = true, ...options }: UseStorefrontCatalogOptions) {
  return useQuery<StorefrontProduct[]>({
    queryKey: ['storefront', 'catalog', slug, options],
    queryFn: async () => {
      const products = await fetchStorefrontCatalog(slug!, options);
      writeCatalogCache(slug!, products);
      return products;
    },
    initialData: () => (slug ? readCatalogCache(slug) : undefined),
    initialDataUpdatedAt: () => {
      if (!slug || typeof window === 'undefined') return 0;
      try {
        const raw = localStorage.getItem(CATALOG_CACHE_KEY(slug));
        return raw ? JSON.parse(raw).ts ?? 0 : 0;
      } catch {
        return 0;
      }
    },
    enabled: enabled && !!slug,
    staleTime: CATALOG_STALE_MS,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
