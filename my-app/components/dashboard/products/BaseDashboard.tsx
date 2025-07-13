'use client';

import React, { useState } from 'react';
import { Package, Grid3X3, Plus, Percent } from 'lucide-react';
import StatCard from './StatCard';
import ActionButton from './ActionButton';
import NavigationItem from './NavigationItem';
import { useProducts, useProductActions } from './hooks';
import { getActiveProductsCount, getActiveCategoriesCount } from './data';
import { ProductsDashboardSkeletonLoader, ProductsErrorState } from '@/components/dashboard/skeletons';
import { SearchInput } from '@/components/ui/search-input';

// Componente Principal del Dashboard de Productos
export default function ProductsDashboard() {

   // Estados para búsqueda
   const [searchQuery, setSearchQuery] = useState<string>('');
 
  // Usando hooks para datos y acciones
  const { data, loading, error, refresh } = useProducts();
  const { handleNewProduct, handleProductList, handleCategories } = useProductActions();

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
    <div className="p-4 space-y-4 bg-background h-full">
     
      <section className="mb-8">
          <SearchInput 
            placeholder="Suche Produkte / Verkäufe"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={() => {}}
            className="w-full"
          />
        </section>
 

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
  );
}