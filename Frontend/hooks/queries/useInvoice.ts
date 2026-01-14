'use client';

import { useQuery } from '@tanstack/react-query';
import { InvoiceService, Invoice } from '@/lib/services/invoiceService';

/**
 * Hook para obtener un invoice por ID usando React Query
 * Los datos se cachean para evitar peticiones innecesarias
 * 
 * @param invoiceId - ID o número de factura
 * @returns Datos del invoice, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data: invoice, isLoading, error } = useInvoice('invoice-id');
 * ```
 */
export const useInvoice = (invoiceId: string | null | undefined) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async ({ signal }) => {
      if (!invoiceId) {
        throw new Error('Keine Rechnungs-ID angegeben');
      }

      // Intentar obtener por ID primero
      let result = await InvoiceService.getInvoiceById(invoiceId, { signal });
      
      // Si no se encuentra por ID, intentar por número de factura
      if (!result.success && !result.data) {
        result = await InvoiceService.getInvoiceByNumber(invoiceId, { signal });
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Rechnung nicht gefunden');
      }

      return result.data as Invoice;
    },
    enabled: !!invoiceId, // Solo ejecutar si tenemos invoiceId
    staleTime: 10 * 60 * 1000, // 10 minutos - los invoices no cambian frecuentemente (aumentado de 5 a 10)
    gcTime: 30 * 60 * 1000, // 30 minutos - mantener en cache más tiempo
    refetchOnWindowFocus: false, // No refetch automático en window focus
    refetchOnMount: false, // No refetch en mount si los datos están frescos
    refetchOnReconnect: false, // No refetch en reconnect
    // Usar placeholderData para evitar peticiones redundantes durante el montaje
    placeholderData: (previousData) => previousData,
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

