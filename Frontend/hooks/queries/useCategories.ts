'use client';

import { useQuery } from '@tanstack/react-query';
import { CategoryService } from '@/lib/services/categoryService';
import type { Category } from '@/lib/services/categoryService';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook para obtener todas las categorías
 */
export const useCategories = () => {
  const { session } = useAuth();
  return useQuery({
    queryKey: [...queryKeys.categories.all(), session?.user?.id ?? 'guest'],
    queryFn: async ({ signal }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session: liveSession } } = await supabase.auth.getSession();
      if (!liveSession?.access_token) {
        const err = new Error('NO_SESSION');
        (err as Error & { noRetry: boolean }).noRetry = true;
        throw err;
      }
      const response = await CategoryService.getCategories({ signal });
      if (!response.success) {
        throw new Error(response.error || 'Fehler beim Laden der Kategorien');
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
      if (
        error instanceof Error &&
        (error.message === 'NO_SESSION' ||
          (error as Error & { noRetry?: boolean }).noRetry)
      ) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
    throwOnError: false,
  });
};

