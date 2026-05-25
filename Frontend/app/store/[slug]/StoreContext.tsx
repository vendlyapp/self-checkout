"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { type BuyerProduct as Product } from "@/lib/storefront/product";

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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filters: string[]) => {
    if (filters.length === 0) {
      setSelectedFilters(['all']);
      return;
    }
    if (filters.includes('all')) {
      setSelectedFilters(['all']);
      return;
    }
    setSelectedFilters(filters);
  }, []);

  const value: StoreContextType = useMemo(() => ({
    searchQuery,
    onSearch: handleSearch,
    selectedFilters,
    onFilterChange: handleFilterChange,
    onScanQR,
    categoryFilters,
    setCategoryFilters,
  }), [searchQuery, handleSearch, selectedFilters, handleFilterChange, onScanQR, categoryFilters]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

