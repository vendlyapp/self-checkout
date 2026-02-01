'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, CreateOrderInput, OrderResponse, RecentOrder } from '@/lib/services/orderService';
import { toast } from 'sonner';
import { useMyStore } from '@/hooks/queries/useMyStore';

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
  const { data: store } = useMyStore();

  return useMutation({
    mutationFn: async (input: CreateOrderInput): Promise<OrderResponse> => {
      const order = await OrderService.createOrder(input);
      return order;
    },
    onSuccess: (data) => {
      // Invalidar solo las queries relevantes para este store
      if (store?.id) {
        // Invalidar todas las variantes de orders para este store (con y sin filtros)
        queryClient.invalidateQueries({ 
          queryKey: ['orders', store.id],
          exact: false, // Invalida todas las variantes (con diferentes options)
        });
        // Invalidar recentOrders para este store
        queryClient.invalidateQueries({ 
          queryKey: ['recentOrders', store.id],
          exact: false,
        });
      }
      // Invalidar orderStats (no depende de storeId en la queryKey)
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      
      // Actualizar optimísticamente la orden individual si existe en cache
      if (data?.id) {
        queryClient.setQueryData(['order', data.id], data);
      }
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
  const { data: store } = useMyStore();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await OrderService.updateOrderStatus(orderId, 'cancelled');
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Fehler beim Stornieren der Bestellung');
      }
      return response.data;
    },
    onMutate: async (orderId) => {
      // Cancelar queries en progreso para evitar race conditions
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      if (store?.id) {
        await queryClient.cancelQueries({ queryKey: ['orders', store.id] });
      }
      
      // Snapshot del valor anterior para rollback si falla
      const previousOrder = queryClient.getQueryData<RecentOrder>(['order', orderId]);
      
      // Snapshot de todas las listas de órdenes para rollback
      const previousOrdersQueries: Array<{ queryKey: readonly unknown[], data: RecentOrder[] | undefined }> = [];
      if (store?.id) {
        queryClient.getQueryCache().findAll({ 
          queryKey: ['orders', store.id],
          exact: false,
        }).forEach((query) => {
          previousOrdersQueries.push({
            queryKey: query.queryKey,
            data: query.state.data as RecentOrder[] | undefined,
          });
        });
      }
      
      // Actualización optimista: actualizar el status inmediatamente en la orden individual
      if (previousOrder) {
        queryClient.setQueryData<RecentOrder>(['order', orderId], {
          ...previousOrder,
          status: 'cancelled',
        });
      }
      
      // Actualización optimista: actualizar las listas de órdenes
      if (store?.id) {
        queryClient.getQueryCache().findAll({ 
          queryKey: ['orders', store.id],
          exact: false,
        }).forEach((query) => {
          const currentData = query.state.data as RecentOrder[] | undefined;
          if (currentData) {
            // Obtener el filtro de status de la queryKey si existe
            const options = query.queryKey[2] as { status?: string } | undefined;
            const statusFilter = options?.status;
            
            // Si la lista está filtrada por 'cancelled', no hacer nada (se agregará con el refetch)
            // Si la lista no está filtrada o está filtrada por otro status, actualizar el status de la orden
            if (statusFilter !== 'cancelled') {
              const updatedData = currentData.map((order) =>
                order.id === orderId ? { ...order, status: 'cancelled' as const } : order
              );
              queryClient.setQueryData(query.queryKey, updatedData);
            }
            // Si statusFilter es 'cancelled', la orden aparecerá cuando se haga el refetch
          }
        });
      }
      
      return { previousOrder, previousOrdersQueries };
    },
    onSuccess: (data, orderId) => {
      // Actualizar la orden individual en cache
      queryClient.setQueryData(['order', orderId], data);
      
      // Invalidar y refetch solo las queries relevantes para este store
      if (store?.id) {
        // Invalidar todas las variantes de orders para este store y forzar refetch
        queryClient.invalidateQueries({ 
          queryKey: ['orders', store.id],
          exact: false, // Invalida todas las variantes (con diferentes status, limit, etc.)
          refetchType: 'active', // Forzar refetch de queries activas
        });
        // Invalidar recentOrders para este store
        queryClient.invalidateQueries({ 
          queryKey: ['recentOrders', store.id],
          exact: false,
          refetchType: 'active',
        });
      }
      
      // Invalidar orderStats
      queryClient.invalidateQueries({ 
        queryKey: ['orderStats'],
        refetchType: 'active',
      });
      
      // Invalidar solo invoices relacionadas con esta orden (más específico)
      if (data.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['invoices'],
          predicate: (query) => {
            // Solo invalidar si la query tiene el storeId correcto
            const queryKey = query.queryKey;
            return queryKey[0] === 'invoices' && 
                   (queryKey.length === 1 || queryKey[1] === store?.id);
          },
          refetchType: 'active',
        });
        // También invalidar invoices específicas de esta orden
        queryClient.invalidateQueries({ 
          queryKey: ['invoicesByOrderId', data.id],
          refetchType: 'active',
        });
      }
      
      toast.success('Bestellung erfolgreich storniert');
    },
    onError: (error: Error, orderId, context) => {
      // Rollback: restaurar el valor anterior si falla
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', orderId], context.previousOrder);
      }
      // Rollback: restaurar las listas de órdenes
      if (context?.previousOrdersQueries) {
        context.previousOrdersQueries.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
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
  const { data: store } = useMyStore();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'pending' | 'processing' | 'completed' | 'cancelled' }) => {
      const response = await OrderService.updateOrderStatus(orderId, status);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Fehler beim Aktualisieren der Bestellung');
      }
      return response.data;
    },
    onMutate: async ({ orderId, status }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['order', orderId] });
      
      // Snapshot del valor anterior
      const previousOrder = queryClient.getQueryData<RecentOrder>(['order', orderId]);
      
      // Actualización optimista
      if (previousOrder) {
        queryClient.setQueryData<RecentOrder>(['order', orderId], {
          ...previousOrder,
          status,
        });
      }
      
      return { previousOrder };
    },
    onSuccess: (data, variables) => {
      // Actualizar la orden individual en cache
      queryClient.setQueryData(['order', variables.orderId], data);
      
      // Invalidar solo las queries relevantes para este store
      if (store?.id) {
        // Invalidar todas las variantes de orders para este store
        queryClient.invalidateQueries({ 
          queryKey: ['orders', store.id],
          exact: false, // Invalida todas las variantes
        });
        // Invalidar recentOrders para este store
        queryClient.invalidateQueries({ 
          queryKey: ['recentOrders', store.id],
          exact: false,
        });
      }
      
      // Invalidar orderStats
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      
      // Si se cancela, también invalidar invoices (solo las relevantes)
      if (variables.status === 'cancelled' && store?.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['invoices'],
          predicate: (query) => {
            const queryKey = query.queryKey;
            return queryKey[0] === 'invoices' && 
                   (queryKey.length === 1 || queryKey[1] === store.id);
          },
        });
        queryClient.invalidateQueries({ 
          queryKey: ['invoicesByOrderId', variables.orderId],
        });
      }
      
      const statusMessages = {
        pending: 'Bestellung auf "Ausstehend" gesetzt',
        processing: 'Bestellung auf "In Bearbeitung" gesetzt',
        completed: 'Bestellung auf "Abgeschlossen" gesetzt',
        cancelled: 'Bestellung erfolgreich storniert',
      };
      
      toast.success(statusMessages[variables.status] || 'Bestellung aktualisiert');
    },
    onError: (error: Error, variables, context) => {
      // Rollback: restaurar el valor anterior si falla
      if (context?.previousOrder) {
        queryClient.setQueryData(['order', variables.orderId], context.previousOrder);
      }
      toast.error(error.message || 'Fehler beim Aktualisieren der Bestellung');
    },
  });
};
