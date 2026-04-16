'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProductActionsReturn } from '@/types';
import { useRouter } from 'next/navigation';
import { useProductsAnalytics } from '@/hooks/queries/useProductsAnalytics';
import type { UseProductsReturn } from '@/types';

/**
 * Hook para gestión de productos y analytics
 * Ahora usa React Query para cache y mejor manejo de estado
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
export const useProducts = (): UseProductsReturn => {
  const queryClient = useQueryClient();
  
  // Usar React Query para obtener analytics de productos
  const { data, isLoading: loading, error, refetch } = useProductsAnalytics();

  // Función para refrescar datos (invalidar cache)
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['productsAnalytics'] });
  };

  return {
    data: data ?? null,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Fehler beim Laden der Produktdaten') : null,
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
    router.push('/products_list');
  }, [router]);

  const handleCategories = useCallback(async () => {
    router.push('/categories');
  }, [router]);

  const handleDiscounts = useCallback(async () => {
    router.push('/store/discounts');
  }, [router]);

  return {
    loading,
    handleNewProduct,
    handleProductList,
    handleCategories,
    handleDiscounts,
  };
};
