'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseProductsReturn, ProductsAnalyticsData } from '../types';
import { fetchProductsAnalytics, mockProductsAnalyticsData } from '../data';

export const useProducts = (): UseProductsReturn => {
  const [data, setData] = useState<ProductsAnalyticsData>(mockProductsAnalyticsData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, using mock data
      // In production, this would call the real API
      const result = await fetchProductsAnalytics();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de productos');
      console.error('Error fetching products data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

// Additional hook for product actions (ready for backend integration)
export const useProductActions = () => {
  const [loading] = useState<boolean>(false);

  const handleNewProduct = useCallback(async () => {
    console.log('Crear nuevo producto');
    // Future implementation:
    // try {
    //   setLoading(true);
    //   const result = await createProduct(productData);
    //   return result;
    // } catch (error) {
    //   console.error('Error creating product:', error);
    //   throw error;
    // } finally {
    //   setLoading(false);
    // }
  }, []);

  const handleProductList = useCallback(async () => {
    console.log('Ver lista de productos');
    // Future implementation:
    // navigate to products list page or open modal
  }, []);

  const handleCategories = useCallback(async () => {
    console.log('Gestionar categorías');
    // Future implementation:
    // navigate to categories page or open modal
  }, []);

  return {
    loading,
    handleNewProduct,
    handleProductList,
    handleCategories
  };
}; 