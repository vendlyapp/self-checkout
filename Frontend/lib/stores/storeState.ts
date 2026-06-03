'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import { getAppQueryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queryKeys';
import type { StoreData } from '@/hooks/queries/useMyStore';
import { devError } from '@/lib/utils/logger';

interface StoreState {
  isStoreOpen: boolean;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  toggleStore: () => Promise<void>;
  setStoreStatus: (isOpen: boolean) => Promise<void>;
  /** Sync isOpen from React Query cache (useMyStore) — no extra HTTP GET */
  fetchStoreStatus: () => Promise<void>;
  syncFromStoreData: (store: StoreData | null | undefined) => void;
  getStoreStatus: () => {
    isOpen: boolean;
    statusText: string;
    statusColor: string;
    lastUpdated: string;
  };
}

const getToken = async (): Promise<string | undefined> => {
  const { supabase } = await import('@/lib/supabase/client');
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
};

const updateStoreStatusInBackend = async (isOpen: boolean) => {
  const token = await getToken();

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

  return response.json();
};

const readStoreFromQueryCache = (): StoreData | undefined => {
  const qc = getAppQueryClient();
  return qc?.getQueryData<StoreData>(queryKeys.myStore.all());
};

export const useStoreState = create<StoreState>()(
  persist(
    (set, get) => ({
      isStoreOpen: false,
      lastUpdated: new Date().toISOString(),
      isLoading: false,
      error: null,

      syncFromStoreData: (store) => {
        if (store?.isOpen === undefined) return;
        set({
          isStoreOpen: store.isOpen,
          lastUpdated: new Date().toISOString(),
          error: null,
        });
      },

      fetchStoreStatus: async () => {
        const cached = readStoreFromQueryCache();
        if (cached?.isOpen !== undefined) {
          get().syncFromStoreData(cached);
          return;
        }
        const qc = getAppQueryClient();
        await qc?.invalidateQueries({ queryKey: queryKeys.myStore.all() });
      },

      toggleStore: async () => {
        const newStatus = !get().isStoreOpen;
        set({ isLoading: true, error: null });

        try {
          set({
            isStoreOpen: newStatus,
            lastUpdated: new Date().toISOString(),
          });

          await updateStoreStatusInBackend(newStatus);

          const qc = getAppQueryClient();
          await qc?.invalidateQueries({ queryKey: queryKeys.myStore.all() });
          const updated = readStoreFromQueryCache();
          if (updated?.isOpen !== undefined) {
            set({ isStoreOpen: updated.isOpen });
          }
        } catch (error) {
          set({
            isStoreOpen: !newStatus,
            error:
              error instanceof Error
                ? error.message
                : 'Fehler beim Ändern des Geschäftsstatus',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      setStoreStatus: async (isOpen: boolean) => {
        set({ isLoading: true, error: null });

        try {
          set({
            isStoreOpen: isOpen,
            lastUpdated: new Date().toISOString(),
          });

          await updateStoreStatusInBackend(isOpen);

          const qc = getAppQueryClient();
          await qc?.invalidateQueries({ queryKey: queryKeys.myStore.all() });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Fehler beim Setzen des Geschäftsstatus',
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
      version: 3,
      partialize: (state) => ({
        isStoreOpen: state.isStoreOpen,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
