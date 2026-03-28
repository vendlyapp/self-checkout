"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Product,
  normalizeProductData,
} from "./data/mockProducts";
import { useProducts, useCategories } from "@/hooks/queries";
import { getIcon } from "./data/iconMap";
import ProductCardList from "./ProductCardList";
import FilterModal, { FilterState } from "./FilterModal";
import { useProductsList } from "./ProductsListContext";
import FixedHeaderContainer from "./FixedHeaderContainer";
import { Loader } from "@/components/ui/Loader";

interface ProductsListComponentProps {
  isStandalone?: boolean; // Si es true, es la página dedicada. Si es false, es parte del dashboard
  onProductClick?: (product: Product) => void;
  className?: string;
  maxHeight?: string; // Altura máxima para el contenedor con scroll
  title?: string;
  showAddButton?: boolean;
}

// Función helper para transformar categorías de la API al formato de filtros
// Usa solo las categorías reales de la base de datos
const transformCategoriesToFilters = (categories: { id: string; name: string; icon?: string; isActive?: boolean }[], products: Product[]) => {
  // Agregar la opción "all" al inicio
  const allProductsCount = products.length;
  const filters = [
    {
      id: 'all',
      label: 'Alle',
      icon: getIcon('ShoppingCart'),
      count: allProductsCount,
    }
  ];

  // Agregar solo las categorías reales de la API con sus iconos y nombres reales
  categories.forEach((category) => {
    // Solo incluir categorías activas
    if (category.isActive !== false) {
      // Contar productos que pertenecen a esta categoría
      const count = products.filter(p => p.categoryId === category.id).length;
      
      filters.push({
        id: category.id, // ID real de la categoría
        label: category.name, // Nombre real de la categoría
        icon: category.icon ? getIcon(category.icon) : getIcon('Package'), // Icono real de la categoría
        count: count, // Conteo dinámico
      });
    }
  });

  return filters;
};

export default function ProductsListComponent({
  isStandalone = false,
  onProductClick,
  className = "",
  maxHeight = "100dvh",
}: ProductsListComponentProps) {
  // Estado local para cuando NO es standalone
  const [, setLocalSelectedFilters] = useState<string[]>(
    []
  );
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [localFilterState, setLocalFilterState] = useState<FilterState>({
    sortBy: "name" as const,
    categories: ["all"],
    status: "all" as const,
    priceRange: { min: 0, max: 1000 },
  });

  const [localIsFilterModalOpen, setLocalIsFilterModalOpen] = useState(false);
  
  // Obtener categorías reales de la API
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  // Usar React Query para obtener productos con cache (única fuente de verdad)
  const { data: productsData, isLoading: productsLoading } = useProducts({
    includeInactive: true,
  });

  // Función para agrupar productos padre-hijo
  const groupProductsWithVariants = useCallback((products: Product[]): Product[] => {
    // Separar productos padre (sin parentId) y variantes (con parentId)
    const parentProducts: Product[] = [];
    const variantsMap = new Map<string, Product[]>();

    products.forEach(product => {
      if (product.parentId) {
        // Es una variante
        if (!variantsMap.has(product.parentId)) {
          variantsMap.set(product.parentId, []);
        }
        variantsMap.get(product.parentId)!.push(product);
      } else {
        // Es un producto padre
        parentProducts.push(product);
      }
    });

    // Agregar variantes a sus productos padre
    return parentProducts.map(parent => {
      const variants = variantsMap.get(parent.id) || [];
      return {
        ...parent,
        variants: variants.length > 0 ? variants : undefined
      };
    });
  }, []);

  // Una sola fuente de verdad: derivar groupedProducts desde productsData
  const groupedProducts = useMemo(() => {
    if (!productsData) return [];
    const normalized = productsData.map(normalizeProductData);
    return groupProductsWithVariants(normalized);
  }, [productsData, groupProductsWithVariants]);

  // Transformar categorías a formato de filtros con contadores dinámicos (usa groupedProducts)
  const productsListFilters = useMemo(() => {
    if (!categoriesData) {
      return [
        { id: 'all', label: 'Alle', icon: getIcon('ShoppingCart'), count: groupedProducts.length },
      ];
    }
    return transformCategoriesToFilters(categoriesData, groupedProducts);
  }, [categoriesData, groupedProducts]);
  
  const [filters, setFilters] = useState(productsListFilters);
  
  // Actualizar filtros cuando cambian las opciones disponibles
  useEffect(() => {
    setFilters(productsListFilters);
  }, [productsListFilters]);

  const {
    filterState: contextFilterState,
    searchQuery: contextSearchQuery,
    setFilterState: setContextFilterState,
    setSelectedFilters: setContextSelectedFilters,
    selectedFilters: contextSelectedFilters,
    setSearchQuery: setContextSearchQuery,
    setTotalProducts,
    setFilteredProducts,
    setHasActiveFilters,
    setIsLoading,
    isLoading,
    onOpenFilterModal: contextOnOpenFilterModal,
    onCloseFilterModal: contextOnCloseFilterModal,
    isFilterModalOpen: contextIsFilterModalOpen,
  } = useProductsList();

  // Usar estado del contexto cuando es standalone, estado local cuando no
  const searchQuery = isStandalone ? contextSearchQuery : localSearchQuery;
  const filterState = isStandalone ? contextFilterState : localFilterState;
  const isFilterModalOpen = isStandalone 
    ? (contextIsFilterModalOpen ?? false)
    : localIsFilterModalOpen;

  const setSelectedFilters = isStandalone
    ? setContextSelectedFilters
    : setLocalSelectedFilters;
  const setSearchQuery = isStandalone
    ? setContextSearchQuery
    : setLocalSearchQuery;
  const setFilterState = isStandalone
    ? setContextFilterState
    : setLocalFilterState;
  
  // Obtener selectedFilters del contexto cuando es standalone
  const selectedFilters = isStandalone 
    ? (contextSelectedFilters || [])
    : [];

  // Función para aplicar filtros reales a los productos
  const applyFiltersToProducts = useCallback(
    (products: Product[], filters: FilterState, searchTerm?: string) => {
      let filteredProducts = [...products];

      // Filtrar por búsqueda (searchQuery)
      if (searchTerm && searchTerm.trim() !== "") {
        const searchLower = searchTerm.toLowerCase().trim();
        filteredProducts = filteredProducts.filter((product) => {
          const nameMatch = product.name.toLowerCase().includes(searchLower);
          const descriptionMatch = product.description?.toLowerCase().includes(searchLower);
          const skuMatch = product.sku?.toLowerCase().includes(searchLower);
          const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchLower));
          return nameMatch || descriptionMatch || skuMatch || tagsMatch;
        });
      }

      // Filtrar por categorías
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes("all")
      ) {
        filteredProducts = filteredProducts.filter((product) =>
          filters.categories.includes(product.categoryId)
        );
      }

      // Filtrar por estado
      if (filters.status !== "all") {
        switch (filters.status) {
          case "active":
            filteredProducts = filteredProducts.filter(
              (product) => product.isActive !== false && product.stock > 0
            );
            break;
          case "inactive":
            filteredProducts = filteredProducts.filter(
              (product) => product.isActive === false
            );
            break;
          case "onSale":
            filteredProducts = filteredProducts.filter(
              (product) =>
                product.isOnSale ||
                product.discountPercentage ||
                product.originalPrice
            );
            break;
        }
      }

      // Filtrar por rango de precio
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.price >= filters.priceRange.min &&
          product.price <= filters.priceRange.max
      );

      // Ordenar productos
      switch (filters.sortBy) {
        case "price-asc":
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          filteredProducts.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "name":
        default:
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }

      return filteredProducts;
    },
    []
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;

    // Contar filtros de categorías (excluyendo 'all')
    if (
      filterState.categories.length > 0 &&
      !filterState.categories.includes("all")
    ) {
      count += filterState.categories.length;
    }

    // Contar filtro de ordenamiento (si no es 'name' por defecto)
    if (filterState.sortBy !== "name") {
      count += 1;
    }

    // Contar filtro de estado (si no es 'all')
    if (filterState.status !== "all") {
      count += 1;
    }

    // Contar filtro de rango de precio (si no es el rango por defecto)
    if (filterState.priceRange.min !== 0 || filterState.priceRange.max !== 1000) {
      count += 1;
    }

    return count;
  }, [filterState]);

  const activeFiltersCount = getActiveFiltersCount();

  // Derivar lista filtrada desde groupedProducts (una sola fuente de verdad)
  const filteredProducts = useMemo(
    () => applyFiltersToProducts(groupedProducts, filterState, searchQuery),
    [groupedProducts, filterState, searchQuery, applyFiltersToProducts]
  );

  // Un único efecto para actualizar el contexto del dashboard (total, filtrados, hasActiveFilters)
  useEffect(() => {
    if (isStandalone) {
      setTotalProducts(groupedProducts.length);
      setFilteredProducts(filteredProducts.length);
      setHasActiveFilters(activeFiltersCount > 0);
    }
  }, [isStandalone, groupedProducts.length, filteredProducts.length, activeFiltersCount, setTotalProducts, setFilteredProducts, setHasActiveFilters]);

  // Sincronizar isLoading del contexto con React Query
  useEffect(() => {
    if (isStandalone) {
      setIsLoading(productsLoading || categoriesLoading);
    }
  }, [productsLoading, categoriesLoading, isStandalone, setIsLoading]);

  const handleOpenFilterModal = () => {
    if (isStandalone && contextOnOpenFilterModal) {
      contextOnOpenFilterModal();
    } else {
      setLocalIsFilterModalOpen(true);
    }
  };

  const handleCloseFilterModal = () => {
    if (isStandalone && contextOnCloseFilterModal) {
      contextOnCloseFilterModal();
    } else {
      setLocalIsFilterModalOpen(false);
    }
  };

  const handleApplyFilters = useCallback((filters: FilterState) => {
    setFilterState(filters);
    const newSelectedFilters =
      filters.categories.length === 0 || filters.categories.includes("all")
        ? ["all"]
        : filters.categories;
    setSelectedFilters(newSelectedFilters);
    // filteredProducts y contexto se actualizan vía useMemo y el efecto único
  }, [setFilterState, setSelectedFilters]);

  const defaultFilters: FilterState = useMemo(() => ({
    sortBy: "name" as const,
    categories: ["all"],
    status: "all" as const,
    priceRange: { min: 0, max: 1000 },
  }), []);

  const handleClearFilters = useCallback(() => {
    setFilterState(defaultFilters);
    setSelectedFilters(["all"]);
    setSearchQuery("");
    // filteredProducts y contexto se actualizan vía useMemo y el efecto único
  }, [defaultFilters, setFilterState, setSelectedFilters, setSearchQuery]);

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  // Los productos se cargan automáticamente con React Query
  // No necesitamos un useEffect separado

  // Si es standalone, usar el contenedor fijo (igual que charge)
  if (isStandalone) {
    return (
      <FixedHeaderContainer>
        <div className={`p-4 pb-32 lg:p-0 lg:pb-8 mt-6 ${className}`}>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader size="lg" className="mx-auto" />
              <p className="mt-4 text-base text-gray-500 font-medium">
                Produkte werden geladen...
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3 animate-fade-in-scale">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up-fade gpu-accelerated"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCardList
                    product={product}
                    onClick={onProductClick ? () => handleProductClick(product) : undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base font-medium">
                {searchQuery
                  ? `Keine Produkte für "${searchQuery}" gefunden`
                  : activeFiltersCount > 0
                  ? "Keine Produkte entsprechen den ausgewählten Filtern"
                  : "Keine Produkte verfügbar"}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de filtros */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={handleCloseFilterModal}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          currentFilters={filterState}
        />
      </FixedHeaderContainer>
    );
  }

  // Si no es standalone, solo retornar la lista de productos
  return (
    <div className={`relative ${className}`}>
      {/* Lista de productos con SCROLL PROPIO */}
      <div
        className={`${
          !isStandalone && maxHeight !== "none" ? "overflow-y-auto" : ""
        }`}
        style={!isStandalone && maxHeight !== "none" ? { maxHeight } : {}}
      >
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader size="md" className="mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">
                Produkte werden geladen...
              </p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3 animate-fade-in-scale">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up-fade gpu-accelerated"
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <ProductCardList
                    product={product}
                    onClick={onProductClick ? () => handleProductClick(product) : undefined}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? `Keine Produkte für "${searchQuery}" gefunden`
                  : activeFiltersCount > 0
                  ? "Keine Produkte entsprechen den ausgewählten Filtern"
                  : "Keine Produkte verfügbar"}
              </p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de filtros */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        currentFilters={filterState}
      />
    </div>
  );
}
