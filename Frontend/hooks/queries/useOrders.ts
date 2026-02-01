'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, RecentOrder } from '@/lib/services/orderService';
import { useMyStore } from './useMyStore';

export interface UseOrdersOptions {
  limit?: number;
  offset?: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
}

/**
 * Hook para obtener todas las órdenes usando React Query
 * Los datos se cachean para evitar peticiones innecesarias
 * 
 * @param options - Opciones para la consulta (limit, offset, status)
 * @returns Datos de órdenes, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data: orders = [], isLoading, error } = useOrders({ limit: 50, status: 'completed' });
 * ```
 */
export const useOrders = (options?: UseOrdersOptions) => {
  const { data: store, isLoading: storeLoading } = useMyStore();

  return useQuery({
    queryKey: ['orders', store?.id, options],
    queryFn: async ({ signal }) => {
      if (!store?.id) {
        throw new Error('Keine Geschäft gefunden');
      }

      const result = await OrderService.getAllOrders(
        {
          limit: options?.limit || 100,
          offset: options?.offset || 0,
          status: options?.status,
          storeId: store.id, // Siempre pasar storeId para filtrar por tienda
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
    enabled: !!store?.id && !storeLoading, // Solo ejecutar si tenemos storeId y no está cargando
    staleTime: 5 * 60 * 1000, // 5 minutos - los datos se consideran frescos por más tiempo
    gcTime: 30 * 60 * 1000, // 30 minutos en cache - mantener datos en memoria más tiempo
    refetchOnWindowFocus: false, // No refetch al cambiar de ventana
    refetchOnMount: false, // No refetch en mount si los datos están frescos (staleTime)
    refetchOnReconnect: false, // No refetch al reconectar
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};

