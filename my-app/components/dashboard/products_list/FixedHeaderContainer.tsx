'use client'

import React from 'react';
import Header from '@/components/navigation/Header';
import HeaderNav from '@/components/navigation/HeaderNav';
import Filter_Busqueda from './Filter_Busqueda';
import { FilterOption } from '@/components/Sliders/SliderFIlter';

interface FixedHeaderContainerProps {
  title?: string;
  showAddButton?: boolean;
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  productsListFilters: FilterOption[];
  children: React.ReactNode;
}

export default function FixedHeaderContainer({
  title = 'Produkte',
  showAddButton = false,
  searchQuery,
  onSearch,
  selectedFilters,
  onFilterChange,
  onOpenFilterModal,
  activeFiltersCount,
  productsListFilters,
  children
}: FixedHeaderContainerProps) {
  return (
    <div className="flex flex-col h-full bg-background-cream">
      {/* Header principal fijo - Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
      </div>

      {/* Header secundario fijo - HeaderNav */}
      <div className="fixed top-[77px] left-0 right-0 z-50 bg-background-cream border-b border-gray-200">
        <HeaderNav title={title} showAddButton={showAddButton} />
      </div>

      {/* Contenedor de filtros fijo */}
      <div className="fixed top-[137px] left-0 right-0 z-40 bg-background-cream border-b border-gray-100">
        <Filter_Busqueda
          searchQuery={searchQuery}
          onSearch={onSearch}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
          onOpenFilterModal={onOpenFilterModal}
          activeFiltersCount={activeFiltersCount}
          productsListFilters={productsListFilters}
        />
      </div>

      {/* Contenido scrolleable con padding para los elementos fijos */}
      <div className="flex-1 overflow-hidden" style={{ paddingTop: '280px' }}>
        {children}
      </div>
    </div>
  );
} 