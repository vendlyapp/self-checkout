'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';

export const useProductById = (id: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async ({ signal }) => {
      if (!id) throw new Error('Product ID is required');
      const response = await ProductService.getProductById(id, { signal });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al obtener producto');
      }
      return response.data as Product;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

