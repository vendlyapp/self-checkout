"use client";

import { ReactNode, useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useScrollReset } from "@/hooks";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import {
  productCategories,
  mockProducts,
  Product,
} from "@/components/dashboard/products_list/data/mockProducts";
import { getIcon } from "@/components/dashboard/products_list/data/iconMap";
import { FilterModalProvider, ChargeProvider } from "./contexts";

// Tipos internos
interface ChargeContextType {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  chargeFilters: FilterOption[];
}

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
    <FilterModalProvider
      value={{ isFilterModalOpen, setIsFilterModalOpen }}
    >
      <ChargeProvider value={chargeContextValue}>
        <AdminLayout>
          {children}
        </AdminLayout>
      </ChargeProvider>
    </FilterModalProvider>
  );
}
