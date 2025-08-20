"use client";

import React from "react";
import HeaderNav from "@/components/navigation/HeaderNav";
import Filter_Busqueda from "./Filter_Busqueda";
import { FilterOption } from "@/components/Sliders/SliderFIlter";

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
  title = "Produkte",
  showAddButton = false,
  searchQuery,
  onSearch,
  selectedFilters,
  onFilterChange,
  onOpenFilterModal,
  activeFiltersCount,
  productsListFilters,
  children,
}: FixedHeaderContainerProps) {
  return (
    <div className="flex flex-col h-full bg-background-cream">
      <HeaderNav title={title} showAddButton={showAddButton} />
      <Filter_Busqueda
        searchQuery={searchQuery}
        onSearch={onSearch}
        selectedFilters={selectedFilters}
        onFilterChange={onFilterChange}
        onOpenFilterModal={onOpenFilterModal}
        activeFiltersCount={activeFiltersCount}
        productsListFilters={productsListFilters}
      />

      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
