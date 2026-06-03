'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InvoiceService, Invoice, CreateInvoicePayload } from '@/lib/services/invoiceService';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook para crear invoice (mutation)
 * Invalida automáticamente el cache de invoices para refrescar la lista
 * 
 * @example
 * ```tsx
 * const createInvoice = useCreateInvoice();
 * 
 * await createInvoice.mutateAsync({
 *   orderId: 'order-123',
 *   customerName: 'John Doe',
 *   customerEmail: 'john@example.com',
 * });
 * ```
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { data: store } = useMyStore();

  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const response = await InvoiceService.createInvoice(payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Fehler beim Erstellen der Rechnung');
      }
      return response.data as Invoice;
    },
    onSuccess: (data) => {
      // Invalidar solo las queries de invoices relevantes para este store
      if (store?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.list(store.id),
          exact: false,
        });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all() });
      }

      if (data?.id) {
        queryClient.setQueryData(queryKeys.invoices.detail(data.id), data);
      }

      if (data.orderId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.invoices.byOrder(data.orderId),
        });
      }
    },
  });
};

