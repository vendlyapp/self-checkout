import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SuperAdminService } from '@/lib/services/superAdminService';
import type { PlatformStats, Store, User, Product } from '@/lib/services/superAdminService';
import { AnalyticsService } from '@/lib/services/analyticsService';
import type {
  SalesOverTimePoint,
  StorePerformanceEntry,
  TopProductEntry,
  ActiveOverview,
  ActiveStoreEntry,
} from '@/lib/services/analyticsService';

interface SuperAdminState {
  // State
  stats: PlatformStats | null;
  stores: Store[];
  users: User[];
  products: Product[];
  salesOverTime: SalesOverTimePoint[];
  storePerformance: StorePerformanceEntry[];
  topProducts: TopProductEntry[];
  activeOverview: ActiveOverview | null;
  activeStores: ActiveStoreEntry[];
  
  // Loading states
  statsLoading: boolean;
  storesLoading: boolean;
  usersLoading: boolean;
  productsLoading: boolean;
  salesOverTimeLoading: boolean;
  storePerformanceLoading: boolean;
  topProductsLoading: boolean;
  activeOverviewLoading: boolean;
  activeStoresLoading: boolean;
  
  // Error states
  statsError: string | null;
  storesError: string | null;
  usersError: string | null;
  productsError: string | null;
  salesOverTimeError: string | null;
  storePerformanceError: string | null;
  topProductsError: string | null;
  activeOverviewError: string | null;
  activeStoresError: string | null;
  
  // Cache timestamps
  statsLastFetch: number | null;
  storesLastFetch: number | null;
  usersLastFetch: number | null;
  productsLastFetch: number | null;
  salesOverTimeLastFetch: number | null;
  storePerformanceLastFetch: number | null;
  topProductsLastFetch: number | null;
  activeOverviewLastFetch: number | null;
  activeStoresLastFetch: number | null;
  
  // Actions
  fetchStats: (force?: boolean) => Promise<void>;
  fetchStores: (force?: boolean) => Promise<void>;
  fetchUsers: (force?: boolean) => Promise<void>;
  fetchProducts: (force?: boolean) => Promise<void>;
  fetchSalesOverTime: (force?: boolean) => Promise<void>;
  fetchStorePerformance: (force?: boolean) => Promise<void>;
  fetchTopProducts: (force?: boolean) => Promise<void>;
  fetchActiveOverview: (force?: boolean) => Promise<void>;
  fetchActiveStores: (force?: boolean) => Promise<void>;
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
      salesOverTime: [],
      storePerformance: [],
      topProducts: [],
      activeOverview: null,
      activeStores: [],
      
      statsLoading: false,
      storesLoading: false,
      usersLoading: false,
      productsLoading: false,
      salesOverTimeLoading: false,
      storePerformanceLoading: false,
      topProductsLoading: false,
      activeOverviewLoading: false,
      activeStoresLoading: false,
      
      statsError: null,
      storesError: null,
      usersError: null,
      productsError: null,
      salesOverTimeError: null,
      storePerformanceError: null,
      topProductsError: null,
      activeOverviewError: null,
      activeStoresError: null,
      
      statsLastFetch: null,
      storesLastFetch: null,
      usersLastFetch: null,
      productsLastFetch: null,
      salesOverTimeLastFetch: null,
      storePerformanceLastFetch: null,
      topProductsLastFetch: null,
      activeOverviewLastFetch: null,
      activeStoresLastFetch: null,
      
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
      
      // Fetch sales over time
      fetchSalesOverTime: async (force = false) => {
        const { salesOverTimeLastFetch, salesOverTime } = get();
        const now = Date.now();

        if (!force && salesOverTimeLastFetch && salesOverTime.length > 0 && (now - salesOverTimeLastFetch) < CACHE_DURATION) {
          return;
        }

        if (salesOverTime.length === 0 || force) {
          set({ salesOverTimeLoading: true, salesOverTimeError: null });
        }

        try {
          const response = await AnalyticsService.getSalesOverTime();
          if (response.success && response.data) {
            const normalized = response.data.map((point) => ({
              ...point,
              bucket: (() => {
                const parsed = new Date(point.bucket);
                return Number.isNaN(parsed.getTime()) ? String(point.bucket) : parsed.toISOString();
              })(),
            }));

            set({
              salesOverTime: normalized,
              salesOverTimeLastFetch: now,
              salesOverTimeLoading: false,
            });
          } else {
            set({
              salesOverTimeError: response.error || 'Error loading sales over time',
              salesOverTimeLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching sales over time:', error);
          set({
            salesOverTimeError: error instanceof Error ? error.message : 'Network error',
            salesOverTimeLoading: false,
          });
        }
      },

      // Fetch store performance
      fetchStorePerformance: async (force = false) => {
        const { storePerformanceLastFetch, storePerformance } = get();
        const now = Date.now();

        if (!force && storePerformanceLastFetch && storePerformance.length > 0 && (now - storePerformanceLastFetch) < CACHE_DURATION) {
          return;
        }

        if (storePerformance.length === 0 || force) {
          set({ storePerformanceLoading: true, storePerformanceError: null });
        }

        try {
          const response = await AnalyticsService.getStorePerformance();
          if (response.success && response.data) {
            const normalized = response.data.map((entry) => ({
              ...entry,
              avgOrderValue: entry.orders > 0 ? entry.revenue / entry.orders : 0,
            }));

            set({
              storePerformance: normalized,
              storePerformanceLastFetch: now,
              storePerformanceLoading: false,
            });
          } else {
            set({
              storePerformanceError: response.error || 'Error loading store performance',
              storePerformanceLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching store performance:', error);
          set({
            storePerformanceError: error instanceof Error ? error.message : 'Network error',
            storePerformanceLoading: false,
          });
        }
      },

      // Fetch top products
      fetchTopProducts: async (force = false) => {
        const { topProductsLastFetch, topProducts } = get();
        const now = Date.now();

        if (!force && topProductsLastFetch && topProducts.length > 0 && (now - topProductsLastFetch) < CACHE_DURATION) {
          return;
        }

        if (topProducts.length === 0 || force) {
          set({ topProductsLoading: true, topProductsError: null });
        }

        try {
          const response = await AnalyticsService.getTopProducts({ limit: 10, metric: 'revenue' });
          if (response.success && response.data) {
            set({
              topProducts: response.data,
              topProductsLastFetch: now,
              topProductsLoading: false,
            });
          } else {
            set({
              topProductsError: response.error || 'Error loading top products',
              topProductsLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching top products:', error);
          set({
            topProductsError: error instanceof Error ? error.message : 'Network error',
            topProductsLoading: false,
          });
        }
      },

      // Fetch active overview
      fetchActiveOverview: async (force = false) => {
        const { activeOverviewLastFetch, activeOverview } = get();
        const now = Date.now();

        if (!force && activeOverviewLastFetch && activeOverview && (now - activeOverviewLastFetch) < CACHE_DURATION) {
          return;
        }

        if (!activeOverview || force) {
          set({ activeOverviewLoading: true, activeOverviewError: null });
        }

        try {
          const response = await AnalyticsService.getActiveOverview();
          if (response.success && response.data) {
            set({
              activeOverview: response.data,
              activeOverviewLastFetch: now,
              activeOverviewLoading: false,
            });
          } else {
            set({
              activeOverviewError: response.error || 'Error loading active overview',
              activeOverviewLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching active overview:', error);
          set({
            activeOverviewError: error instanceof Error ? error.message : 'Network error',
            activeOverviewLoading: false,
          });
        }
      },

      // Fetch active stores
      fetchActiveStores: async (force = false) => {
        const { activeStoresLastFetch, activeStores } = get();
        const now = Date.now();

        if (!force && activeStoresLastFetch && activeStores.length > 0 && (now - activeStoresLastFetch) < CACHE_DURATION) {
          return;
        }

        if (activeStores.length === 0 || force) {
          set({ activeStoresLoading: true, activeStoresError: null });
        }

        try {
          const response = await AnalyticsService.getActiveStores();
          if (response.success && response.data) {
            set({
              activeStores: response.data,
              activeStoresLastFetch: now,
              activeStoresLoading: false,
            });
          } else {
            set({
              activeStoresError: response.error || 'Error loading active stores',
              activeStoresLoading: false,
            });
          }
        } catch (error) {
          console.error('Error fetching active stores:', error);
          set({
            activeStoresError: error instanceof Error ? error.message : 'Network error',
            activeStoresLoading: false,
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
          salesOverTimeLastFetch: null,
          storePerformanceLastFetch: null,
          topProductsLastFetch: null,
          activeOverviewLastFetch: null,
          activeStoresLastFetch: null,
        });
      },
      
      // Refresh all data
      refreshAll: async () => {
        await Promise.all([
          get().fetchStats(true),
          get().fetchStores(true),
          get().fetchUsers(true),
          get().fetchProducts(true),
          get().fetchSalesOverTime(true),
          get().fetchStorePerformance(true),
          get().fetchTopProducts(true),
          get().fetchActiveOverview(true),
          get().fetchActiveStores(true),
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
        salesOverTime: state.salesOverTime,
        storePerformance: state.storePerformance,
        topProducts: state.topProducts,
        activeOverview: state.activeOverview,
        activeStores: state.activeStores,
        statsLastFetch: state.statsLastFetch,
        storesLastFetch: state.storesLastFetch,
        usersLastFetch: state.usersLastFetch,
        productsLastFetch: state.productsLastFetch,
        salesOverTimeLastFetch: state.salesOverTimeLastFetch,
        storePerformanceLastFetch: state.storePerformanceLastFetch,
        topProductsLastFetch: state.topProductsLastFetch,
        activeOverviewLastFetch: state.activeOverviewLastFetch,
        activeStoresLastFetch: state.activeStoresLastFetch,
        // DO NOT save loading states
      }),
      // Ensure loading is always false on hydrate
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.statsLoading = false;
          state.storesLoading = false;
          state.usersLoading = false;
          state.productsLoading = false;
          state.salesOverTimeLoading = false;
          state.storePerformanceLoading = false;
          state.topProductsLoading = false;
          state.activeOverviewLoading = false;
          state.activeStoresLoading = false;
        }
      },
    }
  )
);
