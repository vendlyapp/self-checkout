'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, CreateOrderInput, OrderResponse } from '@/lib/services/orderService';
import { toast } from 'sonner';

/**
 * Hook para crear una orden (mutation)
 * Invalida automáticamente el cache de órdenes y estadísticas
 * 
 * @example
 * ```tsx
 * const createOrder = useCreateOrder();
 * 
 * const order = await createOrder.mutateAsync({
 *   items: [...],
 *   paymentMethod: 'card',
 *   total: 100,
 *   storeId: 'store-id',
 * });
 * ```
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<OrderResponse> => {
      const order = await OrderService.createOrder(input);
      return order;
    },
    onSuccess: () => {
      // Invalidar cache de órdenes para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Erstellen der Bestellung');
    },
  });
};

/**
 * Hook para cancelar una orden (mutation)
 * Invalida automáticamente el cache de órdenes y facturas relacionadas
 * 
 * @example
 * ```tsx
 * const cancelOrder = useCancelOrder();
 * 
 * await cancelOrder.mutateAsync('order-id');
 * ```
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await OrderService.updateOrderStatus(orderId, 'cancelled');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Fehler beim Stornieren der Bestellung');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar cache de órdenes para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      
      // Invalidar cache de invoices relacionadas
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      
      toast.success('Bestellung erfolgreich storniert');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Stornieren der Bestellung');
    },
  });
};

/**
 * Hook para actualizar el estado de una orden (mutation)
 * 
 * @example
 * ```tsx
 * const updateOrderStatus = useUpdateOrderStatus();
 * 
 * await updateOrderStatus.mutateAsync({ orderId: 'order-id', status: 'completed' });
 * ```
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'processing' | 'completed' | 'cancelled' }) => {
      const response = await OrderService.updateOrderStatus(orderId, status);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Fehler beim Aktualisieren der Bestellung');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache de órdenes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      
      // Si se cancela, también invalidar invoices
      if (variables.status === 'cancelled') {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
      
      const statusMessages = {
        pending: 'Bestellung auf "Ausstehend" gesetzt',
        processing: 'Bestellung auf "In Bearbeitung" gesetzt',
        completed: 'Bestellung auf "Abgeschlossen" gesetzt',
        cancelled: 'Bestellung erfolgreich storniert',
      };
      
      toast.success(statusMessages[variables.status] || 'Bestellung aktualisiert');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Fehler beim Aktualisieren der Bestellung');
    },
  });
};
