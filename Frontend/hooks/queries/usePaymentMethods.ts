'use client';

import { useQuery } from '@tanstack/react-query';
import { buildApiUrl } from '@/lib/config/api';

const PM_CACHE_KEY = (storeId: string) => `vnd_pm_${storeId}`;
const PM_CACHE_TTL = 30 * 60 * 1000; // 30 min — métodos de pago cambian muy poco

function readPmCache(storeId: string): PaymentMethod[] | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(PM_CACHE_KEY(storeId));
    if (!raw) return undefined;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > PM_CACHE_TTL) return undefined;
    return data as PaymentMethod[];
  } catch { return undefined; }
}

function writePmCache(storeId: string, data: PaymentMethod[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(PM_CACHE_KEY(storeId), JSON.stringify({ data, ts: Date.now() })); } catch { /* noop */ }
}

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
  disabledBySuperAdmin?: boolean; // Si es true, el super admin hat este método eingeschränkt
  disabledGlobally?: boolean;
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
          throw new Error(result.error || 'Fehler beim Laden der Zahlungsmethoden');
        }

        const methods = result.data as PaymentMethod[];
        writePmCache(storeId, methods);
        return methods;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },
    enabled: !!storeId,
    initialData: () => readPmCache(storeId),
    initialDataUpdatedAt: () => {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(PM_CACHE_KEY(storeId)) : null;
        return raw ? JSON.parse(raw).ts : 0;
      } catch { return 0; }
    },
    staleTime: 20 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

