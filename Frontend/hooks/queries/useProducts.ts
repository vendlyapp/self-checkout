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
  const { session, loading: authLoading } = useAuth();
  const { _refetchOnMount, enabled: enabledOption, ...queryOptions } = options ?? {};
  return useQuery({
    // Esperar fin de AuthProvider antes del primer fetch (evita NO_SESSION fantasma en prod).
    queryKey: ['products', queryOptions, session?.user?.id ?? 'none'],
    enabled: enabledOption !== false && !authLoading,
    queryFn: async ({ signal }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session: liveSession } } = await supabase.auth.getSession();
      if (!liveSession?.access_token) {
        const err = new Error('NO_SESSION');
        (err as Error & { noRetry: boolean }).noRetry = true;
        throw err;
      }
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
    refetchOnMount: _refetchOnMount ?? true,
    // No refetch en reconnect
    refetchOnReconnect: false,
    // Retry con delay exponencial para evitar saturar el servidor
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      if (
        error instanceof Error &&
        (error.message === 'NO_SESSION' ||
          (error as Error & { noRetry?: boolean }).noRetry)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Delay exponencial: 1s, 2s, max 3s
  });
};

