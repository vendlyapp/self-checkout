'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';
import { queryKeys } from '@/lib/queryKeys';
import { useStoreQueryScope } from './useStoreQueryScope';

export const useRecentOrders = (limit: number = 10) => {
  const { storeId, enabled } = useStoreQueryScope();

  return useQuery({
    queryKey: queryKeys.orders.recent(storeId, limit),
    enabled,
    queryFn: async ({ signal }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session: liveSession } } = await supabase.auth.getSession();
      if (!liveSession?.access_token) {
        const err = new Error('NO_SESSION');
        (err as Error & { noRetry: boolean }).noRetry = true;
        throw err;
      }

      const response = await OrderService.getRecentOrders(limit, storeId, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Fehler beim Laden der letzten Bestellungen');
      }
      return response.data;
    },
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
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
    throwOnError: false,
  });
};
