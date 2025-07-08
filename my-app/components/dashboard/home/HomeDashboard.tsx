'use client';

import React from 'react';
import { SearchInput } from '@/components/ui/search-input';

// Import dashboard components and hooks
import {
  GreetingSection,
  MainActionCards,
  DailyGoalCard,
  QuickAccessSlider,
  TodayStatsCard,
  RecentSalesSection,
  SearchResultsSection,
  useDashboard,
  DashboardSkeletonLoader,
  DashboardErrorState
} from '@/components/dashboard';

/**
 * HomeDashboard - Componente principal del dashboard de inicio
 * 
 * Contiene toda la lógica de presentación del dashboard principal
 * incluyendo estado, loading states, y renderizado de componentes.
 * 
 * @returns JSX.Element - Dashboard completo con todos los componentes
 */
const HomeDashboard: React.FC = () => {
  // Usar el hook personalizado para el estado del dashboard
  const {
    data,
    loading,
    error,
    isStoreOpen,
    searchQuery,
    isSearching,
    searchResults,
    currentSlideIndex,
    setSearchQuery,
    setCurrentSlideIndex,
    handleSearch,
    handleToggleStore,
    refreshData
  } = useDashboard();

  // Mostrar error state si hay un error
  if (error) {
    return (
      <DashboardErrorState 
        error={error} 
        onRetry={refreshData}
      />
    );
  }

  // Mostrar skeleton loader mientras carga
  if (loading || !data) {
    return <DashboardSkeletonLoader />;
  }

  // Datos con fallbacks seguros
  const {
    currentAmount,
    goalAmount,
    percentage,
    quickAccessItems,
    recentSales
  } = data;

  return (
    <div className="px-4 pt-2 pb-4 min-h-screen bg-background">
      {/* ===== GREETING & STATUS ===== */}
      <GreetingSection 
        isStoreOpen={isStoreOpen} 
        onToggleStore={handleToggleStore} 
      />

      {/* ===== MAIN ACTIONS ===== */}
      <MainActionCards />

      {/* ===== SEARCH BAR ===== */}
      <section className="mb-6">
        <SearchInput 
          placeholder="Suche Produkte / Verkäufe"
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          className="w-full"
          esHome={true}
        />
      </section>

      {/* ===== TODAY'S STATS ===== */}
      <TodayStatsCard />

      {/* ===== DAILY GOAL ===== */}
      <DailyGoalCard 
        currentAmount={currentAmount}
        goalAmount={goalAmount}
        percentage={percentage}
      />

      {/* ===== QUICK ACCESS SLIDER ===== */}
      <QuickAccessSlider 
        items={quickAccessItems}
        currentSlide={currentSlideIndex}
        onSlideChange={setCurrentSlideIndex}
      />

      {/* ===== RECENT SALES ===== */}
      <RecentSalesSection sales={recentSales} />

      {/* ===== SEARCH RESULTS ===== */}
      {(isSearching || searchResults.length > 0) && (
        <SearchResultsSection 
          isSearching={isSearching}
          results={searchResults}
        />
      )}

      {/* Footer space for mobile navigation */}
      <div className="h-20" aria-hidden="true" />
    </div>
  );
};

export default HomeDashboard; 