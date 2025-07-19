'use client'

import React from 'react';
import Header from '@/components/navigation/Header';
import HeaderNav from '@/components/navigation/HeaderNav';
import { SearchInput } from "@/components/ui/search-input";
import { QrCodeIcon } from "lucide-react";
import { FilterSlider, FilterOption } from "@/components/Sliders/SliderFIlter";

interface FixedHeaderContainerChargeProps {
  title?: string;
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  chargeFilters: FilterOption[];
  onScanQR: () => void;
  children: React.ReactNode;
}

export default function FixedHeaderContainerCharge({
  title = 'Verkauf starten',
  searchQuery,
  onSearch,
  selectedFilters,
  onFilterChange,
  chargeFilters,
  onScanQR,
  children
}: FixedHeaderContainerChargeProps) {
  return (
    <div className="flex flex-col h-full bg-background-cream">
      {/* Header principal fijo - Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
      </div>

      {/* Header secundario fijo - HeaderNav */}
      <div className="fixed top-[57px] left-0 right-0 z-50 bg-background-cream border-b border-gray-200">
        <HeaderNav title={title} />
      </div>

      {/* Contenedor de búsqueda y filtros fijo */}
      <div className="fixed top-[115px] left-0 right-0 z-40 bg-background-cream border-b border-gray-100">
        {/* Barra de búsqueda y botón QR */}
        <div className="p-4 flex flex-col-2 gap-4 items-center justify-center">
          <SearchInput 
            placeholder="Produkte suchen..." 
            className="w-[260.5px] h-[54px]"
            value={searchQuery}
            onChange={onSearch}
          />
          <button 
            onClick={onScanQR}
            className="bg-brand-500 cursor-pointer text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px]"
          >
            <QrCodeIcon className="w-6 h-6" />
            <span className="text-[16px]">Scan</span>
          </button>
        </div>

        {/* Filtros de categorías */}
        <div className="bg-background-cream border-b border-gray-100">
          <FilterSlider
            filters={chargeFilters}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            showCount={true}
            multiSelect={true}
          />
        </div>
      </div>

      {/* Contenido scrolleable con padding para los elementos fijos */}
      <div className="flex-1 overflow-hidden" style={{ paddingTop: '280px' }}>
        {children}
      </div>
    </div>
  );
} 