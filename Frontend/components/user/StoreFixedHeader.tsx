"use client";

import { SearchInput } from "@/components/ui/search-input";
import { ScanBarcode } from "lucide-react";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";

interface StoreFixedHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onScanQR: () => void;
  categoryFilters: FilterOption[];
  isFixed?: boolean;
}

export default function StoreFixedHeader({
  searchQuery,
  onSearch,
  selectedFilters,
  onFilterChange,
  onScanQR,
  categoryFilters,
  isFixed = false,
}: StoreFixedHeaderProps) {
  return (
    <>
      {/* Barra de búsqueda y botón Scan - FIJOS - Optimizado para móvil */}
      <div 
        className={`${isFixed ? 'fixed' : ''} left-0 right-0 px-3 sm:px-4 py-2.5 sm:py-3 flex gap-3 sm:gap-4 items-center justify-between bg-background-cream ${isFixed ? 'z-40' : ''}`}
        style={isFixed ? { top: 'calc(86px + env(safe-area-inset-top) + 65px)' } : {}}
      >
        <div className="flex-1 min-w-0 mr-2 sm:mr-0">
          <SearchInput
            placeholder="Produkte suchen..."
            className="w-full max-w-full sm:max-w-[260px] h-[48px] sm:h-[50px]"
            value={searchQuery}
            onChange={onSearch}
          />
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={onScanQR}
            className="bg-brand-500 cursor-pointer justify-center text-center text-white px-3 sm:px-3.5 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 rounded-[30px] w-[90px] sm:w-[110px] h-[48px] sm:h-[50px] hover:bg-brand-600 active:bg-brand-700 transition-colors touch-target-sm whitespace-nowrap"
            aria-label="QR Code scannen"
            tabIndex={0}
          >
            <ScanBarcode className="w-[18px] h-[18px] sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="text-[13px] sm:text-[15px] font-semibold text-center">Scan</span>
          </button>
        </div>
      </div>

      {/* Filtros de categorías - FIJOS - Optimizado para móvil */}
      {categoryFilters.length > 0 && (
        <div 
          className={`${isFixed ? 'fixed' : ''} left-0 right-0 bg-background-cream ${isFixed ? 'z-40' : ''}`}
          style={isFixed ? { 
            top: 'calc(80px + env(safe-area-inset-top) + 65px + 70px)'
          } : {}}
        >
          <div>
            <FilterSlider
              filters={categoryFilters}
              selectedFilters={selectedFilters.includes('all') ? [] : selectedFilters.filter(id => id !== 'all')}
              onFilterChange={onFilterChange}
              showCount={true}
              multiSelect={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

