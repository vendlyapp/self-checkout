"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import DashBoardCharge from "@/components/dashboard/charge/DashBoard";
import FixedHeaderContainer from "@/components/dashboard/products_list/FixedHeaderContainer";
import FilterModal, { FilterState } from "@/components/dashboard/products_list/FilterModal";
import Filter_Busqueda from "@/components/dashboard/products_list/Filter_Busqueda";
import { CategoryChips } from "@/components/user/CategoryChips";
import HeaderNav from "@/components/navigation/HeaderNav";
import { useFilterModal, useChargeContext } from "./contexts";

export default function Charge() {
  const [currentFilterState, setCurrentFilterState] = useState<FilterState>({
    sortBy: "name",
    categories: ["all"],
    status: "all",
    priceRange: { min: 0, max: 1000 },
  });

  const { isFilterModalOpen, setIsFilterModalOpen } = useFilterModal();
  const chargeContext = useChargeContext();

  if (!chargeContext) return null;

  const {
    searchQuery,
    onSearch,
    selectedFilters,
    onFilterChange,
    onOpenFilterModal,
    activeFiltersCount,
    chargeFilters,
  } = chargeContext;

  const handleCloseFilterModal = () => setIsFilterModalOpen(false);

  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilterState(filters);
    const newSelectedFilters = filters.categories.filter((id) => id !== "all");
    onFilterChange(newSelectedFilters.length ? newSelectedFilters : []);
  };

  const handleClearFilters = () => {
    setCurrentFilterState({
      sortBy: "name",
      categories: ["all"],
      status: "all",
      priceRange: { min: 0, max: 1000 },
    });
    onFilterChange([]);
    onSearch("");
  };

  const handleChipChange = (filters: string[]) => {
    if (filters.length === 0 || filters.includes("all")) {
      onFilterChange([]);
      return;
    }
    onFilterChange(filters.filter((id) => id !== "all"));
  };

  const chipSelected =
    selectedFilters.length === 0 ? ["all"] : selectedFilters;

  return (
    <div className="min-w-0 animate-page-enter">
      {/* Mobile — Header + Suche + Chips dentro del Provider (mismo patrón Storefront) */}
      <div className="block lg:hidden">
        <HeaderNav
          title="Verkauf starten"
          showAddButton={false}
          isFixed={false}
          noSafeArea
        />
        <Filter_Busqueda
          searchQuery={searchQuery}
          onSearch={onSearch}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
          onOpenFilterModal={onOpenFilterModal}
          activeFiltersCount={activeFiltersCount}
          productsListFilters={chargeFilters}
          isFixed={false}
        />
        <FixedHeaderContainer>
          <DashBoardCharge
            searchQuery={searchQuery}
            selectedFilters={selectedFilters}
          />
        </FixedHeaderContainer>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block min-h-dvh">
        <div className="mx-auto max-w-3xl space-y-5 px-6 py-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Verkauf starten
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Wählen Sie Produkte für den Verkauf
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-card focus-within:ring-2 focus-within:ring-[#25D076]">
            <input
              type="search"
              placeholder="Produkte suchen …"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="ios-input-fix min-w-0 flex-1 bg-transparent px-3 py-3 text-base font-medium outline-none placeholder:text-gray-400"
              aria-label="Produkte durchsuchen"
            />
            <button
              type="button"
              onClick={onOpenFilterModal}
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 active:scale-95"
              aria-label="Erweiterte Filter"
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={2.2} />
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#25D076] px-1 text-[10px] font-bold text-white">
                  {activeFiltersCount > 9 ? "9+" : activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {chargeFilters.length > 0 && (
            <CategoryChips
              filters={chargeFilters}
              selectedFilters={chipSelected}
              onFilterChange={handleChipChange}
            />
          )}

          <DashBoardCharge
            searchQuery={searchQuery}
            selectedFilters={selectedFilters}
          />
        </div>
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={currentFilterState}
      />
    </div>
  );
}
