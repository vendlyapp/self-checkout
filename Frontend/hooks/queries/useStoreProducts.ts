'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buildApiUrl } from '@/lib/config/api';
import { Product, normalizeProductData } from '@/components/dashboard/products_list/data/mockProducts';

interface UseStoreProductsOptions {
  slug: string;
  enabled?: boolean;
}

const CACHE_KEY = (slug: string) => `vnd_products_${slug}`
const CACHE_TTL = 20 * 60 * 1000 // 20 min — tiempo máximo del cache en localStorage

function readLocalCache(slug: string): Product[] | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(CACHE_KEY(slug))
    if (!raw) return undefined
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return undefined
    return data as Product[]
  } catch {
    return undefined
  }
}

function writeLocalCache(slug: string, data: Product[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CACHE_KEY(slug), JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // localStorage lleno — ignorar
  }
}

export const useStoreProducts = ({ slug, enabled = true }: UseStoreProductsOptions) => {
  return useQuery({
    queryKey: ['storeProducts', slug],
    queryFn: async ({ signal }) => {
      if (!slug) return []
      const url = buildApiUrl(`/api/store/${slug}/products`)
      const response = await fetch(url, { signal })
      const result = await response.json()
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Fehler beim Laden der Produkte')
      }
      const normalized = result.data.map((p: unknown) => normalizeProductData(p as Product))
      writeLocalCache(slug, normalized)
      return normalized as Product[]
    },
    initialData: () => readLocalCache(slug),
    initialDataUpdatedAt: () => {
      if (typeof window === 'undefined') return 0
      try {
        const raw = localStorage.getItem(CACHE_KEY(slug))
        if (!raw) return 0
        return JSON.parse(raw).ts ?? 0
      } catch { return 0 }
    },
    enabled: enabled && !!slug,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
    placeholderData: (prev) => prev,
  })
};

/**
 * Hook para invalidar el cache de productos de una tienda
 * Úsalo cuando el admin agregue, edite o elimine un producto
 * 
 * @example
 * ```tsx
 * const { invalidateStoreProducts } = useInvalidateStoreProducts();
 * 
 * // Después de crear/editar/eliminar un producto
 * await invalidateStoreProducts(storeSlug);
 * ```
 */
export const useInvalidateStoreProducts = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateStoreProducts: (slug: string) => {
      return queryClient.invalidateQueries({ 
        queryKey: ['storeProducts', slug] 
      });
    }
  };
};

