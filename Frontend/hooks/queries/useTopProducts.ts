'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService, type TopProduct } from '@/lib/services/orderService';
import { useMyStore } from './useMyStore';

export function useTopProducts(options?: { limit?: number; metric?: 'units' | 'revenue' }) {
  const { data: store, isLoading: storeLoading } = useMyStore();

  return useQuery({
    queryKey: ['topProducts', store?.id, options?.limit, options?.metric],
    queryFn: async ({ signal }) => {
      const result = await OrderService.getTopProducts(
        { limit: options?.limit ?? 5, metric: options?.metric ?? 'units' },
        { signal }
      );
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Fehler beim Laden der Bestseller');
      }
      return result.data as TopProduct[];
    },
    enabled: !!store?.id && !storeLoading,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
