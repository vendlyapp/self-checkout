'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, type TodayCustomersData } from '@/lib/services/orderService';
import { useMyStore } from './useMyStore';

export function useTodayCustomers() {
  const { data: store, isLoading: storeLoading } = useMyStore();

  return useQuery<TodayCustomersData>({
    queryKey: ['todayCustomers', store?.id],
    queryFn: async ({ signal }) => {
      if (!store?.id) {
        throw new Error('Keine Geschäft gefunden');
      }
      const response = await OrderService.getTodayCustomers(store.id, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Fehler beim Laden der Tageskunden');
      }
      return response.data;
    },
    enabled: !!store?.id && !storeLoading,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') return false;
      return failureCount < 2;
    },
  });
}
