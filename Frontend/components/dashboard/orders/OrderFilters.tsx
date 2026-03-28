"use client";

import { SearchInput } from "@/components/ui/search-input";
import { TOP_FILTER_SEARCH_BAR_PX, TOP_FILTER_SLIDER_BAR_PX } from "@/lib/constants/layoutHeights";
import { OrderStatusFilterChips } from "@/components/dashboard/orders/OrderStatusFilterChips";

interface OrderFiltersProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  isFixed?: boolean;
}

export default function OrderFilters({ searchQuery, onSearch, isFixed = false }: OrderFiltersProps) {
  return (
    <>
      <div
        className={`${isFixed ? "fixed" : ""} left-0 right-0 flex justify-center bg-background-cream ${isFixed ? "z-40" : ""} animate-slide-down px-4 py-3 box-border`}
        style={isFixed ? { top: `${TOP_FILTER_SEARCH_BAR_PX}px` } : undefined}
      >
        <div className="animate-stagger-1 w-full max-w-[430px] min-w-0">
          <SearchInput
            placeholder="Nach Bestellnummer, Kunde oder Zahlungsmethode suchen…"
            className="w-full h-[54px] transition-interactive"
            value={searchQuery}
            onChange={onSearch}
          />
        </div>
      </div>

      <div
        className={`${isFixed ? "fixed" : ""} left-0 right-0 bg-background-cream ${isFixed ? "z-40" : ""} animate-slide-down`}
        style={
          isFixed
            ? {
                top: `${TOP_FILTER_SLIDER_BAR_PX}px`,
                animationDelay: "0.1s",
                animationFillMode: "both",
              }
            : { animationDelay: "0.1s", animationFillMode: "both" }
        }
      >
        <div className="max-w-[430px] mx-auto w-full px-4 pb-2.5 pt-1 box-border">
          <OrderStatusFilterChips />
        </div>
      </div>
    </>
  );
}
