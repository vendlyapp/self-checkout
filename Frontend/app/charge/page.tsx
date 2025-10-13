"use client";

import React, { useState, useEffect } from "react";
import DashBoardCharge from "@/components/dashboard/charge/DashBoard";
import FixedHeaderContainer from "@/components/dashboard/products_list/FixedHeaderContainer";
import FilterModal, {
  FilterState,
} from "@/components/dashboard/products_list/FilterModal";
import { useFilterModal, useChargeContext } from "./layout";

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
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>({
    sortBy: "name" as const,
    categories: ["all"],
    status: "all" as const,
    priceRange: { min: 0, max: 50 },
  });

  // Usar los contextos
  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();
  const chargeContext = useChargeContext();

  // Si no hay contexto, retornar null (no debería pasar, pero por seguridad)
  if (!chargeContext) return null;

  const {
    searchQuery,
    onSearch,
    selectedFilters,
    onFilterChange,
  } = chargeContext;

  const handleCloseFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilterState(filters);

    // Convertir filtros del modal a filtros de categorías
    const newSelectedFilters = filters.categories.filter((id) => id !== "all");
    onFilterChange(newSelectedFilters);

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
    onFilterChange([]);

    // Aquí puedes implementar la lógica de limpieza
    console.log("Filtros limpiados");
  };

  return (
    <>
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <FixedHeaderContainer>
          <DashBoardCharge
            searchQuery={searchQuery}
            selectedFilters={selectedFilters}
          />
        </FixedHeaderContainer>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen">
        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-8">
          {/* Header Section - Más limpio y espacioso */}
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verkauf starten</h1>
              <p className="text-gray-500 mt-2 text-base">Wählen Sie Produkte für den Verkauf aus</p>
            </div>
            <div className="w-full max-w-md">
              <input
                type="text"
                placeholder="Produkte durchsuchen..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 rounded-2xl 
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                         transition-all duration-200 text-base placeholder:text-gray-400
                         shadow-sm hover:border-gray-300"
              />
            </div>
          </div>

          {/* Filters Section - Sin fondo blanco, más moderno */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-700">Kategorien</h2>
              {selectedFilters.length > 0 && (
                <span className="px-3 py-1 bg-brand-500 text-white text-xs font-medium rounded-full">
                  {selectedFilters.length}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {chargeContext.chargeFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(
                    selectedFilters.includes(filter.id)
                      ? selectedFilters.filter(f => f !== filter.id)
                      : [...selectedFilters, filter.id]
                  )}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl 
                           transition-all duration-200 font-medium text-sm
                           ${
                    selectedFilters.includes(filter.id)
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-[1.02]'
                      : 'bg-white text-gray-700 hover:bg-white hover:shadow-md hover:scale-[1.02] border border-gray-200'
                  }`}
                >
                  <span className="text-lg">{filter.icon}</span>
                  <span>{filter.label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    selectedFilters.includes(filter.id)
                      ? 'bg-white/25 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Section - Sin contenedor adicional */}
          <div className="pt-4">
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
