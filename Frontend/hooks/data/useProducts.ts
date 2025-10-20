'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseProductsReturn, ProductActionsReturn, ProductsAnalyticsData } from '@/types';
import { fetchProductsAnalytics, mockProductsAnalyticsData } from '@/components/dashboard/products/data';
import { useRouter } from 'next/navigation';

/**
 * Hook para gestión de productos y analytics
 * Maneja datos de productos, categorías y estadísticas
 *
 * @returns UseProductsReturn - Estado completo de productos
 *
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useProducts();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return <ProductsList data={data} />;
 * ```
 */
// UseProductsReturn interface moved to @/types

export const useProducts = (): UseProductsReturn => {
  const [data, setData] = useState<ProductsAnalyticsData>(mockProductsAnalyticsData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchProductsAnalytics();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos de productos');
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

/**
 * Hook para acciones de productos
 * Maneja navegación y acciones relacionadas con productos
 *
 * @returns ProductActionsReturn - Funciones de acción de productos
 *
 * @example
 * ```tsx
 * const { loading, handleNewProduct, handleProductList, handleCategories } = useProductActions();
 *
 * return (
 *   <div>
 *     <button onClick={handleNewProduct}>Nuevo Producto</button>
 *     <button onClick={handleProductList}>Lista de Productos</button>
 *   </div>
 * );
 * ```
 */
// ProductActionsReturn interface moved to @/types

export const useProductActions = (): ProductActionsReturn => {
  const [loading] = useState<boolean>(false);
  const router = useRouter();

  const handleNewProduct = useCallback(async () => {
    router.push('/products_list/add_product');
  }, [router]);

  const handleProductList = useCallback(async () => {
    // Future implementation: navigate to products list page or open modal
  }, []);

  const handleCategories = useCallback(async () => {
    // Future implementation: navigate to categories page or open modal
  }, []);

  return {
    loading,
    handleNewProduct,
    handleProductList,
    handleCategories
  };
};
