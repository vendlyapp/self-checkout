"use client";

import React, { useState } from "react";
import { Package, Grid3X3, Plus, Percent } from "lucide-react";
import StatCard from "./StatCard";
import ActionButton from "./ActionButton";
import NavigationItem from "./NavigationItem";
import { useProducts, useProductActions } from "@/hooks";
import { getActiveProductsCount, getActiveCategoriesCount } from "./data";
import {
  ProductsDashboardSkeletonLoader,
  ProductsErrorState,
} from "@/components/dashboard/skeletons";
import { SearchInput } from "@/components/ui/search-input";

// Componente Principal del Dashboard de Productos
export default function ProductsDashboard() {
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Usando hooks para datos y acciones
  const { data, loading, error, refresh } = useProducts();
  const { handleNewProduct, handleProductList, handleCategories } =
    useProductActions();

  // Manejo de estados de carga y error
  if (loading) {
    return <ProductsDashboardSkeletonLoader />;
  }

  if (error) {
    return <ProductsErrorState error={error} onRetry={refresh} />;
  }

  // Calcular valores derivados
  const activeProductsCount = getActiveProductsCount(data.products);
  const activeCategoriesCount = getActiveCategoriesCount(data.categories);

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
              className="w-full"
            />
          </div>
          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Package className="w-5 h-5 text-white " />}
              title="Produkte"
              value={data.products.total}
              subtitle="Produkte"
              trend={data.products.trend}
              trendData={data.products.trendData}
              badge={`${data.products.newProducts} Neu`}
              className="bg-background-cream"
            />

            <StatCard
              icon={<Grid3X3 className="w-5 h-5 text-white " />}
              title="Kategorien"
              value={data.categories.total}
              subtitle="Kategorien"
              trend={data.categories.trend}
              trendData={data.categories.trendData}
              badge={`${data.categories.newCategories} Neu`}
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
              value={data.products.total}
              subtitle="Gesamt Produkte"
              trend={data.products.trend}
              trendData={data.products.trendData}
              badge={`${data.products.newProducts} Neu`}
              className="bg-white shadow-sm border border-gray-200"
            />

            <StatCard
              icon={<Grid3X3 className="w-6 h-6 text-white" />}
              title="Kategorien"
              value={data.categories.total}
              subtitle="Gesamt Kategorien"
              trend={data.categories.trend}
              trendData={data.categories.trendData}
              badge={`${data.categories.newCategories} Neu`}
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
