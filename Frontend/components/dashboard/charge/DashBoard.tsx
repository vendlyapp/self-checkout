"use client";

import { useState, useEffect } from "react";
import { fetchProducts, Product } from "../products_list/data/mockProducts";
import ProductsList from "./ProductsList";
import { useCartStore } from "@/lib/stores/cartStore";

interface DashBoardChargeProps {
  searchQuery: string;
  selectedFilters: string[];
}

export default function DashBoardCharge({
  searchQuery,
  selectedFilters,
}: DashBoardChargeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Usar el store global
  const { addToCart } = useCartStore();

  // handleAddToCart ahora usa addToCart del store global
  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  // Cargar productos iniciales
  useEffect(() => {
    const loadInitialProducts = async () => {
      setLoading(true);
      try {
        const initialProducts = await fetchProducts();
        setProducts(initialProducts);
      } catch {
        // Error al cargar productos
      } finally {
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  // Aplicar filtros y búsqueda cuando cambien
  useEffect(() => {
    const applyFiltersAndSearch = async () => {
      setLoading(true);
      try {
        // Si hay filtros seleccionados, usar todos (no solo el primero)
        // Si no hay filtros o solo está "all", mostrar todos los productos
        const categoryIds = selectedFilters.length > 0 && !selectedFilters.includes('all')
          ? selectedFilters
          : undefined; // undefined = mostrar todos
        
        const filteredProducts = await fetchProducts({
          categoryId: categoryIds && categoryIds.length > 0 ? categoryIds[0] : "all", // Por compatibilidad con la API
          searchTerm: searchQuery,
        });
        
        // Si hay múltiples categorías seleccionadas, filtrar localmente
        let finalProducts = filteredProducts;
        if (categoryIds && categoryIds.length > 1) {
          finalProducts = filteredProducts.filter((product: Product) =>
            categoryIds.includes(product.categoryId)
          );
        } else if (categoryIds && categoryIds.length === 1) {
          // Ya está filtrado por la API, pero asegurarse de que coincida
          finalProducts = filteredProducts.filter((product: Product) =>
            product.categoryId === categoryIds[0]
          );
        }
        
        setProducts(finalProducts);
      } catch {
        // Error al filtrar productos
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    applyFiltersAndSearch();
  }, [selectedFilters, searchQuery]);

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
