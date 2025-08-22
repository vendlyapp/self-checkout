"use client";

import React from "react";
import { SearchInput } from "@/components/ui/search-input";

// Import dashboard components and hooks
import {
  GreetingSection,
  MainActionCards,
  DailyGoalCard,
  Slider,
  TodayStatsCard,
  RecentSalesSection,
  SearchResultsSection,
  useDashboard,
  DashboardSkeletonLoader,
  DashboardErrorState,
} from "@/components/dashboard";

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
    setSearchQuery,
    handleSearch,
    handleToggleStore,
    refreshData,
  } = useDashboard();

  // Mostrar error state si hay un error
  if (error) {
    return <DashboardErrorState error={error} onRetry={refreshData} />;
  }

  // Mostrar skeleton loader mientras carga
  if (loading || !data) {
    return <DashboardSkeletonLoader />;
  }

  // Datos con fallbacks seguros
  const { currentAmount, goalAmount, percentage, recentSales } = data;

  return (
    <div className="p-4">
      {/* ===== GREETING & STATUS ===== */}
      <GreetingSection
        isStoreOpen={isStoreOpen}
        onToggleStore={handleToggleStore}
      />

      {/* ===== MAIN ACTIONS ===== */}
      <MainActionCards />

      {/* ===== SEARCH BAR ===== */}
      <section className="">
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

      {/* ===== SLIDER ===== */}
      <Slider />

      {/* ===== RECENT SALES ===== */}
      <RecentSalesSection sales={recentSales} />

      {/* ===== SEARCH RESULTS ===== */}
      {(isSearching || searchResults.length > 0) && (
        <SearchResultsSection
          isSearching={isSearching}
          results={searchResults}
        />
      )}
    </div>
  );
};

export default HomeDashboard;
