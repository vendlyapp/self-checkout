'use client';

import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';
import { useAuth } from '@/lib/auth/AuthContext';
import { fetchProductList, PRODUCT_CATALOG_FILTERS } from '@/lib/api/productsApi';
import { queryKeys } from '@/lib/queryKeys';
import type { ProductFilters } from '@/lib/services/productService';

export { PRODUCT_CATALOG_FILTERS };

export interface UseProductsOptions extends ProductFilters {
  enabled?: boolean;
  _refetchOnMount?: boolean | 'always';
}

function filtersToQueryOpts(filters: ProductFilters): Record<string, unknown> {
  return {
    category: filters.category,
    isActive: filters.isActive,
    includeInactive: filters.includeInactive,
    includeCodes: filters.includeCodes,
    catalog: filters.catalog,
    isPromotional: filters.isPromotional,
    search: filters.search,
    limit: filters.limit,
    offset: filters.offset,
  };
}

export const useProducts = (options?: UseProductsOptions) => {
  const { session, loading: authLoading } = useAuth();
  const { _refetchOnMount, enabled: enabledOption, ...filters } = options ?? {};
  const listOpts = filtersToQueryOpts(filters);

  return useQuery({
    queryKey: [...queryKeys.products.list(listOpts), session?.user?.id ?? 'none'],
    enabled:
      enabledOption !== false && !authLoading && !!session?.access_token,
    queryFn: async ({ signal }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session: liveSession } } = await supabase.auth.getSession();

      if (!liveSession?.access_token) {
        const err = new Error('NO_SESSION');
        (err as Error & { noRetry: boolean }).noRetry = true;
        throw err;
      }

      const result = await fetchProductList(
        liveSession.access_token,
        filters,
        signal
      );

      if (!result.ok) {
        if (result.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        const err = new Error(result.error);
        if (result.status === 401) {
          (err as Error & { noRetry: boolean }).noRetry = true;
        }
        throw err;
      }

      return result.data;
    },
    staleTime: filters.catalog ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: _refetchOnMount ?? true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      if (
        error instanceof Error &&
        (error.message === 'NO_SESSION' ||
          (error as Error & { noRetry?: boolean }).noRetry)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    throwOnError: false,
  });
};
