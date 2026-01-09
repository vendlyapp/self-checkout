'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';

// Datos vacíos por defecto para cuando el backend no está disponible
const emptyStats = {
  totalRevenue: 0,
  totalOrders: 0,
  uniqueCustomers: 0,
  averageOrderValue: 0,
};

export const useOrderStats = (date?: string, ownerId?: string) => {
  return useQuery({
    queryKey: ['orderStats', date, ownerId],
    queryFn: async ({ signal }) => {
      try {
        const response = await OrderService.getStats(date, ownerId, { signal });
        
        // Si la solicitud fue cancelada, lanzar error especial
        if (response.error === 'Request cancelled') {
          throw new Error('CANCELLED');
        }
        
        // Si el backend no está disponible, retornar datos vacíos en lugar de lanzar error
        // Esto permite que la aplicación continúe funcionando
        // IMPORTANTE: Verificar esto ANTES de verificar success/data
        if (response.error === 'Backend no disponible') {
          return emptyStats;
        }
        
        // Si no hay éxito o datos, verificar si es un error de conexión
        if (!response.success || !response.data) {
          // Verificar si el error es de conexión/red
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
          
          // Para otros errores, lanzar el error normalmente
          throw new Error(response.error || 'Error al obtener estadísticas de órdenes');
        }
        
        return response.data;
      } catch (error) {
        // Si hay un error de red/conexión, retornar datos vacíos
        // Esto permite que la aplicación continúe funcionando aunque el backend no esté disponible
        if (error instanceof Error) {
          // No retornar datos vacíos si es un error de cancelación (se maneja por separado)
          if (error.message === 'CANCELLED' || error.name === 'AbortError') {
            throw error;
          }
          
          // Detectar errores de conexión/red de múltiples formas
          const isConnectionError = 
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('ERR_CONNECTION_REFUSED') ||
            error.message.includes('ERR_NETWORK') ||
            error.message.includes('Backend no disponible') ||
            error.message.includes('Network request failed') ||
            // Los errores de fetch suelen ser TypeError cuando no hay conexión
            (error.name === 'TypeError' && (
              error.message === 'Failed to fetch' ||
              error.message.includes('fetch')
            ));
          
          if (isConnectionError) {
            return emptyStats;
          }
        } else if (error && typeof error === 'object' && 'message' in error) {
          // Manejar errores que no son instancias de Error pero tienen mensaje
          const errorMessage = String(error.message || '');
          if (
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('Backend no disponible')
          ) {
            return emptyStats;
          }
        }
        
        // Re-lanzar otros errores que no sean de conexión
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (más frecuente que productos)
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      // No reintentar si la solicitud fue cancelada
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      
      // No reintentar si el backend no está disponible o hay errores de conexión
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
    // No lanzar error si el backend no está disponible (ya retornamos datos vacíos)
    throwOnError: false,
  });
};

