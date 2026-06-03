'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStorefrontCategories } from '@/lib/services/storefrontApi';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Public categories for buyer storefront (no auth required).
 */
export function useStorefrontCategories(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.categories.storefront(slug),
    queryFn: ({ signal }) =>
      fetchStorefrontCategories(slug).then((data) => {
        if (signal.aborted) throw new Error('CANCELLED');
        return data;
      }),
    enabled: enabled && !!slug,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
