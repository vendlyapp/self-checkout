"use client";

import { SearchInput } from "@/components/ui/search-input";
import { TOP_FILTER_SEARCH_BAR_PX, TOP_FILTER_SLIDER_BAR_PX } from "@/lib/constants/layoutHeights";
import { SlidersHorizontal } from "lucide-react";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";

interface FilterBusquedaProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  productsListFilters: FilterOption[];
  isFixed?: boolean;
}

export default function Filter_Busqueda({
  searchQuery,
  onSearch,
  selectedFilters,
  onFilterChange,
  onOpenFilterModal,
  activeFiltersCount,
  productsListFilters,
  isFixed = false,
}: FilterBusquedaProps) {
  return (
    <>
      {/* Barra de búsqueda y filtros - FIJOS (posición alineada con layoutHeights) */}
      <div
        className={`${isFixed ? "fixed" : ""} left-0 right-0 p-4 flex flex-row gap-3 items-center bg-background-cream ${isFixed ? "z-40" : ""} animate-slide-down`}
        style={isFixed ? { top: `${TOP_FILTER_SEARCH_BAR_PX}px` } : undefined}
      >
        <div className="animate-stagger-1 flex-1 min-w-0">
          <SearchInput
            placeholder="Produkte durchsuchen…"
            className="w-full h-[54px] transition-interactive"
            value={searchQuery}
            onChange={onSearch}
          />
        </div>
        <div className="animate-stagger-2 flex-shrink-0">
          <button
            onClick={onOpenFilterModal}
            className="relative flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-4 font-semibold text-black transition-interactive hover:scale-105 hover:bg-brand-600 hover:text-white active:scale-95"
            aria-label="Filter öffnen"
          >
            <SlidersHorizontal className="w-6 h-6 transition-interactive" />

            {/* Indicador de filtros aplicados */}
            {activeFiltersCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm
                            animate-bounce-in transition-interactive">
                {activeFiltersCount > 9 ? "9+" : activeFiltersCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Filtros de categorías - FIJOS (posición alineada con layoutHeights) */}
      <div
        className={`${isFixed ? "fixed" : ""} left-0 right-0 bg-background-cream ${isFixed ? "z-40" : ""} animate-slide-down`}
        style={isFixed ? { top: `${TOP_FILTER_SLIDER_BAR_PX}px`, animationDelay: "0.1s", animationFillMode: "both" } : { animationDelay: "0.1s", animationFillMode: "both" }}
      >
        <FilterSlider
          filters={productsListFilters}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
          showCount={true}
          multiSelect={false}
        />
      </div>
    </>
  );
}
