'use client';

import { useQuery } from '@tanstack/react-query';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';

interface CategoryStats {
  total: number;
  withProducts: number;
  withoutProducts: number;
}

export const useCategoryStats = () => {
  const { session, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: [...queryKeys.categories.stats(), session?.user?.id ?? 'none'],
    enabled: !authLoading && !!session?.access_token,
    queryFn: async ({ signal }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session: liveSession } } = await supabase.auth.getSession();
      const token = liveSession?.access_token;

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORY_STATS), {
        headers: getAuthHeaders(token, true),
        signal,
        cache: 'no-store' as RequestCache,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Fehler beim Laden der Kategoriestatistiken');
      }

      return result.data as CategoryStats;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
