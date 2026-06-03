'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';

function findProductInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
): Product | undefined {
  for (const [, products] of queryClient.getQueriesData<Product[]>({
    queryKey: queryKeys.products.all(),
  })) {
    const found = products?.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}

export const useProductById = (id: string | null, enabled: boolean = true) => {
  const { session, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    enabled: enabled && !authLoading && !!session?.access_token && !!id,
    initialData: () => {
      if (!id) return undefined;
      return findProductInCache(queryClient, id);
    },
    queryFn: async ({ signal }) => {
      if (!id) throw new Error('Product ID is required');
      const response = await ProductService.getProductById(id, { signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Fehler beim Laden des Produkts');
      }
      return response.data as Product;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') return false;
      return failureCount < 2;
    },
  });
};
