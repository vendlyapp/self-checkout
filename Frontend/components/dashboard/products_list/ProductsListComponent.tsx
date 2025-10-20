"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchProducts,
  updateCategoryCounts,
  Product,
  productCategories,
} from "./data/mockProducts";
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
  title = "Produkte",
  showAddButton = false,
}: ProductsListComponentProps) {
  const searchParams = useSearchParams();
  const refreshParam = searchParams?.get('refresh');
  
  // Estado local para cuando NO es standalone
  const [localSelectedFilters, setLocalSelectedFilters] = useState<string[]>(
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
  const [filters, setFilters] = useState(productsListFilters);

  const {
    filterState: contextFilterState,
    selectedFilters: contextSelectedFilters,
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
  const selectedFilters = isStandalone
    ? contextSelectedFilters
    : localSelectedFilters;
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

  const loadInitialProducts = useCallback(async () => {
    if (isStandalone) {
      setIsLoading(true);
    }

    try {
      const initialProducts = await fetchProducts();
      const filteredProducts = applyFiltersToProducts(
        initialProducts,
        filterState
      );
      setProducts(filteredProducts);

      // Actualizar contadores de filtros dinámicamente
      const updatedFilters = productsListFilters.map((filter) => {
        if (filter.id === 'all') {
          return { ...filter, count: initialProducts.length };
        }
        const count = initialProducts.filter(p => p.categoryId === filter.id).length;
        return { ...filter, count };
      });
      setFilters(updatedFilters);

      if (isStandalone) {
        setTotalProducts(initialProducts.length);
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(activeFiltersCount > 0);
      }
    } catch (error) {
      // Error silencioso
    } finally {
      if (isStandalone) {
        setIsLoading(false);
      }
    }
  }, [
    isStandalone,
    setIsLoading,
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    filterState,
    applyFiltersToProducts,
    activeFiltersCount,
  ]);

  const handleFilterChange = async (filters: string[]) => {
    setSelectedFilters(filters);

    if (isStandalone) {
      setIsLoading(true);
    }

    try {
      const categoryId = filters.length > 0 ? filters[0] : "all";
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: searchQuery,
      });
      setProducts(filteredProducts);

      if (isStandalone) {
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(filters.length > 0);
      }
    } catch (error) {
      console.error("Error al filtrar productos:", error);
    } finally {
      if (isStandalone) {
        setIsLoading(false);
      }
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (isStandalone) {
      setIsLoading(true);
    }

    try {
      const categoryId =
        selectedFilters.length > 0 ? selectedFilters[0] : "all";
      const filteredProducts = await fetchProducts({
        categoryId,
        searchTerm: query,
      });
      setProducts(filteredProducts);

      if (isStandalone) {
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(query.length > 0 || selectedFilters.length > 0);
      }
    } catch (error) {
      console.error("Error al buscar productos:", error);
    } finally {
      if (isStandalone) {
        setIsLoading(false);
      }
    }
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = async (filters: FilterState) => {
    setFilterState(filters);

    if (isStandalone) {
      setIsLoading(true);
    }

    try {
      // Cargar todos los productos y aplicar filtros
      const allProducts = await fetchProducts();
      const filteredProducts = applyFiltersToProducts(allProducts, filters);
      setProducts(filteredProducts);

      // Sincronizar filtros de categorías con selectedFilters
      const newSelectedFilters = filters.categories.filter(
        (id) => id !== "all"
      );
      setSelectedFilters(newSelectedFilters);

      if (isStandalone) {
        setFilteredProducts(filteredProducts.length);
        setHasActiveFilters(getActiveFiltersCount() > 0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
      if (isStandalone) {
        setIsLoading(false);
      }
    }
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterState = {
      sortBy: "name" as const,
      categories: ["all"],
      status: "all" as const,
      priceRange: { min: 0, max: 1000 },
    };

    setFilterState(defaultFilters);
    setSelectedFilters([]);
    setSearchQuery("");

    if (isStandalone) {
      setIsLoading(true);
    }

    // Recargar productos sin filtros
    loadInitialProducts();
  };

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Cargar productos iniciales y cuando cambia el refresh param
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts, refreshParam]);

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
            <div className="space-y-3">
              {products.map((product) => (
                <ProductCardList
                  key={product.id}
                  product={product}
                  onClick={onProductClick ? () => handleProductClick(product) : undefined}
                />
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
            <div className="space-y-3">
              {products.map((product) => (
                <ProductCardList
                  key={product.id}
                  product={product}
                  onClick={onProductClick ? () => handleProductClick(product) : undefined}
                />
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
