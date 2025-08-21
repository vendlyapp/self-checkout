"use client";

import React, { useState, useEffect } from "react";
import DashBoardCharge from "@/components/dashboard/charge/DashBoard";
import FixedHeaderContainer from "@/components/dashboard/products_list/FixedHeaderContainer";
import FilterModal, {
  FilterState,
} from "@/components/dashboard/products_list/FilterModal";
import {
  productCategories,
  mockProducts,
  Product,
} from "@/components/dashboard/products_list/data/mockProducts";
import { getIcon } from "@/components/dashboard/products_list/data/iconMap";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { useFilterModal } from "./layout";

// Convertir categorías a formato FilterOption con contadores reales
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

/**
 * Charge Page - Página principal del charge
 *
 * Esta página actúa como un punto de entrada limpio que simplemente
 * renderiza el componente DashBoardCharge. Toda la lógica de presentación
 * está en el componente DashBoardCharge para seguir el principio de
 * separación de responsabilidades.
 *
 * Beneficios de esta arquitectura:
 * - Page solo se encarga de routing
 * - DashBoardCharge maneja toda la lógica de presentación
 * - Facilita testing y reutilización
 * - Mejor preparado para SSR/SSG si se necesita
 * - Arquitectura escalable para futuras funcionalidades
 */
export default function Charge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>({
    sortBy: "name" as const,
    categories: ["all"],
    status: "all" as const,
    priceRange: { min: 0, max: 50 },
  });

  // Usar el contexto del modal
  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();

  // Calcular filtros activos
  useEffect(() => {
    const count = selectedFilters.length;
    setActiveFiltersCount(count);
  }, [selectedFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Aquí puedes implementar la lógica de búsqueda
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
    // Aquí puedes implementar la lógica de filtros
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilterState(filters);

    // Convertir filtros del modal a filtros de categorías
    const newSelectedFilters = filters.categories.filter((id) => id !== "all");
    setSelectedFilters(newSelectedFilters);

    // Aquí puedes implementar la lógica adicional de filtrado
    console.log("Filtros aplicados:", filters);
  };

  const handleClearFilters = () => {
    setCurrentFilterState({
      sortBy: "name",
      categories: ["all"],
      status: "all",
      priceRange: { min: 0, max: 50 },
    });
    setSelectedFilters([]);

    // Aquí puedes implementar la lógica de limpieza
    console.log("Filtros limpiados");
  };

  return (
    <>
      <FixedHeaderContainer
        title="Verkauf starten"
        showAddButton={false}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onOpenFilterModal={handleOpenFilterModal}
        activeFiltersCount={activeFiltersCount}
        productsListFilters={chargeFilters}
      >
        <DashBoardCharge
          searchQuery={searchQuery}
          selectedFilters={selectedFilters}
        />
      </FixedHeaderContainer>

      {/* Modal de filtros */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={currentFilterState}
      />
    </>
  );
}
