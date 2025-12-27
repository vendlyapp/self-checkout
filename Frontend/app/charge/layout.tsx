"use client";

import { ReactNode, useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useScrollReset } from "@/hooks";
import { FilterOption } from "@/components/Sliders/SliderFIlter";
import { getIcon } from "@/components/dashboard/products_list/data/iconMap";
import { FilterModalProvider, ChargeProvider } from "./contexts";
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext";
import { useCategories } from "@/hooks/queries/useCategories";
import { useProducts } from "@/hooks/queries";
import { normalizeProductData } from "@/components/dashboard/products_list/data/mockProducts";

// Tipos internos
interface ChargeContextType {
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  onOpenFilterModal: () => void;
  activeFiltersCount: number;
  chargeFilters: FilterOption[];
}

interface ChargeLayoutProps {
  children: ReactNode;
}

export default function ChargeLayout({ children }: ChargeLayoutProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const { } = useScrollReset();

  // Obtener categorías y productos reales de la API
  const { data: categoriesData = [] } = useCategories();
  const { data: productsData = [] } = useProducts({ isActive: true });

  // Calcular filtros de charge con contadores dinámicos usando datos reales
  const chargeFilters: FilterOption[] = useMemo(() => {
    if (!categoriesData || !productsData) {
      // Si no hay datos, retornar solo la opción "all"
      return [
        {
          id: 'all',
          label: 'Alle',
          icon: getIcon('ShoppingCart'),
          count: 0,
        }
      ];
    }

    const normalizedProducts = productsData.map(normalizeProductData);
    const allProductsCount = normalizedProducts.length;

    // Crear filtros basados en categorías reales
    const categoryFilters: FilterOption[] = categoriesData
      .filter(cat => cat.isActive !== false)
      .map(cat => {
        const count = normalizedProducts.filter(p => p.categoryId === cat.id).length;
        return {
          id: cat.id,
          label: cat.name,
          icon: getIcon(cat.icon || 'Package'),
          count: count,
        };
      });

    // Agregar filtros especiales (new, popular, sale, promotions)
    const newCount = normalizedProducts.filter(p => p.isNew).length;
    const popularCount = normalizedProducts.filter(p => p.isPopular).length;
    const saleCount = normalizedProducts.filter(p => p.isOnSale).length;
    const promotionsCount = normalizedProducts.filter(
      p => p.isOnSale || p.originalPrice
    ).length;

    return [
      {
        id: 'all',
        label: 'Alle',
        icon: getIcon('ShoppingCart'),
        count: allProductsCount,
      },
      ...categoryFilters,
      ...(newCount > 0 ? [{
        id: 'new',
        label: 'Neu',
        icon: getIcon('Star'),
        count: newCount,
      }] : []),
      ...(popularCount > 0 ? [{
        id: 'popular',
        label: 'Beliebt',
        icon: getIcon('Heart'),
        count: popularCount,
      }] : []),
      ...(saleCount > 0 ? [{
        id: 'sale',
        label: 'Angebot',
        icon: getIcon('Tag'),
        count: saleCount,
      }] : []),
      ...(promotionsCount > 0 ? [{
        id: 'promotions',
        label: 'Aktionen',
        icon: getIcon('Percent'),
        count: promotionsCount,
      }] : []),
    ];
  }, [categoriesData, productsData]);

  // Actualizar contador de filtros activos
  useEffect(() => {
    setActiveFiltersCount(selectedFilters.length);
  }, [selectedFilters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const chargeContextValue: ChargeContextType = {
    searchQuery,
    onSearch: handleSearch,
    selectedFilters,
    onFilterChange: handleFilterChange,
    onOpenFilterModal: handleOpenFilterModal,
    activeFiltersCount,
    chargeFilters,
  };

  return (
    <LoadingProductsModalProvider>
      <FilterModalProvider
        value={{ isFilterModalOpen, setIsFilterModalOpen }}
      >
        <ChargeProvider value={chargeContextValue}>
          <AdminLayout>
            <div className="gpu-accelerated">
              {children}
            </div>
          </AdminLayout>
        </ChargeProvider>
      </FilterModalProvider>
    </LoadingProductsModalProvider>
  );
}
