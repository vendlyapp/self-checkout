'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '@/lib/services/categoryService';
import type { Category } from '@/lib/services/categoryService';

/**
 * Hook para obtener todas las categorías
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async ({ signal }) => {
      const response = await CategoryService.getCategories({ signal });
      if (!response.success) {
        throw new Error(response.error || 'Error al obtener categorías');
      }
      return (response.data || []) as Category[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - categorías cambian muy raramente
    gcTime: 60 * 60 * 1000, // 1 hora en cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      if (error instanceof Error && (error.message === 'CANCELLED' || error.name === 'AbortError')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    throwOnError: false,
  });
};

