'use client';

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth/AuthContext';

export const useInvoice = (invoiceId: string | null | undefined) => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.invoices.detail(invoiceId ?? ''),
    enabled: !authLoading && !!session?.access_token && !!invoiceId,
    queryFn: async ({ signal }) => {
      if (!invoiceId) {
        throw new Error('Keine Rechnungs-ID angegeben');
      }

      let result = await InvoiceService.getInvoiceById(invoiceId, { signal });

      if (!result.success && !result.data) {
        result = await InvoiceService.getInvoiceByNumber(invoiceId, { signal });
      }

      if (!result.success || !result.data) {
        if (result.error === 'cancelled' || result.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(result.error || 'Rechnung nicht gefunden');
      }

      return result.data as Invoice;
    },
    throwOnError: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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
