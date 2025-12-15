'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/lib/services/productService';

/**
 * Hook para crear producto (mutation)
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await ProductService.createProduct(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al crear producto');
      }
      return response.data as Product;
    },
    onSuccess: () => {
      // Invalidar cache de productos para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

/**
 * Hook para actualizar producto (mutation)
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest }) => {
      const response = await ProductService.updateProduct(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al actualizar producto');
      }
      return response.data as Product;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache de productos y del producto específico
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

/**
 * Hook para eliminar producto (mutation)
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ProductService.deleteProduct(id);
      if (!response.success) {
        throw new Error(response.error || 'Error al eliminar producto');
      }
      return id;
    },
    onSuccess: (id) => {
      // Invalidar cache de productos y remover el producto específico
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.removeQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
    },
  });
};

/**
 * Hook para actualizar stock de producto (mutation)
 */
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await ProductService.updateStock(id, quantity);
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al actualizar stock');
      }
      return response.data as Product;
    },
    onSuccess: (data, variables) => {
      // Invalidar cache del producto específico y de productos
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

