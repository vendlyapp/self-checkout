'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';
import { useMyStore } from './useMyStore';

export const useRecentOrders = (limit: number = 10) => {
  const { data: store, isLoading: storeLoading } = useMyStore();

  return useQuery({
    queryKey: ['recentOrders', store?.id, limit],
    queryFn: async ({ signal }) => {
      if (!store?.id) {
        throw new Error('Keine Geschäft gefunden');
      }

      const response = await OrderService.getRecentOrders(limit, store.id, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Fehler beim Laden der letzten Bestellungen');
      }
      return response.data;
    },
    enabled: !!store?.id && !storeLoading, // Solo ejecutar si tenemos storeId y no está cargando
    staleTime: 3 * 60 * 1000, // 3 minutos - datos frescos por más tiempo
    gcTime: 15 * 60 * 1000, // 15 minutos en cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // No refetch en mount si los datos están frescos
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
  });
};

