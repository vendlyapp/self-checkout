"use client";

import { createContext, useContext } from "react";
import type { Product } from "@/components/dashboard/products_list/data/mockProducts";
import type { CatalogFilterChip } from "@/components/dashboard/products_list/Filter_Busqueda";

// Contexto para el modal de filtros
interface FilterModalContextType {
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (open: boolean) => void;
}

const FilterModalContext = createContext<FilterModalContextType | undefined>(
  undefined
);

export const useFilterModal = () => {
  const context = useContext(FilterModalContext);
  if (!context) {
    throw new Error("useFilterModal must be used within FilterModalProvider");
  }
  return context;
};

export const FilterModalProvider = FilterModalContext.Provider;

// Contexto para compartir datos de charge con AdminLayout
interface ChargeContextType {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  chargeFilters: CatalogFilterChip[];
  /** Aktive Produkte (normalisiert, flach) — eine API-Quelle für Layout + Seite */
  catalogProducts: Product[];
  isProductsInitialLoad: boolean;
}

const ChargeContext = createContext<ChargeContextType | undefined>(undefined);

export const useChargeContext = () => {
  const context = useContext(ChargeContext);
  return context;
};

export const ChargeProvider = ChargeContext.Provider;

