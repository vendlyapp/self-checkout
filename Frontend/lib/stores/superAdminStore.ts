import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SuperAdminService } from '@/lib/services/superAdminService';
import type { PlatformStats, Store, User, Product } from '@/lib/services/superAdminService';

interface SuperAdminState {
  // State
  stats: PlatformStats | null;
  stores: Store[];
  users: User[];
  products: Product[];
  
  // Loading states
  statsLoading: boolean;
  storesLoading: boolean;
  usersLoading: boolean;
  productsLoading: boolean;
  
  // Error states
  statsError: string | null;
  storesError: string | null;
  usersError: string | null;
  productsError: string | null;
  
  // Cache timestamps
  statsLastFetch: number | null;
  storesLastFetch: number | null;
  usersLastFetch: number | null;
  productsLastFetch: number | null;
  
  // Actions
  fetchStats: (force?: boolean) => Promise<void>;
  fetchStores: (force?: boolean) => Promise<void>;
  fetchUsers: (force?: boolean) => Promise<void>;
  fetchProducts: (force?: boolean) => Promise<void>;
  toggleStoreStatus: (storeId: string, isActive: boolean) => Promise<void>;
  
  // Utilities
  clearCache: () => void;
  refreshAll: () => Promise<void>;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useSuperAdminStore = create<SuperAdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      stats: null,
      stores: [],
      users: [],
      products: [],
      
      statsLoading: false,
      storesLoading: false,
      usersLoading: false,
      productsLoading: false,
      
      statsError: null,
      storesError: null,
      usersError: null,
      productsError: null,
      
      statsLastFetch: null,
      storesLastFetch: null,
      usersLastFetch: null,
      productsLastFetch: null,
      
      // Fetch stats
      fetchStats: async (force = false) => {
        const { statsLastFetch, stats } = get();
        const now = Date.now();
        
        // Use cache if valid and not forced
        if (!force && statsLastFetch && stats && (now - statsLastFetch) < CACHE_DURATION) {
          return;
        }
        
        // Only set loading if we don't have data or forcing
        if (!stats || force) {
          set({ statsLoading: true, statsError: null });
        }
        
        try {
          const response = await SuperAdminService.getPlatformStats();
          if (response.success && response.data) {
            set({
              stats: response.data,
              statsLastFetch: now,
              statsLoading: false,
            });
          } else {
            set({
              statsError: response.error || 'Error loading statistics',
              statsLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching stats:', error);
            set({
              statsError: error instanceof Error ? error.message : 'Network error',
            statsLoading: false,
          });
        }
      },
      
      // Fetch stores
      fetchStores: async (force = false) => {
        const { storesLastFetch, stores } = get();
        const now = Date.now();
        
        // Use cache if valid and not forced
        if (!force && storesLastFetch && stores.length > 0 && (now - storesLastFetch) < CACHE_DURATION) {
          return;
        }
        
        // Only set loading if we don't have data or forcing
        if (stores.length === 0 || force) {   
          set({ storesLoading: true, storesError: null });
        }
        
        try {
          const response = await SuperAdminService.getAllStores();
          if (response.success && response.data) {
            set({
              stores: response.data,
              storesLastFetch: now,
              storesLoading: false,
            });
          } else {
            set({
              storesError: response.error || 'Error loading stores',
              storesLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching stores:', error);
          set({
            storesError: error instanceof Error ? error.message : 'Network error',
            storesLoading: false,
          });
        }
      },
      
      // Fetch users
      fetchUsers: async (force = false) => {
        const { usersLastFetch, users } = get();
        const now = Date.now();
        
        // Use cache if valid and not forced
        if (!force && usersLastFetch && users.length > 0 && (now - usersLastFetch) < CACHE_DURATION) {
          return;
        }
        
        // Only set loading if we don't have data or forcing
        if (users.length === 0 || force) {
          set({ usersLoading: true, usersError: null });
        }
        
        try {
          const response = await SuperAdminService.getAllUsers();
          if (response.success && response.data) {
            set({
              users: response.data,
              usersLastFetch: now,
              usersLoading: false,
            });
          } else {
            set({
              usersError: response.error || 'Error loading users',
              usersLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          set({
            usersError: error instanceof Error ? error.message : 'Network error',
            usersLoading: false,
          });
        }
      },
      
      // Fetch products
      fetchProducts: async (force = false) => {
        const { productsLastFetch, products } = get();
        const now = Date.now();
        
        // Use cache if valid and not forced
        if (!force && productsLastFetch && products.length > 0 && (now - productsLastFetch) < CACHE_DURATION) {
          return;
        }
        
        // Only set loading if we don't have data or forcing
        if (products.length === 0 || force) {
          set({ productsLoading: true, productsError: null });
        }
        
        try {
          const response = await SuperAdminService.getAllProducts();
          if (response.success && response.data) {
            set({
              products: response.data,
              productsLastFetch: now,
              productsLoading: false,
            });
          } else {
            set({
              productsError: response.error || 'Error loading products',
              productsLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          set({
            productsError: error instanceof Error ? error.message : 'Network error',
            productsLoading: false,
          });
        }
      },
      
      // Toggle store status
      toggleStoreStatus: async (storeId: string, isActive: boolean) => {
        try {
          const response = await SuperAdminService.toggleStoreStatus(storeId, isActive);
          if (response.success) {
            // Update store in local state
            set((state) => ({
              stores: state.stores.map((store) =>
                store.id === storeId ? { ...store, isActive } : store
              ),
            }));
            
            // Invalidate stats cache to refresh numbers
            set({ statsLastFetch: null });
          }
        } catch (error) {
          console.error('Error toggling store status:', error);
          throw error;
        }
      },
      
      // Clear all cache
      clearCache: () => {
        set({
          statsLastFetch: null,
          storesLastFetch: null,
          usersLastFetch: null,
          productsLastFetch: null,
        });
      },
      
      // Refresh all data
      refreshAll: async () => {
        await Promise.all([
          get().fetchStats(true),
          get().fetchStores(true),
          get().fetchUsers(true),
          get().fetchProducts(true),
        ]);
      },
    }),
    {
      name: 'super-admin-storage',
      partialize: (state) => ({
        stats: state.stats,
        stores: state.stores,
        users: state.users,
        products: state.products,
        statsLastFetch: state.statsLastFetch,
        storesLastFetch: state.storesLastFetch,
        usersLastFetch: state.usersLastFetch,
        productsLastFetch: state.productsLastFetch,
        // DO NOT save loading states
      }),
      // Ensure loading is always false on hydrate
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.statsLoading = false;
          state.storesLoading = false;
          state.usersLoading = false;
          state.productsLoading = false;
        }
      },
    }
  )
);
