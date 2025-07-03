import { ProductsAnalyticsData, ProductData, CategoryData } from '../types';

// Mock products data
export const mockProductData: ProductData = {
  total: 224,
  trend: 'up',
  trendData: [180, 195, 188, 208, 196, 220, 224],
  newProducts: 8
};

// Mock categories data
export const mockCategoryData: CategoryData = {
  total: 14,
  trend: 'up',
  trendData: [10, 11, 10, 12, 11, 13, 14],
  newCategories: 2
};

// Complete products analytics data
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

export const getActiveProductsCount = (data: ProductData): number => {
  return Math.max(0, data.total - data.newProducts);
};

export const getActiveCategoriesCount = (data: CategoryData): number => {
  return Math.max(0, data.total - data.newCategories);
};

// API simulation functions (ready for real backend integration)
export const fetchProductsAnalytics = async (): Promise<ProductsAnalyticsData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    ...mockProductsAnalyticsData,
    lastUpdated: new Date().toISOString()
  };
};

export const fetchProductData = async (): Promise<ProductData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockProductData;
};

export const fetchCategoryData = async (): Promise<CategoryData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
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