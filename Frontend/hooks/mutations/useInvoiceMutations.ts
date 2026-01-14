'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InvoiceService, Invoice, CreateInvoicePayload } from '@/lib/services/invoiceService';

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

  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const response = await InvoiceService.createInvoice(payload);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Fehler beim Erstellen der Rechnung');
      }
      return response.data as Invoice;
    },
    onSuccess: () => {
      // Invalidar cache de invoices para refrescar la lista
      // Esto actualizará automáticamente todas las páginas que usen useInvoices
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

