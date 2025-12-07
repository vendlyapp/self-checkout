'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, type CreateOrderInput } from '@/lib/services/orderService';

/**
 * Hook para crear orden (mutation)
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      return await OrderService.createOrder(input);
    },
    onSuccess: () => {
      // Invalidar cache de órdenes y estadísticas
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
  });
};

