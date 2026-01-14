'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, RecentOrder } from '@/lib/services/orderService';

/**
 * Hook para obtener una orden por ID usando React Query
 * Los datos se cachean para evitar peticiones innecesarias
 * 
 * @param orderId - ID de la orden
 * @returns Datos de la orden, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data: order, isLoading, error } = useOrder('order-id');
 * ```
 */
export const useOrder = (orderId: string | null | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
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
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

