'use client';

import { useQuery } from '@tanstack/react-query';
import { CustomerService } from '@/lib/services/customerService';
import type { Invoice } from '@/lib/services/invoiceService';
import { queryKeys } from '@/lib/queryKeys';
import { useStoreQueryScope } from './useStoreQueryScope';

export const useCustomerInvoices = (customerId: string | null | undefined) => {
  const { storeId, enabled: scopeEnabled } = useStoreQueryScope();

  return useQuery({
    queryKey: queryKeys.customers.invoices(customerId ?? '', storeId),
    enabled: scopeEnabled && !!customerId,
    queryFn: async ({ signal }) => {
      if (!customerId || !storeId) {
        throw new Error('Keine Kunden- oder Geschäfts-ID');
      }
      const result = await CustomerService.getCustomerInvoices(customerId, storeId, {
        signal,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Fehler beim Laden der Rechnungen');
      }
      return result.data as Invoice[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
};
