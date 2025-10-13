"use client";

import { ReactNode, useState, createContext, useContext, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useScrollReset } from "@/hooks";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import {
  productCategories,
  mockProducts,
  Product,
} from "@/components/dashboard/products_list/data/mockProducts";
import { getIcon } from "@/components/dashboard/products_list/data/iconMap";

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

// Contexto para compartir datos de charge con AdminLayout
interface ChargeContextType {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  chargeFilters: FilterOption[];
}

const ChargeContext = createContext<ChargeContextType | undefined>(undefined);

export const useChargeContext = () => {
  const context = useContext(ChargeContext);
  return context;
};

interface ChargeLayoutProps {
  children: ReactNode;
}

export default function ChargeLayout({ children }: ChargeLayoutProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const { } = useScrollReset();

  // Calcular filtros de charge con contadores
  const chargeFilters: FilterOption[] = productCategories.map((category) => {
    let count = 0;

    if (category.id === "all") {
      count = mockProducts.length;
    } else if (category.id === "new") {
      count = mockProducts.filter((p: Product) => p.isNew).length;
    } else if (category.id === "popular") {
      count = mockProducts.filter((p: Product) => p.isPopular).length;
    } else if (category.id === "sale") {
      count = mockProducts.filter((p: Product) => p.isOnSale).length;
    } else if (category.id === "promotions") {
      count = mockProducts.filter(
        (p: Product) => p.isOnSale || p.originalPrice
      ).length;
    } else {
      count = mockProducts.filter(
        (p: Product) => p.categoryId === category.id
      ).length;
    }

    return {
      id: category.id,
      label: category.name,
      icon: getIcon(category.icon),
      count: count,
    };
  });

  // Actualizar contador de filtros activos
  useEffect(() => {
    setActiveFiltersCount(selectedFilters.length);
  }, [selectedFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const chargeContextValue: ChargeContextType = {
    searchQuery,
    onSearch: handleSearch,
    selectedFilters,
    onFilterChange: handleFilterChange,
    onOpenFilterModal: handleOpenFilterModal,
    activeFiltersCount,
    chargeFilters,
  };

  return (
    <FilterModalContext.Provider
      value={{ isFilterModalOpen, setIsFilterModalOpen }}
    >
      <ChargeContext.Provider value={chargeContextValue}>
        <AdminLayout>
          {children}
        </AdminLayout>
      </ChargeContext.Provider>
    </FilterModalContext.Provider>
  );
}
