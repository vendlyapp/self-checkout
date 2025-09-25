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
      {/* Mobile Layout */}
      <div className="block lg:hidden">
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
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verkauf starten</h1>
              <p className="text-gray-600 mt-1">Wählen Sie Produkte für den Verkauf aus</p>
            </div>
            <div className="w-full lg:w-[500px]">
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Kategorien</h2>
            <div className="flex flex-wrap gap-3">
              {chargeFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(
                    selectedFilters.includes(filter.id)
                      ? selectedFilters.filter(f => f !== filter.id)
                      : [...selectedFilters, filter.id]
                  )}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedFilters.includes(filter.id)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-brand-500'
                  }`}
                >
                  {filter.icon}
                  <span className="font-medium">{filter.label}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <DashBoardCharge
              searchQuery={searchQuery}
              selectedFilters={selectedFilters}
            />
          </div>
        </div>
      </div>

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
