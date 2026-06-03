'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, RecentOrder } from '@/lib/services/orderService';
import { queryKeys } from '@/lib/queryKeys';
import { useStoreQueryScope } from './useStoreQueryScope';

export interface UseOrdersOptions {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export const useOrders = (options?: UseOrdersOptions) => {
  const { storeId, enabled } = useStoreQueryScope();
  const listOpts = {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
    status: options?.status,
  };

  return useQuery({
    queryKey: queryKeys.orders.list(storeId, listOpts),
    enabled,
    queryFn: async ({ signal }) => {
      if (!storeId) {
        throw new Error('Keine Geschäft gefunden');
      }

      const result = await OrderService.getAllOrders(
        {
          limit: listOpts.limit,
          offset: listOpts.offset,
          status: listOpts.status,
          storeId,
        },
        { signal }
      );

      if (!result.success || !result.data) {
        if (result.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(result.error || 'Fehler beim Laden der Bestellungen');
      }

      return result.data as RecentOrder[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    throwOnError: false,
  });
};
