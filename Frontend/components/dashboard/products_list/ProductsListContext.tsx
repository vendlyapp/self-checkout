"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { FilterState } from "./FilterModal";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { updateCategoryCounts } from "./data/mockProducts";
import { getIcon } from "./data/iconMap";

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
        priceRange: { min: 0, max: 50 },
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
    priceRange: { min: 0, max: 50 },
  });
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Calcular filtros de productos con contadores
  const productsListFilters: FilterOption[] = updateCategoryCounts().map((category) => {
    return {
      id: category.id,
      label: category.name,
      icon: getIcon(category.icon),
      count: category.count,
    };
  });

  // Actualizar contador de filtros activos
  useEffect(() => {
    setActiveFiltersCount(selectedFilters.length);
  }, [selectedFilters]);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
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
