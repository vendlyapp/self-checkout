'use client';

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';
import { useMyStore } from './useMyStore';

export interface UseInvoicesOptions {
  limit?: number;
  offset?: number;
}

/**
 * Hook para obtener invoices de la tienda actual usando React Query
 * Los datos se cachean para evitar peticiones innecesarias
 * 
 * @param options - Opciones para la consulta (limit, offset)
 * @returns Datos de invoices, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data: invoices = [], isLoading, error } = useInvoices({ limit: 100 });
 * ```
 */
export const useInvoices = (options?: UseInvoicesOptions) => {
  const { data: store, isLoading: storeLoading } = useMyStore();

  return useQuery({
    queryKey: ['invoices', store?.id, options],
    queryFn: async ({ signal }) => {
      if (!store?.id) {
        throw new Error('Keine Geschäft gefunden');
      }

      const result = await InvoiceService.getInvoicesByStoreId(
        store.id,
        {
          limit: options?.limit || 100,
          offset: options?.offset || 0,
        },
        { signal }
      );

      if (!result.success || !result.data) {
        // Si el error es de cancelación, no lanzar error
        if (result.error === 'Request cancelled' || signal?.aborted) {
          throw new Error('CANCELLED');
        }
        throw new Error(result.error || 'Fehler beim Laden der Rechnungen');
      }

      return result.data as Invoice[];
    },
    enabled: !!store?.id && !storeLoading, // Solo ejecutar si tenemos storeId y no está cargando
    staleTime: 10 * 60 * 1000, // 10 minutos - los invoices no cambian tan frecuentemente
    gcTime: 30 * 60 * 1000, // 30 minutos - mantener en cache más tiempo
    refetchOnWindowFocus: false, // No refetch automático en window focus
    refetchOnMount: false, // No refetch en mount si los datos están frescos
    refetchOnReconnect: false, // No refetch en reconnect
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      // Solo reintentar 2 veces máximo
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Delay exponencial: 1s, 2s, max 3s
  });
};

