"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchProducts, updateCategoryCounts } from "./data/mockProducts";
import { getIcon } from "./data/iconMap";
import ProductCardList from "./ProductCardList";
import FilterModal, { FilterState } from "./FilterModal";
import { useProductsList } from "./ProductsListContext";
import FixedHeaderContainer from "./FixedHeaderContainer";

// Interfaz completa para Product - actualizada para ser compatible
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
  availableWeights?: string[];
  hasWeight?: boolean;
  discountPercentage?: number;
}

interface ProductsListComponentProps {
  isStandalone?: boolean; // Si es true, es la página dedicada. Si es false, es parte del dashboard
  onProductClick?: (product: Product) => void;
  className?: string;
  maxHeight?: string; // Altura máxima para el contenedor con scroll
  title?: string;
  showAddButton?: boolean;
}

// Convertir categorías a formato FilterOption con contadores reales
const productsListFilters = updateCategoryCounts().map((category) => {
  return {
    id: category.id,
    label: category.name,
    icon: getIcon(category.icon),
    count: category.count,
  };
});

export default function ProductsListComponent({
  isStandalone = false,
  onProductClick,
  className = "",
  maxHeight = "90vh",
  title = "Produkte",
  showAddButton = false,
}: ProductsListComponentProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "name",
    categories: ["all"],
    status: "all",
  });

  const {
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    setIsLoading,
    isLoading,
  } = useProductsList();

  const getActiveFiltersCount = () => {
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

    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const loadInitialProducts = useCallback(async () => {
    if (isStandalone) {
      setIsLoading(true);
    }

    try {
      const initialProducts = await fetchProducts();
      setProducts(initialProducts);

      if (isStandalone) {
        setTotalProducts(initialProducts.length);
        setFilteredProducts(initialProducts.length);
        setHasActiveFilters(false);
      }
    } catch (error) {
      console.error("Error al cargar productos:", error);
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

  const handleApplyFilters = (filters: FilterState) => {
    setFilterState(filters);

    if (isStandalone) {
      setIsLoading(true);
    }

    // Aquí implementarías la lógica de filtrado avanzado
    // Por ahora solo actualizamos el estado
    console.log("Aplicando filtros:", filters);

    // Simular filtrado
    setTimeout(() => {
      const hasFilters =
        (filters.categories.length > 0 &&
          !filters.categories.includes("all")) ||
        filters.sortBy !== "name" ||
        filters.status !== "all";

      if (isStandalone) {
        setHasActiveFilters(hasFilters);
        setFilteredProducts(products.length);
        setIsLoading(false);
      }
    }, 500);
  };

  const handleClearFilters = () => {
    setFilterState({
      sortBy: "name",
      categories: ["all"],
      status: "all",
    });
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

  // Cargar productos iniciales solo una vez al montar el componente
  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]); // Include loadInitialProducts in dependencies

  // Si es standalone, usar el contenedor fijo
  if (isStandalone) {
    return (
      <FixedHeaderContainer
        title={title}
        showAddButton={showAddButton}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onOpenFilterModal={handleOpenFilterModal}
        activeFiltersCount={activeFiltersCount}
        productsListFilters={productsListFilters}
      >
        <div className={`${className}`}>
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
                    onClick={() => handleProductClick(product)}
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
          isStandalone ? "" : `max-h-[${maxHeight}] overflow-y-auto`
        }`}
        style={!isStandalone ? { maxHeight } : {}}
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
                  onClick={() => handleProductClick(product)}
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
