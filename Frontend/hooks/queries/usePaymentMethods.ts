'use client';

import { useQuery } from '@tanstack/react-query';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';

export interface PaymentMethod {
  id: string;
  storeId: string;
  name: string;
  displayName: string;
  code: string;
  icon: string | null;
  bgColor: string | null;
  textColor: string | null;
  isActive: boolean;
  sortOrder: number;
  config: Record<string, unknown> | null;
  disabledBySuperAdmin?: boolean; // Si es true, el super admin inhabilitó este método
  disabledGlobally?: boolean; // Si es true, el método está deshabilitado globalmente (no disponible para ninguna tienda)
  createdAt: string;
  updatedAt: string;
}

interface UsePaymentMethodsOptions {
  storeId: string;
  activeOnly?: boolean;
}

/**
 * Hook para obtener métodos de pago de un store
 * @param options - Opciones de la query
 * @param options.storeId - ID del store
 * @param options.activeOnly - Si es true, solo retorna métodos activos
 */
export const usePaymentMethods = (options: UsePaymentMethodsOptions) => {
  const { storeId, activeOnly = false } = options;

  return useQuery({
    queryKey: ['paymentMethods', storeId, activeOnly],
    queryFn: async ({ signal }) => {
      if (!storeId) {
        throw new Error('Store ID es requerido');
      }

      const url = buildApiUrl(`/api/payment-methods/store/${storeId}`, {
        activeOnly: activeOnly.toString(),
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
          signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al cargar métodos de pago');
        }

        return result.data as PaymentMethod[];
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },
    enabled: !!storeId,
    staleTime: 0, // Siempre considerar los datos como stale para métodos de pago (pueden cambiar)
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: true, // Recargar al enfocar la ventana
    refetchOnMount: true, // Recargar cuando se monta el componente
    refetchOnReconnect: true, // Recargar al reconectar
  });
};

