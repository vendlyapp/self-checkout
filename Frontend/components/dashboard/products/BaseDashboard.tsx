"use client";

import React, { useState, useEffect } from "react";
import { Package, Grid3X3, Plus, Percent } from "lucide-react";
import StatCard from "./StatCard";
import ActionButton from "./ActionButton";
import NavigationItem from "./NavigationItem";
import { useProductsData, useProductActions, useResponsive } from "@/hooks";
import { useProductStats } from "@/hooks/queries/useProductStats";
import { useCategoryStats } from "@/hooks/queries/useCategoryStats";
import { getActiveProductsCount, getActiveCategoriesCount } from "./data";
import type { ProductsAnalyticsData } from "./types";
import { useProductsAnalyticsStore } from "@/lib/stores/productsAnalyticsStore";
import {
  ProductsDashboardSkeletonLoader,
  ProductsErrorState,
} from "@/components/dashboard/skeletons";
import { SearchInput } from "@/components/ui/search-input";

// Componente Principal del Dashboard de Productos
export default function ProductsDashboard() {
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Estado para controlar si ya intentamos refrescar
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  // Usando hooks para datos y acciones
  const { data, loading, error, refresh } = useProductsData();
  const { handleNewProduct, handleProductList, handleCategories, handleDiscounts } =
    useProductActions();
  
  // Obtener estadísticas de productos (mismo hook que MainActionCards)
  const { data: productStats, isLoading: productStatsLoading } = useProductStats();
  
  // Obtener estadísticas de categorías (mismo endpoint que el backend)
  const { data: categoryStats, isLoading: categoryStatsLoading } = useCategoryStats();
  
  // Obtener datos del store como fallback inmediato
  const { data: storeData, isStale } = useProductsAnalyticsStore();

  // Hooks que no pueden ir después de un return (Rules of Hooks)
  const { screenWidth } = useResponsive();
  const showThreeCardsInRow = screenWidth >= 1280;
  
  // Si hay datos en el store y no están viejos, usarlos mientras carga
  const immediateData = storeData && !isStale() ? storeData : null;

  // Debug logging
  React.useEffect(() => {
    if (loading) {
      console.log('[ProductsDashboard] Loading products data...');
    }
    if (error) {
      console.error('[ProductsDashboard] Error loading products:', error);
    }
    if (data) {
      console.log('[ProductsDashboard] Products data loaded:', {
        hasData: !!data,
        hasProducts: !!data.products,
        hasCategories: !!data.categories,
        productsTotal: data.products?.total,
        categoriesTotal: data.categories?.total,
        dataStructure: JSON.stringify(data, null, 2),
      });
    } else {
      console.warn('[ProductsDashboard] No data available');
    }
  }, [loading, error, data]);

  // Intentar refrescar una vez si no hay datos
  useEffect(() => {
    if (!data || !data.products || !data.categories) {
      if (!hasTriedRefresh) {
        setHasTriedRefresh(true);
        const timer = setTimeout(() => {
          refresh();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [data, hasTriedRefresh, refresh]);

  // Mostrar skeleton mientras cargan los datos (analytics, stats de productos y categorías)
  const isDataLoading = loading || productStatsLoading || categoryStatsLoading;
  if (isDataLoading) {
    return <ProductsDashboardSkeletonLoader />;
  }

  if (error) {
    return <ProductsErrorState error={error} onRetry={refresh} />;
  }

  // Usar datos del store si están disponibles y los datos de la query aún no están listos
  const displayData = data || immediateData;

  // Validar y usar datos reales
  // Aceptar datos incluso si los totales son 0 (puede ser que no haya productos aún)
  if (!displayData) {
    // Si ya intentamos refrescar y aún no hay datos, mostrar skeleton
    if (hasTriedRefresh) {
      console.warn('[ProductsDashboard] No data after refresh attempt');
      return <ProductsDashboardSkeletonLoader />;
    }
    // Si aún no hemos intentado refrescar, mostrar skeleton mientras intenta
    return <ProductsDashboardSkeletonLoader />;
  }

  // Asegurar que products y categories existan, incluso si son objetos con total: 0
  // Usar el total de productStats si está disponible (mismo que MainActionCards)
  const productsTotal = productStats?.total ?? displayData?.products?.total ?? 0;
  
  // Usar el total de categoryStats si está disponible (mismo endpoint del backend)
  const categoriesTotal = categoryStats?.total ?? displayData?.categories?.total ?? 0;
  
  const finalData: ProductsAnalyticsData = {
    products: {
      total: productsTotal, // Usar el total de useProductStats (mismo que MainActionCards)
      trend: displayData?.products?.trend || 'neutral',
      trendData: displayData?.products?.trendData || [0, 0, 0, 0, 0, 0, productsTotal],
      newProducts: displayData?.products?.newProducts || 0,
    },
    categories: {
      total: categoriesTotal, // Usar el total de useCategoryStats (mismo endpoint del backend)
      trend: displayData?.categories?.trend || 'neutral',
      trendData: displayData?.categories?.trendData || [0, 0, 0, 0, 0, 0, categoriesTotal],
      newCategories: displayData?.categories?.newCategories || 0,
    },
    lastUpdated: displayData?.lastUpdated || new Date().toISOString(),
  };

  console.log('[ProductsDashboard] Final data structure:', {
    hasProducts: !!finalData.products,
    hasCategories: !!finalData.categories,
    productsTotal: finalData.products?.total,
    categoriesTotal: finalData.categories?.total,
  });

  const activeProductsCount = getActiveProductsCount(finalData.products);
  const activeCategoriesCount = getActiveCategoriesCount(finalData.categories);

  // Renderizar con datos reales
  return (
    <div className="w-full">
      {/* ===== MÓVIL (< 768px) ===== */}
      <div className="block md:hidden min-w-0">
        <div className="p-4 space-y-5">
          <div className="w-full min-w-0">
            <SearchInput
              placeholder="Suche Produkte / Verkäufe"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={() => {}}
              className="w-full h-12 min-h-12"
              esHome={false}
            />
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 min-w-0">
            <StatCard
              icon={<Package className="w-5 h-5 text-white" />}
              title="Produkte"
              value={finalData.products.total}
              subtitle="Produkte"
              trend={finalData.products.trend}
              trendData={finalData.products.trendData}
              badge={`${finalData.products.newProducts} Neu`}
              className="bg-background-cream"
            />
            <StatCard
              icon={<Grid3X3 className="w-5 h-5 text-white" />}
              title="Kategorien"
              value={finalData.categories.total}
              subtitle="Kategorien"
              trend={finalData.categories.trend}
              trendData={finalData.categories.trendData}
              badge={`${finalData.categories.newCategories} Neu`}
              className="bg-background-cream"
            />
          </div>
          <ActionButton
            icon={<Plus className="w-5 h-5" />}
            title="Neues Produkt"
            subtitle="Artikel anlegen"
            onClick={handleNewProduct}
            variant="primary"
          />
          {/* Verwalten */}
          <div className="space-y-2">
            <NavigationItem
              icon={<Package className="w-5 h-5 text-muted-foreground" />}
              title="Produktliste"
              subtitle="bearbeiten"
              badge={`${activeProductsCount} aktiv`}
              badgeVariant="success"
              onClick={handleProductList}
            />
            <NavigationItem
              icon={<Grid3X3 className="w-5 h-5 text-muted-foreground" />}
              title="Kategorien"
              subtitle="verwalten"
              badge={`${activeCategoriesCount} aktiv`}
              badgeVariant="success"
              onClick={handleCategories}
            />
            <NavigationItem
              icon={<Percent className="w-5 h-5 text-muted-foreground" />}
              title="Aktionen"
              subtitle="Rabatte & Codes"
              badge={`${activeProductsCount} aktiv`}
              badgeVariant="success"
              onClick={handleDiscounts}
            />
          </div>
        </div>
      </div>

      {/* ===== TABLET + DESKTOP (≥ 768px) ===== */}
      <div className="hidden md:block">
        <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-8 xl:p-10 space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12 min-w-0 max-w-[1600px]">
          {/* Header: título + barra de búsqueda — más separado del navbar en tablet, barra más compacta */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 lg:gap-8 md:min-h-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground tracking-tight">Produktverwaltung</h1>
              <p className="text-muted-foreground mt-1 md:mt-1.5 text-sm md:text-sm lg:text-base">Verwalten Sie Ihre Produkte, Kategorien und Aktionen</p>
            </div>
            <div className="w-full md:w-[200px] lg:w-[300px] xl:w-[380px] flex-shrink-0 md:flex md:items-center">
              <SearchInput
                placeholder="Produkte durchsuchen..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => {}}
                className="w-full h-10 min-h-10 md:h-9 md:min-h-9 lg:h-11 lg:min-h-11"
                inputClassName="text-xs md:text-xs lg:text-sm placeholder:text-xs md:placeholder:text-xs lg:placeholder:text-sm"
                esHome={false}
              />
            </div>
          </div>

          {/* Stats: 3 columnas desde 1008px (1024 con scrollbar); tablet: más compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 min-[1008px]:grid-cols-3 gap-4 md:gap-5 min-[1008px]:gap-8 min-w-0">
            <StatCard
              icon={<Package className="w-5 h-5 md:w-5 md:h-5 min-[1008px]:w-6 min-[1008px]:h-6 text-white" />}
              title="Produkte"
              value={finalData.products.total}
              subtitle="Gesamt Produkte"
              trend={finalData.products.trend}
              trendData={finalData.products.trendData}
              badge={`${finalData.products.newProducts} Neu`}
              className="min-h-[180px] md:min-h-[200px] min-[1008px]:min-h-[240px]"
            />
            <StatCard
              icon={<Grid3X3 className="w-5 h-5 md:w-5 md:h-5 min-[1008px]:w-6 min-[1008px]:h-6 text-white" />}
              title="Kategorien"
              value={finalData.categories.total}
              subtitle="Gesamt Kategorien"
              trend={finalData.categories.trend}
              trendData={finalData.categories.trendData}
              badge={`${finalData.categories.newCategories} Neu`}
              className="min-h-[180px] md:min-h-[200px] min-[1008px]:min-h-[240px]"
            />
            <div className="bg-card rounded-2xl p-5 md:p-6 min-[1008px]:p-7 shadow-sm border border-border md:col-span-2 min-[1008px]:col-span-1 min-h-[180px] md:min-h-[200px] min-[1008px]:min-h-[240px] flex flex-col justify-between">
              <div>
                <h3 className="text-base md:text-lg min-[1008px]:text-xl font-semibold text-foreground mb-3 md:mb-4 min-[1008px]:mb-5">Schnellaktionen</h3>
                <ActionButton
                  icon={<Plus className="w-5 h-5 md:w-5 md:h-5 min-[1008px]:w-6 min-[1008px]:h-6" />}
                  title="Neues Produkt"
                  subtitle="Artikel anlegen"
                  onClick={handleNewProduct}
                  variant="primary"
                />
              </div>
            </div>
          </div>

          {/* Navegación: columna hasta 1279px (incl. 1024x1366); 3 cards en fila desde 1280px */}
          {showThreeCardsInRow ? (
            <div className="grid grid-cols-3 gap-6 xl:gap-8 min-w-0">
            <div className="bg-card rounded-2xl p-6 xl:p-7 shadow-sm border border-border min-h-[200px] flex flex-col">
              <h3 className="text-lg xl:text-xl font-semibold text-foreground mb-4">Produktverwaltung</h3>
              <div className="flex-1 flex items-center">
                <NavigationItem
                  icon={<Package className="w-5 h-5 text-muted-foreground" />}
                  title="Produktliste"
                  subtitle="bearbeiten"
                  badge={`${activeProductsCount} aktiv`}
                  badgeVariant="success"
                  onClick={handleProductList}
                  compact
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 xl:p-7 shadow-sm border border-border min-h-[200px] flex flex-col">
              <h3 className="text-lg xl:text-xl font-semibold text-foreground mb-4">Kategorien</h3>
              <div className="flex-1 flex items-center">
                <NavigationItem
                  icon={<Grid3X3 className="w-5 h-5 text-muted-foreground" />}
                  title="Kategorien"
                  subtitle="verwalten"
                  badge={`${activeCategoriesCount} aktiv`}
                  badgeVariant="success"
                  onClick={handleCategories}
                  compact
                />
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 xl:p-7 shadow-sm border border-border min-h-[200px] flex flex-col">
              <h3 className="text-lg xl:text-xl font-semibold text-foreground mb-4">Aktionen</h3>
              <div className="flex-1 flex items-center">
                <NavigationItem
                  icon={<Percent className="w-5 h-5 text-muted-foreground" />}
                  title="Rabatte & Codes"
                  subtitle="erstellen & bearbeiten"
                  badge={`${activeProductsCount} aktiv`}
                  badgeVariant="success"
                onClick={handleDiscounts}
                compact
                />
              </div>
            </div>
          </div>
          ) : (
            <div className="min-w-0 max-w-2xl">
              <div className="bg-card rounded-2xl p-5 md:p-6 lg:p-7 shadow-sm border border-border min-h-[260px] md:min-h-[280px] flex flex-col">
                <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 md:mb-5">Verwalten</h3>
                <div className="space-y-2 md:space-y-3 min-w-0 flex-1">
                  <NavigationItem
                    icon={<Package className="w-5 h-5 text-muted-foreground" />}
                    title="Produktliste"
                    subtitle="bearbeiten"
                    badge={`${activeProductsCount} aktiv`}
                    badgeVariant="success"
                    onClick={handleProductList}
                  />
                  <NavigationItem
                    icon={<Grid3X3 className="w-5 h-5 text-muted-foreground" />}
                    title="Kategorien"
                    subtitle="verwalten"
                    badge={`${activeCategoriesCount} aktiv`}
                    badgeVariant="success"
                    onClick={handleCategories}
                  />
                  <NavigationItem
                    icon={<Percent className="w-5 h-5 text-muted-foreground" />}
                    title="Rabatte & Codes"
                    subtitle="erstellen & bearbeiten"
                    badge={`${activeProductsCount} aktiv`}
                    badgeVariant="success"
                    onClick={handleDiscounts}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
