"use client";

import { SearchInput } from "@/components/ui/search-input";
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
}

export default function Filter_Busqueda({
  searchQuery,
  onSearch,
  selectedFilters,
  onFilterChange,
  onOpenFilterModal,
  activeFiltersCount,
  productsListFilters,
}: FilterBusquedaProps) {
  return (
    <>
      {/* Barra de búsqueda y filtros - FIJOS */}
      <div className="p-4 flex flex-col-2 gap-4 items-center justify-center bg-background-cream border-b border-gray-100">
        <SearchInput
          placeholder="Produkte durchsuchen…"
          className="w-[260.5px] h-[54px]"
          value={searchQuery}
          onChange={onSearch}
        />
        <button
          onClick={onOpenFilterModal}
          className="relative bg-white cursor-pointer text-black px-4 py-4 flex items-center font-semibold gap-2 rounded-lg hover:bg-brand-600 transition-colors"
          aria-label="Filter öffnen"
        >
          <SlidersHorizontal className="w-6 h-6" />

          {/* Indicador de filtros aplicados */}
          {activeFiltersCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
              {activeFiltersCount > 9 ? "9+" : activeFiltersCount}
            </div>
          )}
        </button>
      </div>

      {/* Filtros de categorías - FIJOS */}
      <div className="bg-background-cream border-b border-gray-100">
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
