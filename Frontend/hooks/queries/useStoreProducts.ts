'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buildApiUrl } from '@/lib/config/api';
import { Product, normalizeProductData } from '@/components/dashboard/products_list/data/mockProducts';

interface UseStoreProductsOptions {
  slug: string;
  enabled?: boolean;
}

/**
 * Hook para obtener productos de una tienda con cache inteligente
 * Los productos se cachean y solo se recargan cuando es necesario
 * 
 * Cache: 10 minutos stale, 30 minutos en memoria
 * Solo se recarga cuando:
 * - Es la primera vez que se carga
 * - Se invalida manualmente el cache (cuando admin agrega producto)
 */
export const useStoreProducts = ({ slug, enabled = true }: UseStoreProductsOptions) => {
  return useQuery({
    queryKey: ['storeProducts', slug],
    queryFn: async ({ signal }) => {
      if (!slug) {
        return [];
      }

      const url = buildApiUrl(`/api/store/${slug}/products`);
      const response = await fetch(url, { signal });
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al cargar productos');
      }

      // Normalizar productos
      const normalizedProducts = result.data.map((p: unknown) => 
        normalizeProductData(p as Product)
      );

      return normalizedProducts;
    },
    enabled: enabled && !!slug,
    staleTime: 15 * 60 * 1000, // 15 minutos - los productos no cambian frecuentemente
    gcTime: 60 * 60 * 1000, // 1 hora en cache (productos cambian raramente)
    refetchOnWindowFocus: false, // No recargar al cambiar de ventana
    refetchOnMount: false, // No recargar al montar si hay datos en cache
    refetchOnReconnect: false, // No recargar al reconectar
    retry: 2, // Reintentar 2 veces en caso de error
    // Usar placeholderData para mostrar datos en cache mientras se actualiza
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook para invalidar el cache de productos de una tienda
 * Úsalo cuando el admin agregue, edite o elimine un producto
 * 
 * @example
 * ```tsx
 * const { invalidateStoreProducts } = useInvalidateStoreProducts();
 * 
 * // Después de crear/editar/eliminar un producto
 * await invalidateStoreProducts(storeSlug);
 * ```
 */
export const useInvalidateStoreProducts = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateStoreProducts: (slug: string) => {
      return queryClient.invalidateQueries({ 
        queryKey: ['storeProducts', slug] 
      });
    }
  };
};

