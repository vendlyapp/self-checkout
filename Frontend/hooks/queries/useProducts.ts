'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';

export interface UseProductsOptions {
  category?: string;
  isActive?: boolean;
  isPromotional?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export const useProducts = (options?: UseProductsOptions) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async ({ signal }) => {
      // Pasar el signal de React Query al servicio para que pueda cancelar la petición
      const response = await ProductService.getProducts(options, { signal });
      if (!response.success || !response.data) {
        // Si el error es de cancelación, no lanzar error
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Error al obtener productos');
      }
      return response.data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - los productos no cambian tan frecuentemente
    gcTime: 10 * 60 * 1000, // 10 minutos
    // No refetch automático en window focus para productos
    refetchOnWindowFocus: false,
    // Refetch en mount solo si los datos están stale (no hacer refetch si hay datos frescos)
    refetchOnMount: 'always',
    // No refetch en reconnect
    refetchOnReconnect: false,
    // Retry solo si no es un error de cancelación
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
  });
};

