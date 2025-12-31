'use client';

import { useMemo } from 'react';
import { useStoreProducts } from './useStoreProducts';
import { Product } from '@/components/dashboard/products_list/data/mockProducts';

interface UseStorePromotionsOptions {
  slug: string;
  enabled?: boolean;
}

/**
 * Hook para obtener productos promocionales de una tienda con cache inteligente
 * Reutiliza el cache de useStoreProducts y filtra solo promociones
 * 
 * Cache: 10 minutos stale, 30 minutos en memoria (heredado de useStoreProducts)
 */
export const useStorePromotions = ({ slug, enabled = true }: UseStorePromotionsOptions) => {
  const { 
    data: allProducts = [], 
    isLoading, 
    isFetching,
    error 
  } = useStoreProducts({ slug, enabled });

  // Filtrar y procesar solo productos promocionales
  const promotionalProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return [];
    }

    // Procesar y filtrar productos promocionales
    const processed = allProducts.map((p: Partial<Product>) => {
      const basePrice = typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0);
      const promoPrice = p.promotionalPrice 
        ? (typeof p.promotionalPrice === 'string' ? parseFloat(p.promotionalPrice) : p.promotionalPrice) 
        : null;
      const isPromotional = p.isPromotional || (promoPrice !== null);
      
      // Si hay promoción activa, usar precio promocional como price y basePrice como originalPrice
      let finalPrice = basePrice;
      let originalPrice = p.originalPrice 
        ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : p.originalPrice) 
        : undefined;
      
      if (isPromotional && promoPrice !== null) {
        finalPrice = promoPrice;
        originalPrice = basePrice;
      }
      
      return {
        ...p,
        price: isNaN(finalPrice) ? 0 : finalPrice,
        originalPrice: originalPrice && !isNaN(originalPrice) ? originalPrice : undefined,
        stock: typeof p.stock === 'string' ? parseInt(p.stock) : (p.stock || 0),
        categoryId: p.categoryId || p.category?.toLowerCase().replace(/\s+/g, '_'),
        isOnSale: isPromotional,
        isPromotional: isPromotional,
      } as Product;
    });

    // Filtrar solo productos en promoción
    return processed.filter((p: Product) => 
      p.isOnSale || p.originalPrice || p.discountPercentage || p.promotionTitle
    );
  }, [allProducts]);

  return {
    data: promotionalProducts,
    isLoading,
    isFetching,
    error,
  };
};

