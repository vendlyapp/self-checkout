import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductsAnalyticsData } from '@/components/dashboard/products/types';

interface ProductsAnalyticsState {
  data: ProductsAnalyticsData | null;
  lastFetched: number | null;
  isLoading: boolean;
  setData: (data: ProductsAnalyticsData) => void;
  clearData: () => void;
  isStale: (maxAge?: number) => boolean; // maxAge en milisegundos, default 5 minutos
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos por defecto

export const useProductsAnalyticsStore = create<ProductsAnalyticsState>()(
  persist(
    (set, get) => ({
      data: null,
      lastFetched: null,
      isLoading: false,

      setData: (data: ProductsAnalyticsData) => {
        set({
          data,
          lastFetched: Date.now(),
          isLoading: false,
        });
      },

      clearData: () => {
        set({
          data: null,
          lastFetched: null,
        });
      },

      isStale: (maxAge: number = CACHE_DURATION) => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > maxAge;
      },
    }),
    {
      name: 'products-analytics-storage',
      partialize: (state) => ({
        data: state.data,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => (state) => {
        // No reutilizar analytics con total 0 tras un fallo anterior en prod
        if (state?.data && (state.data.products?.total ?? 0) === 0) {
          state.clearData();
        }
      },
    }
  )
);

