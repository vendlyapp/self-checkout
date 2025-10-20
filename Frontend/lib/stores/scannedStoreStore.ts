import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface StoreInfo {
  id: string
  name: string
  slug: string
  logo: string | null
}

interface ScannedStoreState {
  store: StoreInfo | null
  setStore: (store: StoreInfo) => void
  clearStore: () => void
}

export const useScannedStoreStore = create<ScannedStoreState>()(
  persist(
    (set) => ({
      store: null,
      setStore: (store) => set({ store }),
      clearStore: () => set({ store: null }),
    }),
    {
      name: 'scanned-store-storage',
    }
  )
)

