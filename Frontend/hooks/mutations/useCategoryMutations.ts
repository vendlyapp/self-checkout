'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryService } from '@/lib/services/categoryService';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/lib/services/categoryService';

/**
 * Hook para crear categoría (mutation)
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await CategoryService.createCategory(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al crear categoría');
      }
      return response.data as Category;
    },
    onSuccess: () => {
      // Invalidar cache de categorías y estadísticas
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['productsAnalytics'] });
    },
  });
};

/**
 * Hook para actualizar categoría (mutation)
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryRequest }) => {
      const response = await CategoryService.updateCategory(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al actualizar categoría');
      }
      return response.data as Category;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache de categorías y del producto específico
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['productsAnalytics'] });
    },
  });
};

export interface DeleteCategoryParams {
  id: string;
  moveProductsToCategoryId?: string;
}

/**
 * Hook para eliminar categoría (mutation).
 * Solo categorías inactivas. Si tiene productos, pasar moveProductsToCategoryId.
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: string | DeleteCategoryParams) => {
      const id = typeof params === 'string' ? params : params.id;
      const moveProductsToCategoryId = typeof params === 'string' ? undefined : params.moveProductsToCategoryId;
      const response = await CategoryService.deleteCategory(id, { moveProductsToCategoryId });
      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar categoría');
      }
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.removeQueries({ queryKey: ['category', id] });
      queryClient.invalidateQueries({ queryKey: ['categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['productsAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

