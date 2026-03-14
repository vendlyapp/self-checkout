"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { FilterState } from "./FilterModal";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { getIcon } from "./data/iconMap";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries";
import { normalizeProductData } from "./data/mockProducts";

interface ProductsListContextType {
  totalProducts: number;
  filteredProducts: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  filterState: FilterState;
  selectedFilters: string[];
  searchQuery: string;
  activeFiltersCount: number;
  productsListFilters: FilterOption[];
  isFilterModalOpen: boolean;
  setTotalProducts: (count: number) => void;
  setFilteredProducts: (count: number) => void;
  setHasActiveFilters: (hasFilters: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setFilterState: (filters: FilterState) => void;
  setSelectedFilters: (filters: string[]) => void;
  setSearchQuery: (query: string) => void;
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  onCloseFilterModal: () => void;
}

const ProductsListContext = createContext<ProductsListContextType | undefined>(
  undefined
);

export const useProductsList = () => {
  const context = useContext(ProductsListContext);
  if (context === undefined) {
    // Retornar valores por defecto si el contexto no está disponible
    return {
      totalProducts: 0,
      filteredProducts: 0,
      hasActiveFilters: false,
      isLoading: false,
      filterState: {
        sortBy: "name" as const,
        categories: ["all"],
        status: "all" as const,
        priceRange: { min: 0, max: 1000 },
      },
      selectedFilters: [],
      searchQuery: "",
      activeFiltersCount: 0,
      productsListFilters: [],
      isFilterModalOpen: false,
      setTotalProducts: () => {},
      setFilteredProducts: () => {},
      setHasActiveFilters: () => {},
      setIsLoading: () => {},
      setFilterState: () => {},
      setSelectedFilters: () => {},
      setSearchQuery: () => {},
      onSearch: () => {},
      onFilterChange: () => {},
      onOpenFilterModal: () => {},
      onCloseFilterModal: () => {},
    };
  }
  return context;
};

interface ProductsListProviderProps {
  children: ReactNode;
}

export const ProductsListProvider: React.FC<ProductsListProviderProps> = ({
  children,
}) => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState(0);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    sortBy: "name" as const,
    categories: ["all"],
    status: "all" as const,
    priceRange: { min: 0, max: 1000 },
  });
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Obtener categorías y productos reales de la API
  const { data: categoriesData = [] } = useCategories();
  const { data: productsData = [] } = useProducts({ includeInactive: true });

  // Calcular filtros de productos con contadores dinámicos
  const productsListFilters: FilterOption[] = useMemo(() => {
    if (!categoriesData || !productsData) {
      return [
        {
          id: 'all',
          label: 'Alle',
          icon: getIcon('ShoppingCart'),
          count: 0,
        }
      ];
    }

    const normalizedProducts = productsData.map(normalizeProductData);
    const allProductsCount = normalizedProducts.length;

    return [
      {
        id: 'all',
        label: 'Alle',
        icon: getIcon('ShoppingCart'),
        count: allProductsCount,
      },
      ...categoriesData
        .filter(cat => cat.isActive !== false)
        .map(cat => {
          const count = normalizedProducts.filter(p => p.categoryId === cat.id).length;
          return {
            id: cat.id,
            label: cat.name,
            icon: getIcon(cat.icon || 'Package'),
            count: count,
          };
        })
    ];
  }, [categoriesData, productsData]);

  // Contador de filtros activos (excluyendo 'all' que es el estado por defecto)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.categories.length > 0 && !filterState.categories.includes('all')) {
      count += filterState.categories.length;
    }
    if (filterState.sortBy !== 'name') count++;
    if (filterState.status !== 'all') count++;
    if (filterState.priceRange.min !== 0 || filterState.priceRange.max !== 1000) count++;
    return count;
  }, [filterState]);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    // Si no hay nada seleccionado, volver a 'all' (estado por defecto)
    const effective = filters.length === 0 ? ['all'] : filters;
    setSelectedFilters(effective);

    if (effective.includes('all')) {
      setFilterState(prev => ({ ...prev, categories: ['all'] }));
    } else {
      setFilterState(prev => ({ ...prev, categories: effective }));
    }
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const value = {
    totalProducts,
    filteredProducts,
    hasActiveFilters,
    isLoading,
    filterState,
    selectedFilters,
    searchQuery,
    activeFiltersCount,
    productsListFilters,
    isFilterModalOpen,
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    setIsLoading,
    setFilterState,
    setSelectedFilters,
    setSearchQuery,
    onSearch: handleSearch,
    onFilterChange: handleFilterChange,
    onOpenFilterModal: handleOpenFilterModal,
    onCloseFilterModal: handleCloseFilterModal,
  };

  return (
    <ProductsListContext.Provider value={value}>
      {children}
    </ProductsListContext.Provider>
  );
};
