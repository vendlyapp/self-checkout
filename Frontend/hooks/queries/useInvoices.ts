'use client';

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import { queryKeys } from '@/lib/queryKeys';
import { useStoreQueryScope } from './useStoreQueryScope';

export interface UseInvoicesOptions {
  limit?: number;
  offset?: number;
}

export const useInvoices = (options?: UseInvoicesOptions) => {
  const { storeId, enabled } = useStoreQueryScope();
  const listOpts = {
    limit: options?.limit ?? 100,
    offset: options?.offset ?? 0,
  };

  return useQuery({
    queryKey: queryKeys.invoices.list(storeId, listOpts),
    enabled,
    queryFn: async ({ signal }) => {
      if (!storeId) {
        throw new Error('Keine Geschäft gefunden');
      }

      const result = await InvoiceService.getInvoicesByStoreId(
        storeId,
        listOpts,
        { signal }
      );

      if (!result.success || !result.data) {
        if (result.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(result.error || 'Fehler beim Laden der Rechnungen');
      }

      return result.data as Invoice[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    throwOnError: false,
  });
};
