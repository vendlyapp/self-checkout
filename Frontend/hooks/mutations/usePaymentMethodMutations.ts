'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { toast } from 'sonner';
import type { PaymentMethod } from '../queries/usePaymentMethods';

export interface CreatePaymentMethodData {
  name: string;
  displayName: string;
  code: string;
  icon?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  config?: Record<string, unknown> | null;
}

export interface UpdatePaymentMethodData {
  name?: string;
  displayName?: string;
  code?: string;
  icon?: string | null;
  bgColor?: string | null;
  textColor?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  config?: Record<string, unknown> | null;
  disabledBySuperAdmin?: boolean;
}

/**
 * Hook para crear un método de pago
 */
export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: CreatePaymentMethodData }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No estás autenticado');
      }

      const url = buildApiUrl(`/api/payment-methods/store/${storeId}`);
      const headers = getAuthHeaders(session.access_token);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al crear método de pago');
        }

        return result.data as PaymentMethod;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', variables.storeId] });
      toast.success('Método de pago creado exitosamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear método de pago');
    },
  });
};

/**
 * Hook para actualizar un método de pago
 */
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePaymentMethodData }) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No estás autenticado');
      }

      const url = buildApiUrl(`/api/payment-methods/${id}`);
      const headers = getAuthHeaders(session.access_token);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al actualizar método de pago');
        }

        return result.data as PaymentMethod;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidar todas las queries de paymentMethods para este storeId
      queryClient.invalidateQueries({ queryKey: ['paymentMethods', data.storeId] });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      queryClient.invalidateQueries({ queryKey: ['paymentMethod', data.id] });
      toast.success('Método de pago actualizado exitosamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar método de pago');
    },
  });
};

/**
 * Hook para eliminar un método de pago
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No estás autenticado');
      }

      const url = buildApiUrl(`/api/payment-methods/${id}`);
      const headers = getAuthHeaders(session.access_token);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      try {
        const response = await fetch(url, {
          method: 'DELETE',
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error al eliminar método de pago');
        }

        return { id };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast.success('Método de pago eliminado exitosamente');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar método de pago');
    },
  });
};

