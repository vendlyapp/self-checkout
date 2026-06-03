'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';
import { useAuth } from '@/lib/auth/AuthContext';

export interface UseProductsOptions {
  category?: string;
  isActive?: boolean;
  includeInactive?: boolean;
  includeCodes?: boolean;
  catalog?: boolean;
  isPromotional?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
  _refetchOnMount?: boolean | 'always';
}

export const useProducts = (options?: UseProductsOptions) => {
  const { session } = useAuth();
  const { _refetchOnMount, enabled: enabledOption, ...queryOptions } = options ?? {};
  return useQuery({
    queryKey: ['products', queryOptions],
    enabled: enabledOption !== false && !!session,
    queryFn: async ({ signal }) => {
      // Pasar el signal de React Query al servicio para que pueda cancelar la petición
      const response = await ProductService.getProducts(queryOptions, { signal });
      if (!response.success || !response.data) {
        // Si el error es de cancelación, no lanzar error
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Fehler beim Laden der Produkte');
      }
      return response.data as Product[];
    },
    staleTime: queryOptions.catalog ? 10 * 60 * 1000 : 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 minutos
    // No refetch automático en window focus para productos
    refetchOnWindowFocus: false,
    // Refetch en mount solo si los datos están stale (evitar múltiples peticiones)
    refetchOnMount: _refetchOnMount ?? false,
    // No refetch en reconnect
    refetchOnReconnect: false,
    // Retry con delay exponencial para evitar saturar el servidor
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      // Solo reintentar 2 veces máximo
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Delay exponencial: 1s, 2s, max 3s
  });
};

