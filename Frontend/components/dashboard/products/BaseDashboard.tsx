"use client";

import React, { useState, useEffect } from "react";
import { Package, Grid3X3, Plus, Percent } from "lucide-react";
import StatCard from "./StatCard";
import ActionButton from "./ActionButton";
import NavigationItem from "./NavigationItem";
import { useProductsData, useProductActions } from "@/hooks";
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
  const { handleNewProduct, handleProductList, handleCategories } =
    useProductActions();
  
  // Obtener estadísticas de productos (mismo hook que MainActionCards)
  const { data: productStats } = useProductStats();
  
  // Obtener estadísticas de categorías (mismo endpoint que el backend)
  const { data: categoryStats } = useCategoryStats();
  
  // Obtener datos del store como fallback inmediato
  const { data: storeData, isStale } = useProductsAnalyticsStore();
  
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

  // Manejo de estados de carga y error
  if (loading) {
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
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-6">
          <div>
            <SearchInput
              placeholder="Suche Produkte / Verkäufe"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={() => {}}
              className="w-full h-[54px]"
            />
          </div>
          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Package className="w-5 h-5 text-white " />}
              title="Produkte"
              value={finalData.products.total}
              subtitle="Produkte"
              trend={finalData.products.trend}
              trendData={finalData.products.trendData}
              badge={`${finalData.products.newProducts} Neu`}
              className="bg-background-cream"
            />

            <StatCard
              icon={<Grid3X3 className="w-5 h-5 text-white " />}
              title="Kategorien"
              value={finalData.categories.total}
              subtitle="Kategorien"
              trend={finalData.categories.trend}
              trendData={finalData.categories.trendData}
              badge={`${finalData.categories.newCategories} Neu`}
              className="bg-background-cream"
            />
          </div>
          {/* Botón de Acción Principal */}
          <ActionButton
            icon={<Plus className="w-5 h-5" />}
            title="Neues Produkt"
            subtitle="Artikel anlegen"
            onClick={handleNewProduct}
            variant="primary"
          />
          {/* Elementos de Navegación */}
          <div className="space-y-3">
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
              subtitle="erstellen & bearbeiten"
              badge={`${activeProductsCount} aktiv`}
              badgeVariant="success"
            />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Produktverwaltung</h1>
              <p className="text-gray-600 mt-1">Verwalten Sie Ihre Produkte, Kategorien und Aktionen</p>
            </div>
            <div className="w-full lg:w-[500px]">
              <SearchInput
                placeholder="Produkte durchsuchen..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={() => {}}
                className="w-full"
                esHome={false}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<Package className="w-6 h-6 text-white" />}
              title="Produkte"
              value={finalData.products.total}
              subtitle="Gesamt Produkte"
              trend={finalData.products.trend}
              trendData={finalData.products.trendData}
              badge={`${finalData.products.newProducts} Neu`}
              className="bg-white shadow-sm border border-gray-200"
            />

            <StatCard
              icon={<Grid3X3 className="w-6 h-6 text-white" />}
              title="Kategorien"
              value={finalData.categories.total}
              subtitle="Gesamt Kategorien"
              trend={finalData.categories.trend}
              trendData={finalData.categories.trendData}
              badge={`${finalData.categories.newCategories} Neu`}
              className="bg-white shadow-sm border border-gray-200"
            />

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Schnellaktionen</h3>
                <Plus className="w-5 h-5 text-gray-400" />
              </div>
              <ActionButton
                icon={<Plus className="w-5 h-5" />}
                title="Neues Produkt"
                subtitle="Artikel anlegen"
                onClick={handleNewProduct}
                variant="primary"
              />
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Produktverwaltung</h3>
              <div className="space-y-3">
                <NavigationItem
                  icon={<Package className="w-5 h-5 text-muted-foreground" />}
                  title="Produktliste"
                  subtitle="bearbeiten"
                  badge={`${activeProductsCount} aktiv`}
                  badgeVariant="success"
                  onClick={handleProductList}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategorien</h3>
              <div className="space-y-3">
                <NavigationItem
                  icon={<Grid3X3 className="w-5 h-5 text-muted-foreground" />}
                  title="Kategorien"
                  subtitle="verwalten"
                  badge={`${activeCategoriesCount} aktiv`}
                  badgeVariant="success"
                  onClick={handleCategories}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktionen</h3>
              <div className="space-y-3">
                <NavigationItem
                  icon={<Percent className="w-5 h-5 text-muted-foreground" />}
                  title="Aktionen"
                  subtitle="erstellen & bearbeiten"
                  badge={`${activeProductsCount} aktiv`}
                  badgeVariant="success"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
