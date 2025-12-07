'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';

export const useProductStats = () => {
  return useQuery({
    queryKey: ['productStats'],
    queryFn: async ({ signal }) => {
      const response = await ProductService.getStats({ signal });
      if (!response.success || !response.data) {
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        throw new Error(response.error || 'Error al obtener estadísticas de productos');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      // Limitar reintentos para evitar que se quede cargando indefinidamente
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Backoff exponencial
    // Timeout de la query: si no se resuelve en 15 segundos, fallar
    meta: {
      timeout: 15000,
    },
    // Si hay error después de los reintentos, no quedarse en loading
    throwOnError: false,
  });
};

