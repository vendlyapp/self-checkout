'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, type TopProduct } from '@/lib/services/orderService';
import { queryKeys } from '@/lib/queryKeys';
import { useStoreQueryScope } from './useStoreQueryScope';

export function useTopProducts(options?: { limit?: number; metric?: 'units' | 'revenue' }) {
  const { storeId, enabled } = useStoreQueryScope();
  const limit = options?.limit ?? 5;
  const metric = options?.metric ?? 'units';

  return useQuery({
    queryKey: queryKeys.orders.topProducts(storeId, limit, metric),
    enabled,
    queryFn: async ({ signal }) => {
      const result = await OrderService.getTopProducts({ limit, metric }, { signal });
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Fehler beim Laden der Bestseller');
      }
      return result.data as TopProduct[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
}
