'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, type TodayCustomersData } from '@/lib/services/orderService';
import { queryKeys } from '@/lib/queryKeys';
import { useStoreQueryScope } from './useStoreQueryScope';

export function useTodayCustomers() {
  const { storeId, enabled } = useStoreQueryScope();

  return useQuery<TodayCustomersData>({
    queryKey: queryKeys.orders.todayCustomers(storeId),
    enabled,
    queryFn: async ({ signal }) => {
      if (!storeId) {
        throw new Error('Keine Geschäft gefunden');
      }
      const response = await OrderService.getTodayCustomers(storeId, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Fehler beim Laden der Tageskunden');
      }
      return response.data;
    },
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });
}
