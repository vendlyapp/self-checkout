'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/config/api';
import type { ProductsAnalyticsData, ProductData, CategoryData } from '@/components/dashboard/products/types';
import { mockProductsAnalyticsData } from '@/components/dashboard/products/data';

/**
 * Hook para obtener analytics de productos usando React Query
 */
export const useProductsAnalytics = () => {
  return useQuery({
    queryKey: ['productsAnalytics'],
    queryFn: async ({ signal }) => {
      try {
        // Obtener token de Supabase
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Fetch products stats and categories stats in parallel
        const [productsStatsResponse, categoriesStatsResponse, productsResponse, categoriesResponse] = await Promise.all([
          // Product stats
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PRODUCT_STATS), {
            headers: getAuthHeaders(token),
            signal,
          }).then(res => res.ok ? res.json() : { success: false }),
          
          // Category stats
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORY_STATS), {
            headers: getAuthHeaders(token),
            signal,
          }).then(res => res.ok ? res.json() : { success: false }),
          
          // Get all products
          ProductService.getProducts({ limit: 1000 }, { signal }),
          
          // Get all categories
          fetch(buildApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES), {
            headers: getAuthHeaders(token),
            signal,
          }).then(res => res.ok ? res.json() : { success: false }),
        ]);

        // Get products stats
        const productsStats = productsStatsResponse.success && productsStatsResponse.data
          ? productsStatsResponse.data
          : null;

        // Get categories stats
        const categoriesStats = categoriesStatsResponse.success && categoriesStatsResponse.data
          ? categoriesStatsResponse.data
          : null;

        // Get all products to calculate trends
        const allProducts = productsResponse.success && productsResponse.data
          ? productsResponse.data
          : [];

        // Get all categories
        const allCategories = categoriesResponse.success && categoriesResponse.data
          ? categoriesResponse.data
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

        const productData: ProductData = {
          total: totalProducts,
          trend: newProducts > 0 ? 'up' : 'neutral',
          trendData,
          newProducts,
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
          total: totalCategories,
          trend: newCategories > 0 ? 'up' : 'neutral',
          trendData: categoryTrendData,
          newCategories,
        };

        // Asegurar que siempre retornamos una estructura válida
        const result: ProductsAnalyticsData = {
          products: productData,
          categories: categoriesData,
          lastUpdated: new Date().toISOString(),
        };
        
        // Validar que la estructura esté completa
        if (!result.products || !result.categories) {
          console.warn('Incomplete data structure, using fallback');
          return mockProductsAnalyticsData;
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching products analytics, falling back to mock data:', error);
        // Fallback to mock data
        return mockProductsAnalyticsData;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'CANCELLED') {
        return false;
      }
      return failureCount < 2;
    },
  });
};

