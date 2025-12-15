'use client';

import { useQuery } from '@tanstack/react-query';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/config/api';

interface CategoryStats {
  total: number;
  withProducts: number;
  withoutProducts: number;
}

export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: async ({ signal }) => {
      // Obtener token de Supabase
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORY_STATS), {
        headers: getAuthHeaders(token, true), // no-cache
        signal,
        cache: 'no-store' as RequestCache,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al obtener estadísticas de categorías');
      }

      return result.data as CategoryStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
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

