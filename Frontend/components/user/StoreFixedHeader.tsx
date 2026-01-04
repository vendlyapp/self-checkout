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
      {/* Barra de búsqueda y botón Scan - FIJOS */}
      <div 
        className={`${isFixed ? 'fixed' : ''} left-0 right-0 p-4 flex gap-4 items-center justify-center bg-background-cream border-b border-gray-100 ${isFixed ? 'z-40' : ''}`}
        style={isFixed ? { top: 'calc(85px + env(safe-area-inset-top) + 60px)' } : {}}
      >
        <div>
          <SearchInput
            placeholder="Produkte suchen..."
            className="flex-1 max-w-[260px] h-[54px]"
            value={searchQuery}
            onChange={onSearch}
          />
        </div>
        <div>
          <button
            onClick={onScanQR}
            className="bg-brand-500 cursor-pointer justify-center text-center text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px] hover:bg-brand-600"
            aria-label="QR Code scannen"
          >
            <ScanBarcode className="w-6 h-6" />
            <span className="text-[16px] text-center">Scan</span>
          </button>
        </div>
      </div>

      {/* Filtros de categorías - FIJOS */}
      {categoryFilters.length > 0 && (
        <div 
          className={`${isFixed ? 'fixed' : ''} left-0 right-0 bg-background-cream border-b border-gray-100 ${isFixed ? 'z-40' : ''}`}
          style={isFixed ? { 
            top: 'calc(85px + env(safe-area-inset-top) + 60px + 85px)'
          } : {}}
        >
          <FilterSlider
            filters={categoryFilters}
            selectedFilters={selectedFilters.includes('all') ? [] : selectedFilters.filter(id => id !== 'all')}
            onFilterChange={onFilterChange}
            showCount={true}
            multiSelect={true}
          />
        </div>
      )}
    </>
  );
}

