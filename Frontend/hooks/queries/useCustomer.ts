'use client';

import { useQuery } from '@tanstack/react-query';
import { CustomerService, type Customer } from '@/lib/services/customerService';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/lib/auth/AuthContext';

export const useCustomer = (customerId: string | null | undefined) => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.customers.detail(customerId ?? ''),
    enabled: !authLoading && !!session?.access_token && !!customerId,
    queryFn: async ({ signal }) => {
      if (!customerId) throw new Error('Keine Kunden-ID angegeben');
      const result = await CustomerService.getCustomerById(customerId, { signal });
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Kunde nicht gefunden');
      }
      return result.data as Customer;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
};
