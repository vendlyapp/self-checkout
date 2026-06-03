'use client';

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook para obtener facturas por orderId usando React Query
 */
export const useInvoicesByOrderId = (orderId: string | null | undefined) => {
  return useQuery({
    queryKey: queryKeys.invoices.byOrder(orderId ?? ''),
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
