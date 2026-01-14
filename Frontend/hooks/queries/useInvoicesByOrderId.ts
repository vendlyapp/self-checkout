'use client';

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';

/**
 * Hook para obtener facturas por orderId usando React Query
 * Los datos se cachean para evitar peticiones innecesarias
 * 
 * @param orderId - ID de la orden
 * @returns Datos de las facturas, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data: invoices = [], isLoading, error } = useInvoicesByOrderId('order-id');
 * ```
 */
export const useInvoicesByOrderId = (orderId: string | null | undefined) => {
  return useQuery({
    queryKey: ['invoices', 'order', orderId],
    queryFn: async ({ signal }) => {
      if (!orderId) {
        throw new Error('Keine Bestellungs-ID angegeben');
      }

      const result = await InvoiceService.getInvoicesByOrderId(orderId, { signal });

      if (!result.success || !result.data) {
        if (result.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(result.error || 'Fehler beim Laden der Rechnungen');
      }

      return result.data as Invoice[];
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutos
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

