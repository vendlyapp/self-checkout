'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAuthHeaders, buildApiUrl } from '@/lib/config/api';
import { devError, devWarn } from '@/lib/utils/logger';

interface StoreState {
  isStoreOpen: boolean;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  toggleStore: () => Promise<void>;
  setStoreStatus: (isOpen: boolean) => Promise<void>;
  fetchStoreStatus: () => Promise<void>;
  getStoreStatus: () => {
    isOpen: boolean;
    statusText: string;
    statusColor: string;
    lastUpdated: string;
  };
}

// Funciones helper fuera del store
const getToken = async (): Promise<string | undefined> => {
  const { supabase } = await import('@/lib/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

const updateStoreStatusInBackend = async (isOpen: boolean) => {
  const token = await getToken();
  
  try {
    const url = buildApiUrl('/api/store/my-store/status');
    const headers = getAuthHeaders(token);

    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ isOpen }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Fehler beim Aktualisieren des Geschäftsstatus');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    devError('Error al actualizar estado en backend:', error);
    throw error;
  }
};

export const useStoreState = create<StoreState>()(
  persist(
    (set, get) => ({
      isStoreOpen: false,
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      error: null,

      // Obtener estado actual de la tienda desde el backend
      fetchStoreStatus: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const token = await getToken();
          const url = buildApiUrl('/api/store/my-store');
          const headers = getAuthHeaders(token);

          const response = await fetch(url, {
            method: 'GET',
            headers,
          });

          if (!response.ok) {
            // Intentar obtener el mensaje de error de la respuesta
            let errorMessage = 'Error al obtener el estado de la tienda';
            
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
              // Si no se puede parsear JSON, usar el status text
              errorMessage = response.statusText || errorMessage;
            }

            // Si es 404, el usuario probablemente no tiene una tienda asociada
            if (response.status === 404) {
              devWarn('No store found for user');
              // No establecer error para 404, solo mantener el estado actual
              set({ error: null, isLoading: false });
              return;
            }

            // Si es 401, el usuario no está autenticado
            if (response.status === 401) {
              devWarn('Usuario no autenticado');
              set({ error: null, isLoading: false });
              return;
            }

            // Si es 500, podría ser un error temporal del backend
            if (response.status === 500) {
              devWarn('Error del servidor al obtener estado de la tienda, manteniendo estado actual');
              set({ error: null, isLoading: false });
              return;
            }

            // Para otros errores, solo registrar sin bloquear la UI
            devWarn('Error al obtener estado de la tienda:', errorMessage);
            set({ error: null, isLoading: false });
            return;
          }

          const data = await response.json();
          
          if (data.success && data.data?.isOpen !== undefined) {
            set({
              isStoreOpen: data.data.isOpen,
              lastUpdated: new Date().toISOString(),
              error: null,
              isLoading: false,
            });
          } else if (data.data?.isOpen !== undefined) {
            // Si la respuesta no tiene success pero tiene data.isOpen, usarlo igual
            set({
              isStoreOpen: data.data.isOpen,
              lastUpdated: new Date().toISOString(),
              error: null,
              isLoading: false,
            });
          } else {
            devWarn('Invalid store data, keeping current state');
            set({ error: null, isLoading: false });
          }
        } catch (error) {
          devError('Store state fetch failed:', error);
          const errorMessage = error instanceof Error
            ? error.message
            : 'Store state fetch failed';

          // Connection/backend unreachable: do not show critical error
          if (
            error instanceof TypeError ||
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('NetworkError') ||
            errorMessage.includes('ERR_CONNECTION_REFUSED') ||
            errorMessage.includes('ERR_NETWORK') ||
            errorMessage.includes('Backend unavailable')
          ) {
            devWarn('Backend unavailable, keeping current state');
            set({ error: null, isLoading: false });
            return;
          }
          
          devWarn('Store state error:', errorMessage);
          set({ error: null, isLoading: false });
        }
      },

      toggleStore: async () => {
        const newStatus = !get().isStoreOpen;
        set({ isLoading: true, error: null });
        
        try {
          // Actualizar estado local primero (optimistic update)
          set({
            isStoreOpen: newStatus,
            lastUpdated: new Date().toISOString(),
          });

          // Actualizar en el backend
          await updateStoreStatusInBackend(newStatus);
        } catch (error) {
          // Revertir cambio si hay error
          set({
            isStoreOpen: !newStatus,
            error: error instanceof Error ? error.message : 'Error al cambiar estado de la tienda',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      setStoreStatus: async (isOpen: boolean) => {
        set({ isLoading: true, error: null });
        
        try {
          // Actualizar estado local primero
          set({
            isStoreOpen: isOpen,
            lastUpdated: new Date().toISOString(),
          });

          // Actualizar en el backend
          await updateStoreStatusInBackend(isOpen);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Error al establecer estado de la tienda',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      getStoreStatus: () => {
        const { isStoreOpen, lastUpdated } = get();
        return {
          isOpen: isStoreOpen,
          statusText: isStoreOpen ? 'Geöffnet' : 'Geschlossen',
          statusColor: isStoreOpen ? 'text-green-600' : 'text-red-600',
          lastUpdated,
        };
      },
    }),
    {
      name: 'store-state',
      version: 2,
      partialize: (state) => ({
        isStoreOpen: state.isStoreOpen,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
