'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';

export const useRecentOrders = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recentOrders', limit],
    queryFn: async ({ signal }) => {
      const response = await OrderService.getRecentOrders(limit, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Error al obtener órdenes recientes');
      }
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto (muy frecuente)
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
  });
};

