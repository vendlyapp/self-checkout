'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderService, RecentOrder } from '@/lib/services/orderService';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';

function findOrderInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  orderId: string
): RecentOrder | undefined {
  for (const [, orders] of queryClient.getQueriesData<RecentOrder[]>({
    queryKey: ['orders'],
  })) {
    const found = orders?.find((o) => o.id === orderId);
    if (found) return found;
  }
  for (const [, orders] of queryClient.getQueriesData<RecentOrder[]>({
    queryKey: ['recentOrders'],
  })) {
    const found = orders?.find((o) => o.id === orderId);
    if (found) return found;
  }
  return undefined;
}

export const useOrder = (orderId: string | null | undefined) => {
  const { session, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? ''),
    enabled: !authLoading && !!session?.access_token && !!orderId,
    initialData: () => {
      if (!orderId) return undefined;
      return findOrderInCache(queryClient, orderId);
    },
    queryFn: async ({ signal }) => {
      if (!orderId) {
        throw new Error('Keine Bestellungs-ID angegeben');
      }

      const result = await OrderService.getOrderById(orderId, { signal });

      if (!result.success || !result.data) {
        if (result.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(result.error || 'Bestellung nicht gefunden');
      }

      return result.data as RecentOrder;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    placeholderData: (previousData) => {
      if (previousData) return previousData;
      if (!orderId) return undefined;
      const hydrated = queryClient.getQueryData<RecentOrder>(
        queryKeys.orders.detail(orderId)
      );
      if (hydrated) return hydrated;
      return findOrderInCache(queryClient, orderId);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};
