'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/components/dashboard/products_list/data/mockProducts';

export const useProductByQR = (qrCode: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['product', 'qr', qrCode],
    queryFn: async ({ signal }) => {
      if (!qrCode) throw new Error('QR Code is required');
      const response = await ProductService.getProductByQR(qrCode, { signal });
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al obtener producto por QR');
      }
      return response.data as Product;
    },
    enabled: enabled && !!qrCode,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

