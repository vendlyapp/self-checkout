"use client";

import { useMemo } from "react";
import { Product, normalizeProductData } from "../products_list/data/mockProducts";
import ProductsList from "./ProductsList";
import { useCartStore } from "@/lib/stores/cartStore";
import { useProducts } from "@/hooks/queries/useProducts";

interface DashBoardChargeProps {
  searchQuery: string;
  selectedFilters: string[];
}

// Función para agrupar productos padre-hijo
const groupProductsWithVariants = (products: Product[]): Product[] => {
  // Separar productos padre (sin parentId) y variantes (con parentId)
  const parentProducts: Product[] = [];
  const variantsMap = new Map<string, Product[]>();

  products.forEach(product => {
    if (product.parentId) {
      // Es una variante
      if (!variantsMap.has(product.parentId)) {
        variantsMap.set(product.parentId, []);
      }
      variantsMap.get(product.parentId)!.push(product);
    } else {
      // Es un producto padre
      parentProducts.push(product);
    }
  });

  // Agregar variantes a sus productos padre
  return parentProducts.map(parent => {
    const variants = variantsMap.get(parent.id) || [];
    return {
      ...parent,
      variants: variants.length > 0 ? variants : undefined
    };
  });
};

export default function DashBoardCharge({
  searchQuery,
  selectedFilters,
}: DashBoardChargeProps) {
  // Usar el hook useProducts con React Query para obtener productos reales
  const { data: rawProducts = [], isLoading, isFetching } = useProducts({ 
    isActive: true 
  });

  // Usar el store global
  const { addToCart } = useCartStore();

  // handleAddToCart ahora usa addToCart del store global
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  // Procesar y filtrar productos usando useMemo para evitar recálculos innecesarios
  const products = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) {
      return [];
    }

    // Normalizar productos
    const normalizedProducts = rawProducts.map(normalizeProductData);
    
    // Agrupar productos con variantes (solo mostrar productos padre)
    const groupedProducts = groupProductsWithVariants(normalizedProducts);

    // Aplicar filtros de categorías
    let filteredProducts = groupedProducts;
    const activeCategoryFilters = selectedFilters.filter(id => id !== 'all');
    if (activeCategoryFilters.length > 0) {
      filteredProducts = filteredProducts.filter((p: Product) =>
        activeCategoryFilters.includes(p.categoryId)
      );
    }

    // Aplicar búsqueda
    if (searchQuery && searchQuery.trim() !== "") {
      const queryLower = searchQuery.toLowerCase().trim();
      filteredProducts = filteredProducts.filter((p: Product) => {
        // Buscar en nombre del producto padre
        const matchesParent = p.name.toLowerCase().includes(queryLower) ||
          (p.description && p.description.toLowerCase().includes(queryLower)) ||
          (p.sku && p.sku.toLowerCase().includes(queryLower)) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(queryLower)));
        
        // Buscar en nombres de variantes
        const matchesVariant = p.variants?.some(variant => 
          variant.name.toLowerCase().includes(queryLower) ||
          (variant.description && variant.description.toLowerCase().includes(queryLower))
        );
        
        return matchesParent || matchesVariant;
      });
    }

    return filteredProducts;
  }, [rawProducts, selectedFilters, searchQuery]);

  const loading = isLoading || isFetching;

  return (
    <>
      <ProductsList
        products={products}
        onAddToCart={handleAddToCart}
        loading={loading}
        searchQuery={searchQuery}
      />
    </>
  );
}
