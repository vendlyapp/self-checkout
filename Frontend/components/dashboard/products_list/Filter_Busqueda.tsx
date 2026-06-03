"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { TOP_FILTER_SEARCH_BAR_PX, TOP_FILTER_SLIDER_BAR_PX } from "@/lib/constants/layoutHeights";
import { CategoryChips } from "@/components/user/CategoryChips";

export interface CatalogFilterChip {
  id: string;
  label: string;
  count?: number;
}

interface FilterBusquedaProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  productsListFilters: CatalogFilterChip[];
  isFixed?: boolean;
}

/** Suche + Kategorie-Chips — gleiches Muster wie Storefront (/store/[slug]) */
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
  const chipFilters = productsListFilters.map((f) => ({
    id: f.id,
    label: f.label,
    count: f.count,
  }));

  const chipSelected =
    selectedFilters.length === 0 || selectedFilters.includes('all')
      ? ['all']
      : selectedFilters;

  return (
    <>
      <div
        className={`${isFixed ? "fixed left-0 right-0 z-40" : ""} bg-background-cream px-4 py-3`}
        style={isFixed ? { top: `${TOP_FILTER_SEARCH_BAR_PX}px` } : undefined}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl bg-white p-2 shadow-card focus-within:ring-2 focus-within:ring-[#25D076] transition-shadow">
          <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2">
            <Search className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={2.2} />
            <input
              type="search"
              inputMode="search"
              value={searchQuery}
              placeholder="Produkte suchen …"
              onChange={(e) => onSearch(e.target.value)}
              className="ios-input-fix w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
          </label>
          <button
            type="button"
            onClick={onOpenFilterModal}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 active:scale-95 transition-transform"
            aria-label="Erweiterte Filter"
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={2.2} />
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25D076] px-1 text-[10px] font-bold text-white shadow-soft">
                {activeFiltersCount > 9 ? "9+" : activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {chipFilters.length > 0 && (
        <div
          className={`${isFixed ? "fixed left-0 right-0 z-40" : ""} bg-background-cream`}
          style={isFixed ? { top: `${TOP_FILTER_SLIDER_BAR_PX}px` } : undefined}
        >
          <div className="mx-auto max-w-3xl">
            <CategoryChips
              filters={chipFilters}
              selectedFilters={chipSelected}
              onFilterChange={onFilterChange}
            />
          </div>
        </div>
      )}
    </>
  );
}
