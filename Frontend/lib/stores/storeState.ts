'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAuthHeaders, buildApiUrl } from '@/lib/config/api';

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
      throw new Error(errorData.error || 'Error al actualizar el estado de la tienda');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar estado en backend:', error);
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
            throw new Error('Error al obtener el estado de la tienda');
          }

          const data = await response.json();
          
          if (data.success && data.data?.isOpen !== undefined) {
            set({
              isStoreOpen: data.data.isOpen,
              lastUpdated: new Date().toISOString(),
              error: null,
            });
          }
        } catch (error) {
          console.error('Error al obtener estado de la tienda:', error);
          set({ error: error instanceof Error ? error.message : 'Error desconocido' });
        } finally {
          set({ isLoading: false });
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
