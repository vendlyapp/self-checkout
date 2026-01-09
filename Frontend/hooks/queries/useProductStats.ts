'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';

const emptyStats = {
  total: 0,
  available: 0,
  lowStock: 0,
  outOfStock: 0,
  unavailable: 0,
};

export const useProductStats = () => {
  return useQuery({
    queryKey: ['productStats'],
    queryFn: async ({ signal }) => {
      try {
        const response = await ProductService.getStats({ signal });
        
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        
        // Handle "Backend no disponible" specifically
        if (response.error === 'Backend no disponible') {
          return emptyStats;
        }
        
        if (!response.success || !response.data) {
          const errorMessage = response.error || '';
          if (
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('ERR_CONNECTION_REFUSED') ||
            errorMessage.includes('ERR_NETWORK') ||
            errorMessage.includes('Backend no disponible') ||
            errorMessage.includes('Network request failed')
          ) {
            return emptyStats;
          }
          throw new Error(response.error || 'Error al obtener estadísticas de productos');
        }
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'CANCELLED' || error.name === 'AbortError') {
            throw error;
          }
          const isConnectionError = 
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('ERR_CONNECTION_REFUSED') ||
            error.message.includes('ERR_NETWORK') ||
            error.message.includes('Backend no disponible') ||
            error.message.includes('Network request failed') ||
            (error.name === 'TypeError' && (
              error.message === 'Failed to fetch' ||
              error.message.includes('fetch')
            ));
          
          if (isConnectionError) {
            return emptyStats;
          }
        } else if (error && typeof error === 'object' && 'message' in error) {
          const errorMessage = String(error.message || '');
          if (
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('Backend no disponible')
          ) {
            return emptyStats;
          }
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      if (error instanceof Error && (
        error.message.includes('Backend no disponible') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('ERR_CONNECTION_REFUSED') ||
        error.name === 'TypeError'
      )) {
        return false;
      }
      return failureCount < 2;
    },
    throwOnError: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

