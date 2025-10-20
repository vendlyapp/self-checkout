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
      } catch (error) {
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
        const categoryId =
          selectedFilters.length > 0 ? selectedFilters[0] : "all";
        const filteredProducts = await fetchProducts({
          categoryId,
          searchTerm: searchQuery,
        });
        setProducts(filteredProducts);
      } catch (error) {
        // Error al filtrar productos
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
