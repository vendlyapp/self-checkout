"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { Product } from "@/components/dashboard/products_list/data/mockProducts";

interface StoreContextType {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onScanQR: () => void;
  categoryFilters: FilterOption[];
  setCategoryFilters: (filters: FilterOption[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStoreContext must be used within a StoreProvider");
  }
  return context;
};

interface StoreProviderProps {
  children: ReactNode;
  onScanQR: () => void;
}

export const StoreProvider = ({ children, onScanQR }: StoreProviderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [categoryFilters, setCategoryFilters] = useState<FilterOption[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    // Si se pasa un array vacío, establecer "all"
    if (filters.length === 0) {
      setSelectedFilters(['all']);
      return;
    }
    
    // Si se incluye "all", solo dejar "all"
    if (filters.includes('all')) {
      setSelectedFilters(['all']);
      return;
    }
    
    // Si no hay "all", usar los filtros seleccionados
    setSelectedFilters(filters);
  };

  const value: StoreContextType = {
    searchQuery,
    onSearch: handleSearch,
    selectedFilters,
    onFilterChange: handleFilterChange,
    onScanQR,
    categoryFilters,
    setCategoryFilters,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

