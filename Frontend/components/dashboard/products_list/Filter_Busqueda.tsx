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
      {/* Barra de búsqueda y filtros - FIJOS */}
      <div className={`${isFixed ? 'fixed top-[140px]' : ''} left-0 right-0 p-4 flex flex-col-2 gap-4 items-center justify-center bg-background-cream border-b border-gray-100 ${isFixed ? 'z-40' : ''} 
                      animate-slide-down gpu-accelerated`}>
        <div className="animate-stagger-1">
          <SearchInput
            placeholder="Produkte durchsuchen…"
            className="w-[260.5px] h-[54px] transition-interactive gpu-accelerated"
            value={searchQuery}
            onChange={onSearch}
          />
        </div>
        <div className="animate-stagger-2">
          <button
            onClick={onOpenFilterModal}
            className="relative bg-white cursor-pointer text-black px-4 py-4 flex items-center font-semibold gap-2 rounded-lg 
                     transition-interactive gpu-accelerated
                     hover:bg-brand-600 hover:text-white hover:scale-105
                     active:scale-95"
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

      {/* Filtros de categorías - FIJOS */}
      <div className={`${isFixed ? 'fixed top-[225px]' : ''} left-0 right-0 bg-background-cream border-b border-gray-100 ${isFixed ? 'z-40' : ''} 
                      animate-slide-down gpu-accelerated`}
           style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
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
