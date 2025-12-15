"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Product,
  productCategories,
  normalizeProductData,
} from "./data/mockProducts";
import { useProducts } from "@/hooks/queries";
import { getIcon } from "./data/iconMap";
import ProductCardList from "./ProductCardList";
import FilterModal, { FilterState } from "./FilterModal";
import { useProductsList } from "./ProductsListContext";
import FixedHeaderContainer from "./FixedHeaderContainer";

interface ProductsListComponentProps {
  isStandalone?: boolean; // Si es true, es la página dedicada. Si es false, es parte del dashboard
  onProductClick?: (product: Product) => void;
  className?: string;
  maxHeight?: string; // Altura máxima para el contenedor con scroll
  title?: string;
  showAddButton?: boolean;
}

// Convertir categorías a formato FilterOption (contadores se actualizarán dinámicamente)
const productsListFilters = productCategories.map((category) => {
  return {
    id: category.id,
    label: category.name,
    icon: getIcon(category.icon),
    count: 0, // Se actualizará dinámicamente
  };
});

export default function ProductsListComponent({
  isStandalone = false,
  onProductClick,
  className = "",
  maxHeight = "100vh",
}: ProductsListComponentProps) {
  // Estado local para cuando NO es standalone
  const [, setLocalSelectedFilters] = useState<string[]>(
    []
  );
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localFilterState, setLocalFilterState] = useState<FilterState>({
    sortBy: "name" as const,
    categories: ["all"],
    status: "all" as const,
    priceRange: { min: 0, max: 1000 },
  });

  // Estado compartido para productos y modal
  const [products, setProducts] = useState<Product[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [, setFilters] = useState(productsListFilters);

  const {
    filterState: contextFilterState,
    searchQuery: contextSearchQuery,
    setFilterState: setContextFilterState,
    setSelectedFilters: setContextSelectedFilters,
    setSearchQuery: setContextSearchQuery,
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    setIsLoading,
    isLoading,
  } = useProductsList();

  // Usar estado del contexto cuando es standalone, estado local cuando no
  const searchQuery = isStandalone ? contextSearchQuery : localSearchQuery;
  const filterState = isStandalone ? contextFilterState : localFilterState;

  const setSelectedFilters = isStandalone
    ? setContextSelectedFilters
    : setLocalSelectedFilters;
  const setSearchQuery = isStandalone
    ? setContextSearchQuery
    : setLocalSearchQuery;
  const setFilterState = isStandalone
    ? setContextFilterState
    : setLocalFilterState;

  // Función para aplicar filtros reales a los productos
  const applyFiltersToProducts = useCallback(
    (products: Product[], filters: FilterState) => {
      let filteredProducts = [...products];

      // Filtrar por categorías
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes("all")
      ) {
        filteredProducts = filteredProducts.filter((product) =>
          filters.categories.includes(product.categoryId)
        );
      }

      // Filtrar por estado
      if (filters.status !== "all") {
        switch (filters.status) {
          case "active":
            filteredProducts = filteredProducts.filter(
              (product) => product.stock > 0
            );
            break;
          case "inactive":
            filteredProducts = filteredProducts.filter(
              (product) => product.stock === 0
            );
            break;
          case "onSale":
            filteredProducts = filteredProducts.filter(
              (product) =>
                product.isOnSale ||
                product.discountPercentage ||
                product.originalPrice
            );
            break;
        }
      }

      // Filtrar por rango de precio
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.price >= filters.priceRange.min &&
          product.price <= filters.priceRange.max
      );

      // Ordenar productos
      switch (filters.sortBy) {
        case "price-asc":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          filteredProducts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "name":
        default:
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }

      return filteredProducts;
    },
    []
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;

    // Contar filtros de categorías (excluyendo 'all')
    if (
      filterState.categories.length > 0 &&
      !filterState.categories.includes("all")
    ) {
      count += filterState.categories.length;
    }

    // Contar filtro de ordenamiento (si no es 'name' por defecto)
    if (filterState.sortBy !== "name") {
      count += 1;
    }

    // Contar filtro de estado (si no es 'all')
    if (filterState.status !== "all") {
      count += 1;
    }

    // Contar filtro de rango de precio (si no es el rango por defecto)
    if (filterState.priceRange.min !== 0 || filterState.priceRange.max !== 1000) {
      count += 1;
    }

    return count;
  }, [filterState]);

  const activeFiltersCount = getActiveFiltersCount();

  // Usar React Query para obtener productos con cache
  const { data: productsData, isLoading: productsLoading } = useProducts({
    isActive: true,
  });

  // Procesar productos cuando se cargan
  useEffect(() => {
    if (productsData) {
      // Normalizar productos
      const normalizedProducts = productsData.map(normalizeProductData);
      const filteredProducts = applyFiltersToProducts(
        normalizedProducts,
        filterState
      );
      setProducts(filteredProducts);

      // Actualizar contadores de filtros dinámicamente
      const updatedFilters = productsListFilters.map((filter) => {
        if (filter.id === 'all') {
          return { ...filter, count: normalizedProducts.length };
        }
        const count = normalizedProducts.filter(p => p.categoryId === filter.id).length;
        return { ...filter, count };
      });
      setFilters(updatedFilters);

      if (isStandalone) {
        setTotalProducts(normalizedProducts.length);
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(activeFiltersCount > 0);
      }
    }
  }, [productsData, filterState, isStandalone, setTotalProducts, setFilteredProducts, setHasActiveFilters, activeFiltersCount, applyFiltersToProducts]);

  // Sincronizar isLoading del contexto con React Query
  useEffect(() => {
    if (isStandalone) {
      setIsLoading(productsLoading);
    }
  }, [productsLoading, isStandalone, setIsLoading]);

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setFilterState(filters);

    // Usar los productos ya cargados de React Query (cache)
    if (productsData) {
      const normalizedProducts = productsData.map(normalizeProductData);
      const filteredProducts = applyFiltersToProducts(normalizedProducts, filters);
      setProducts(filteredProducts);

      // Sincronizar filtros de categorías con selectedFilters
      const newSelectedFilters = filters.categories.filter(
        (id) => id !== "all"
      );
      setSelectedFilters(newSelectedFilters);

      if (isStandalone) {
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(getActiveFiltersCount() > 0);
      }
    }
  }, [productsData, applyFiltersToProducts, isStandalone, setFilteredProducts, setHasActiveFilters, setSelectedFilters, getActiveFiltersCount, setFilterState]);

  const handleClearFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      sortBy: "name" as const,
      categories: ["all"],
      status: "all" as const,
      priceRange: { min: 0, max: 1000 },
    };

    setFilterState(defaultFilters);
    setSelectedFilters([]);
    setSearchQuery("");

    // Los productos ya están en cache de React Query, solo aplicar filtros
    if (productsData) {
      const normalizedProducts = productsData.map(normalizeProductData);
      const filteredProducts = applyFiltersToProducts(normalizedProducts, defaultFilters);
      setProducts(filteredProducts);
      
      if (isStandalone) {
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(false);
      }
    }
  }, [productsData, applyFiltersToProducts, isStandalone, setFilteredProducts, setHasActiveFilters, setSelectedFilters, setFilterState, setSearchQuery]);

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Los productos se cargan automáticamente con React Query
  // No necesitamos un useEffect separado

  // Si es standalone, usar el contenedor fijo (igual que charge)
  if (isStandalone) {
    return (
      <FixedHeaderContainer>
        <div className={`p-4 pb-32 lg:p-0 lg:pb-8 ${className}`}>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto"></div>
              <p className="mt-4 text-base text-gray-500 font-medium">
                Produkte werden geladen...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3 animate-fade-in-scale">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up-fade gpu-accelerated"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCardList
                    product={product}
                    onClick={onProductClick ? () => handleProductClick(product) : undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base font-medium">
                {searchQuery
                  ? `Keine Produkte für "${searchQuery}" gefunden`
                  : "Keine Produkte verfügbar"}
              </p>
            </div>
          )}
        </div>

        {/* Modal de filtros */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={handleCloseFilterModal}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          currentFilters={filterState}
        />
      </FixedHeaderContainer>
    );
  }

  // Si no es standalone, solo retornar la lista de productos
  return (
    <div className={`relative ${className}`}>
      {/* Lista de productos con SCROLL PROPIO */}
      <div
        className={`${
          !isStandalone && maxHeight !== "none" ? "overflow-y-auto" : ""
        }`}
        style={!isStandalone && maxHeight !== "none" ? { maxHeight } : {}}
      >
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Produkte werden geladen...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-3 animate-fade-in-scale">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up-fade gpu-accelerated"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCardList
                    product={product}
                    onClick={onProductClick ? () => handleProductClick(product) : undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Keine Produkte für "${searchQuery}" gefunden`
                  : "Keine Produkte verfügbar"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de filtros */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={filterState}
      />
    </div>
  );
}
