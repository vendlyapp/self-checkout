'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';

export const useOrderStats = (date?: string, ownerId?: string) => {
  return useQuery({
    queryKey: ['orderStats', date, ownerId],
    queryFn: async ({ signal }) => {
      const response = await OrderService.getStats(date, ownerId, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Error al obtener estadísticas de órdenes');
      }
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente que productos)
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
  });
};

