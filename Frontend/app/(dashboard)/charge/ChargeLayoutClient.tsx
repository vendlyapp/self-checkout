"use client";

import { ReactNode, useState, useEffect, useMemo } from "react";
import { useScrollReset } from "@/hooks";
import { FilterModalProvider, ChargeProvider } from "./contexts";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts, PRODUCT_CATALOG_FILTERS } from "@/hooks/queries/useProducts";
import { normalizeProductData } from "@/components/dashboard/products_list/data/mockProducts";
import { buildChargeFilterChips, filterActiveProducts } from "@/lib/catalog/chargeFilters";

export default function ChargeLayoutClient({ children }: { children: ReactNode }) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['all']);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  useScrollReset();

  const { data: categoriesData = [] } = useCategories();
  // Gleicher Query-Key wie /products_list → kein zweiter API-Call beim Wechsel
  const {
    data: catalogRaw = [],
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts(PRODUCT_CATALOG_FILTERS);

  const catalogProducts = useMemo(() => {
    if (!catalogRaw.length) return [];
    return filterActiveProducts(catalogRaw.map(normalizeProductData));
  }, [catalogRaw]);

  const chargeFilters = useMemo(
    () => buildChargeFilterChips(categoriesData, catalogProducts),
    [categoriesData, catalogProducts]
  );

  const isProductsInitialLoad = productsLoading && catalogRaw.length === 0;

  useEffect(() => {
    const categoryCount = selectedFilters.filter((id) => id !== 'all').length;
    setActiveFiltersCount(categoryCount);
  }, [selectedFilters]);

  const chargeContextValue = {
    searchQuery,
    onSearch: setSearchQuery,
    selectedFilters,
    onFilterChange: setSelectedFilters,
    onOpenFilterModal: () => setIsFilterModalOpen(true),
    activeFiltersCount,
    chargeFilters,
    catalogProducts,
    isProductsInitialLoad,
    productsLoadError: productsError,
    onRetryProducts: () => refetchProducts(),
  };

  return (
    <LoadingProductsModalProvider>
      <FilterModalProvider value={{ isFilterModalOpen, setIsFilterModalOpen }}>
        <ChargeProvider value={chargeContextValue}>
          <div className="min-w-0">{children}</div>
        </ChargeProvider>
      </FilterModalProvider>
    </LoadingProductsModalProvider>
  );
}
