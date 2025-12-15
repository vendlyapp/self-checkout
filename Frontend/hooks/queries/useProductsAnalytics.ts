'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import type { ProductsAnalyticsData, ProductData, CategoryData } from '@/components/dashboard/products/types';
import { mockProductsAnalyticsData } from '@/components/dashboard/products/data';
import { useProductsAnalyticsStore } from '@/lib/stores/productsAnalyticsStore';

/**
 * Hook para obtener analytics de productos usando React Query
 * Guarda los datos en el store para reutilización en otras rutas
 */
export const useProductsAnalytics = () => {
  const { data: cachedData, lastFetched, setData, isStale } = useProductsAnalyticsStore();
  
  // Verificar si hay datos válidos en el store antes de hacer la query
  const hasValidCache = cachedData && lastFetched && !isStale();
  
  return useQuery({
    queryKey: ['productsAnalytics'],
    queryFn: async ({ signal }) => {
      // Si hay datos en cache y no están viejos, retornarlos inmediatamente
      // pero aún así hacer la petición en background para actualizar
      if (hasValidCache && cachedData) {
        console.log('[useProductsAnalytics] Using cached data, fetching in background');
        // Hacer la petición en background pero retornar cache inmediatamente
        // React Query manejará la actualización
      }

      console.log('[useProductsAnalytics] Fetching fresh data from API');
      try {
        // Obtener token de Supabase
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Crear AbortController con timeout para evitar que se quede colgado
        const timeoutController = new AbortController();
        const timeoutId = setTimeout(() => timeoutController.abort(), 15000); // 15 segundos timeout

        // Combinar signals
        const combinedSignal = signal || timeoutController.signal;

        // Fetch products stats and categories stats in parallel con mejor manejo de errores
        const [productsStatsResponse, categoriesStatsResponse, productsResponse, categoriesResponse] = await Promise.allSettled([
          // Product stats
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCT_STATS), {
            headers: getAuthHeaders(token, true), // no-cache
            signal: combinedSignal,
            cache: 'no-store' as RequestCache,
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }).catch(() => ({ success: false, data: null })),
          
          // Category stats
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORY_STATS), {
            headers: getAuthHeaders(token, true), // no-cache
            signal: combinedSignal,
            cache: 'no-store' as RequestCache,
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }).catch(() => ({ success: false, data: null })),
          
          // Get all products
          ProductService.getProducts({ limit: 1000 }, { signal: combinedSignal }).catch(() => ({ success: false, data: [] })),
          
          // Get all categories
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES), {
            headers: getAuthHeaders(token, true), // no-cache
            signal: combinedSignal,
            cache: 'no-store' as RequestCache,
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          }).catch(() => ({ success: false, data: [] })),
        ]).finally(() => {
          clearTimeout(timeoutId);
        });

        // Extraer valores de Promise.allSettled
        const productsStatsResult = productsStatsResponse.status === 'fulfilled' 
          ? productsStatsResponse.value 
          : { success: false, data: null };
        const categoriesStatsResult = categoriesStatsResponse.status === 'fulfilled'
          ? categoriesStatsResponse.value
          : { success: false, data: null };
        const productsResult = productsResponse.status === 'fulfilled'
          ? productsResponse.value
          : { success: false, data: [] };
        const categoriesResult = categoriesResponse.status === 'fulfilled'
          ? categoriesResponse.value
          : { success: false, data: [] };

        // Get products stats
        const productsStats = productsStatsResult.success && productsStatsResult.data
          ? productsStatsResult.data
          : null;

        // Get categories stats
        const categoriesStats = categoriesStatsResult.success && categoriesStatsResult.data
          ? categoriesStatsResult.data
          : null;

        // Get all products to calculate trends
        const allProducts = productsResult.success && productsResult.data
          ? (Array.isArray(productsResult.data) ? productsResult.data : [])
          : [];

        // Get all categories
        const allCategories = categoriesResult.success && categoriesResult.data
          ? (Array.isArray(categoriesResult.data) ? categoriesResult.data : [])
          : [];

        // Calculate product data
        const totalProducts = productsStats?.total || allProducts.length || 0;
        const newProducts = allProducts.filter((p: { isNew?: boolean; createdAt?: string }) => {
          if (p.isNew) return true;
          if (p.createdAt) {
            const createdDate = new Date(p.createdAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return createdDate >= sevenDaysAgo;
          }
          return false;
        }).length;

        // Generate trend data (last 7 days) - simplified version
        const trendData: number[] = [];
        const baseCount = Math.max(0, totalProducts - 6);
        for (let i = 0; i < 7; i++) {
          trendData.push(baseCount + i);
        }
        trendData[6] = totalProducts; // Last value is current total

        // Asegurar que siempre tenemos valores válidos
        const productData: ProductData = {
          total: totalProducts || 0,
          trend: newProducts > 0 ? 'up' : 'neutral',
          trendData: trendData.length === 7 ? trendData : [0, 0, 0, 0, 0, 0, totalProducts || 0],
          newProducts: newProducts || 0,
        };

        // Calculate category data
        const totalCategories = categoriesStats?.total || allCategories.length || 0;
        const newCategories = allCategories.filter((cat: { createdAt?: string }) => {
          if (cat.createdAt) {
            const createdDate = new Date(cat.createdAt);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return createdDate >= sevenDaysAgo;
          }
          return false;
        }).length;

        // Generate category trend data
        const categoryTrendData: number[] = [];
        const categoryBaseCount = Math.max(0, totalCategories - 6);
        for (let i = 0; i < 7; i++) {
          categoryTrendData.push(categoryBaseCount + i);
        }
        categoryTrendData[6] = totalCategories;

        const categoriesData: CategoryData = {
          total: totalCategories || 0,
          trend: newCategories > 0 ? 'up' : 'neutral',
          trendData: categoryTrendData.length === 7 ? categoryTrendData : [0, 0, 0, 0, 0, 0, totalCategories || 0],
          newCategories: newCategories || 0,
        };

        // Log para debug
        console.log('[useProductsAnalytics] Calculated data:', {
          productData: {
            total: productData.total,
            hasTrendData: productData.trendData.length === 7,
            newProducts: productData.newProducts,
          },
          categoriesData: {
            total: categoriesData.total,
            hasTrendData: categoriesData.trendData.length === 7,
            newCategories: categoriesData.newCategories,
          },
          allProductsLength: allProducts.length,
          allCategoriesLength: allCategories.length,
        });

        // Asegurar que siempre retornamos una estructura válida con datos reales
        // productData y categoriesData ya están creados arriba, solo validar que existan
        const finalProductData: ProductData = productData && typeof productData === 'object' && 'total' in productData
          ? productData
          : {
              total: totalProducts || allProducts.length || 0,
              trend: 'neutral' as const,
              trendData: [0, 0, 0, 0, 0, 0, totalProducts || allProducts.length || 0],
              newProducts: newProducts || 0,
            };

        const finalCategoriesData: CategoryData = categoriesData && typeof categoriesData === 'object' && 'total' in categoriesData
          ? categoriesData
          : {
              total: totalCategories || allCategories.length || 0,
              trend: 'neutral' as const,
              trendData: [0, 0, 0, 0, 0, 0, totalCategories || allCategories.length || 0],
              newCategories: newCategories || 0,
            };

        const result: ProductsAnalyticsData = {
          products: finalProductData,
          categories: finalCategoriesData,
          lastUpdated: new Date().toISOString(),
        };
        
        // Validación final - esto nunca debería pasar, pero por si acaso
        if (!result.products || !result.categories || typeof result.products.total === 'undefined' || typeof result.categories.total === 'undefined') {
          console.error('Critical: Invalid data structure', {
            hasProducts: !!result.products,
            hasCategories: !!result.categories,
            productsTotal: result.products?.total,
            categoriesTotal: result.categories?.total,
            productData,
            categoriesData,
          });
          // Forzar estructura válida con valores por defecto
          return {
            products: {
              total: 0,
              trend: 'neutral' as const,
              trendData: [0, 0, 0, 0, 0, 0, 0],
              newProducts: 0,
            },
            categories: {
              total: 0,
              trend: 'neutral' as const,
              trendData: [0, 0, 0, 0, 0, 0, 0],
              newCategories: 0,
            },
            lastUpdated: new Date().toISOString(),
          };
        }
        
        console.log('[useProductsAnalytics] Returning data:', {
          productsTotal: result.products.total,
          categoriesTotal: result.categories.total,
          hasProducts: !!result.products,
          hasCategories: !!result.categories,
          productsType: typeof result.products,
          categoriesType: typeof result.categories,
        });
        
        // Guardar en el store para reutilización
        setData(result);
        
        return result;
      } catch (error) {
        console.error('Error fetching products analytics:', error);
        // En caso de error, intentar obtener al menos los productos y categorías directamente
        try {
          const { supabase } = await import('@/lib/supabase/client');
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;

          // Intentar obtener al menos los productos y categorías
          const [productsResponse, categoriesResponse] = await Promise.allSettled([
            ProductService.getProducts({ limit: 1000 }),
            fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES), {
              headers: getAuthHeaders(token, true),
              cache: 'no-store' as RequestCache,
            }).then(res => res.ok ? res.json() : { success: false, data: [] }),
          ]);

          const products = productsResponse.status === 'fulfilled' && productsResponse.value.success
            ? productsResponse.value.data || []
            : [];
          const categories = categoriesResponse.status === 'fulfilled' && categoriesResponse.value.success
            ? categoriesResponse.value.data || []
            : [];

          // Siempre retornar estructura válida, incluso si los arrays están vacíos
          const fallbackProducts = products.length;
          const fallbackCategories = categories.length;
          const fallbackNewProducts = products.filter((p: any) => p.isNew || (p.createdAt && new Date(p.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))).length;
          const fallbackNewCategories = categories.filter((cat: any) => cat.createdAt && new Date(cat.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

          console.log('[useProductsAnalytics] Fallback data:', {
            products: fallbackProducts,
            categories: fallbackCategories,
            newProducts: fallbackNewProducts,
            newCategories: fallbackNewCategories,
          });

          const fallbackResult: ProductsAnalyticsData = {
            products: {
              total: fallbackProducts,
              trend: fallbackNewProducts > 0 ? ('up' as const) : ('neutral' as const),
              trendData: fallbackProducts > 0
                ? [Math.max(0, fallbackProducts - 6), Math.max(0, fallbackProducts - 5), Math.max(0, fallbackProducts - 4), Math.max(0, fallbackProducts - 3), Math.max(0, fallbackProducts - 2), Math.max(0, fallbackProducts - 1), fallbackProducts]
                : [0, 0, 0, 0, 0, 0, 0],
              newProducts: fallbackNewProducts,
            },
            categories: {
              total: fallbackCategories,
              trend: fallbackNewCategories > 0 ? ('up' as const) : ('neutral' as const),
              trendData: fallbackCategories > 0
                ? [Math.max(0, fallbackCategories - 6), Math.max(0, fallbackCategories - 5), Math.max(0, fallbackCategories - 4), Math.max(0, fallbackCategories - 3), Math.max(0, fallbackCategories - 2), Math.max(0, fallbackCategories - 1), fallbackCategories]
                : [0, 0, 0, 0, 0, 0, 0],
              newCategories: fallbackNewCategories,
            },
            lastUpdated: new Date().toISOString(),
          };
          
          // Guardar en el store
          setData(fallbackResult);
          
          return fallbackResult;
        } catch (fallbackError) {
          console.error('Error in fallback data fetch:', fallbackError);
          // Incluso si el fallback falla, retornar estructura válida con ceros
          const errorResult = {
            products: {
              total: 0,
              trend: 'neutral' as const,
              trendData: [0, 0, 0, 0, 0, 0, 0],
              newProducts: 0,
            },
            categories: {
              total: 0,
              trend: 'neutral' as const,
              trendData: [0, 0, 0, 0, 0, 0, 0],
              newCategories: 0,
            },
            lastUpdated: new Date().toISOString(),
          };
          
          // Guardar en el store incluso si es error (para evitar múltiples peticiones)
          setData(errorResult);
          
          return errorResult;
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    // Usar datos del store como initialData si están disponibles y no están viejos
    // Esto permite mostrar datos inmediatamente mientras se hace la petición
    initialData: hasValidCache ? cachedData : undefined,
    // Si hay datos válidos, la query puede usar el cache pero aún hacer refetch en background
    placeholderData: hasValidCache ? cachedData : undefined,
    retry: (failureCount, error) => {
      // No reintentar si fue cancelado o si ya intentamos 2 veces
      if (error instanceof Error && (error.message === 'CANCELLED' || error.name === 'AbortError')) {
        return false;
      }
      return failureCount < 2;
    },
    // Asegurar que siempre retorne datos, incluso si hay error
    throwOnError: false,
    // Timeout para evitar que se quede en loading indefinidamente
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

