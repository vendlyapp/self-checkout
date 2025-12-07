import { ProductsAnalyticsData, ProductData, CategoryData } from '../types';
import { API_CONFIG, buildApiUrl, handleApiError } from '@/lib/config/api';
import { ProductService } from '@/lib/services/productService';

// Mock products data (fallback)
export const mockProductData: ProductData = {
  total: 224,
  trend: 'up',
  trendData: [180, 195, 188, 208, 196, 220, 224],
  newProducts: 8
};

// Mock categories data (fallback)
export const mockCategoryData: CategoryData = {
  total: 14,
  trend: 'up',
  trendData: [10, 11, 10, 12, 11, 13, 14],
  newCategories: 2
};

// Complete products analytics data (fallback)
export const mockProductsAnalyticsData: ProductsAnalyticsData = {
  products: mockProductData,
  categories: mockCategoryData,
  lastUpdated: new Date().toISOString()
};

// Helper functions for data manipulation
export const calculateProductGrowth = (data: number[]): number => {
  if (data.length < 2) return 0;
  const current = data[data.length - 1];
  const previous = data[data.length - 2];
  return Math.round(((current - previous) / previous) * 100);
};

export const getActiveProductsCount = (data: ProductData | null | undefined): number => {
  if (!data || typeof data.total !== 'number' || typeof data.newProducts !== 'number') {
    return 0;
  }
  return Math.max(0, data.total - data.newProducts);
};

export const getActiveCategoriesCount = (data: CategoryData | null | undefined): number => {
  if (!data || typeof data.total !== 'number' || typeof data.newCategories !== 'number') {
    return 0;
  }
  return Math.max(0, data.total - data.newCategories);
};

// Helper function to make API requests
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const url = buildApiUrl(endpoint);
    
    // Obtener token de Supabase
    const { supabase } = await import('@/lib/supabase/client');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // Si ya hay un signal en options, usar ese (React Query lo proporciona)
    const controller = options.signal ? null : new AbortController();
    const timeoutId = controller ? setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT) : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Agregar headers adicionales del options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    
    // Usar el signal de options si existe (React Query), sino usar el del controller
    const signal = options.signal || controller?.signal;
    
    const response = await fetch(url, {
      headers,
      signal,
      ...options,
    });
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Manejar error de timeout específicamente
    if (error instanceof Error && error.name === 'AbortError') {
      // Si el error no tiene mensaje, probablemente es una cancelación de React Query
      if (!error.message || error.message === 'signal is aborted without reason' || error.message.includes('aborted')) {
        // No loggear cancelaciones de React Query - es comportamiento normal
        return {
          success: false,
          error: 'Request cancelled',
        };
      }
      // Solo loggear timeouts reales (no cancelaciones)
      console.warn('Connection timeout:', error.message);
      return {
        success: false,
        error: 'Connection timeout - please try again',
      };
    }
    
    // Verificar que no sea un error de cancelación antes de loggear
    if (error instanceof Error && (
      error.message.includes('aborted') || 
      error.message.includes('cancelled') ||
      error.name === 'AbortError'
    )) {
      return {
        success: false,
        error: 'Request cancelled',
      };
    }
    
    // Solo loggear errores que no sean cancelaciones
    console.error('Error en la llamada al backend:', error);
    
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

// Real API functions - Fetch data from backend
export const fetchProductsAnalytics = async (): Promise<ProductsAnalyticsData> => {
  try {
    // Fetch products stats and categories stats in parallel
    const [productsStatsResponse, categoriesStatsResponse, productsResponse, categoriesResponse] = await Promise.all([
      makeRequest<{
        total: number;
        available: number;
        lowStock: number;
        outOfStock: number;
        unavailable: number;
      }>(API_CONFIG.ENDPOINTS.PRODUCT_STATS),
      makeRequest<{
        total: number;
        withProducts: number;
        withoutProducts: number;
      }>(API_CONFIG.ENDPOINTS.CATEGORY_STATS),
      ProductService.getProducts({ limit: 1000 }), // Get all products to calculate trends
      makeRequest<Array<{ id: string; name: string; count: number }>>(API_CONFIG.ENDPOINTS.CATEGORIES),
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
    // In a real scenario, you'd fetch historical data
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
    const baseCategoryCount = Math.max(0, totalCategories - 6);
    for (let i = 0; i < 7; i++) {
      categoryTrendData.push(baseCategoryCount + i);
    }
    categoryTrendData[6] = totalCategories; // Last value is current total

    const categoryData: CategoryData = {
      total: totalCategories,
      trend: newCategories > 0 ? 'up' : 'neutral',
      trendData: categoryTrendData,
      newCategories,
    };

    return {
      products: productData,
      categories: categoryData,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching products analytics:', error);
    // Return mock data as fallback
  return {
    ...mockProductsAnalyticsData,
      lastUpdated: new Date().toISOString(),
  };
  }
};

export const fetchProductData = async (): Promise<ProductData> => {
  try {
    const response = await makeRequest<{
      total: number;
      available: number;
      lowStock: number;
      outOfStock: number;
      unavailable: number;
    }>(API_CONFIG.ENDPOINTS.PRODUCT_STATS);

    if (response.success && response.data) {
      const total = response.data.total || 0;
      return {
        total,
        trend: 'neutral',
        trendData: [total],
        newProducts: 0,
      };
    }
  } catch (error) {
    console.error('Error fetching product data:', error);
  }
  
  return mockProductData;
};

export const fetchCategoryData = async (): Promise<CategoryData> => {
  try {
    const response = await makeRequest<{
      total: number;
      withProducts: number;
      withoutProducts: number;
    }>(API_CONFIG.ENDPOINTS.CATEGORY_STATS);

    if (response.success && response.data) {
      const total = response.data.total || 0;
      return {
        total,
        trend: 'neutral',
        trendData: [total],
        newCategories: 0,
      };
    }
  } catch (error) {
    console.error('Error fetching category data:', error);
  }
  
  return mockCategoryData;
};

// Future API endpoints - ready for backend integration
/*
  POST /api/products - Create new product
  GET /api/products - Get all products with pagination
  PUT /api/products/:id - Update product
  DELETE /api/products/:id - Delete product
  
  POST /api/categories - Create new category
  GET /api/categories - Get all categories
  PUT /api/categories/:id - Update category
  DELETE /api/categories/:id - Delete category
  
  GET /api/analytics/products - Get products analytics data
*/ 