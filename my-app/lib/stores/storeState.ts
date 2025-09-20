'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  isStoreOpen: boolean;
  lastUpdated: string;
  toggleStore: () => void;
  setStoreStatus: (isOpen: boolean) => void;
  getStoreStatus: () => {
    isOpen: boolean;
    statusText: string;
    statusColor: string;
    lastUpdated: string;
  };
}

export const useStoreState = create<StoreState>()(
  persist(
    (set, get) => ({
      isStoreOpen: false,
      lastUpdated: new Date().toISOString(),

      toggleStore: () => {
        const newStatus = !get().isStoreOpen;
        set({
          isStoreOpen: newStatus,
          lastUpdated: new Date().toISOString(),
        });
      },

      setStoreStatus: (isOpen: boolean) => {
        set({
          isStoreOpen: isOpen,
          lastUpdated: new Date().toISOString(),
        });
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
      version: 1,
    }
  )
);
