"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { FilterState } from "./FilterModal";

interface ProductsListContextType {
  totalProducts: number;
  filteredProducts: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  filterState: FilterState;
  selectedFilters: string[];
  searchQuery: string;
  setTotalProducts: (count: number) => void;
  setFilteredProducts: (count: number) => void;
  setHasActiveFilters: (hasFilters: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setFilterState: (filters: FilterState) => void;
  setSelectedFilters: (filters: string[]) => void;
  setSearchQuery: (query: string) => void;
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
      setTotalProducts: () => {},
      setFilteredProducts: () => {},
      setHasActiveFilters: () => {},
      setIsLoading: () => {},
      setFilterState: () => {},
      setSelectedFilters: () => {},
      setSearchQuery: () => {},
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

  const value = {
    totalProducts,
    filteredProducts,
    hasActiveFilters,
    isLoading,
    filterState,
    selectedFilters,
    searchQuery,
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    setIsLoading,
    setFilterState,
    setSelectedFilters,
    setSearchQuery,
  };

  return (
    <ProductsListContext.Provider value={value}>
      {children}
    </ProductsListContext.Provider>
  );
};
