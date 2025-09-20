"use client";

import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { DashboardContainer, DashboardGrid, DashboardSection } from "@/components/dashboard/containers";

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

// Import new widgets
import SystemStatusWidget from "./SystemStatusWidget";
import QuickMetricsWidget from "./QuickMetricsWidget";

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
    <div className="w-full min-h-screen">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-6">
          {/* ===== GREETING & STATUS ===== */}
          <GreetingSection
            onToggleStore={handleToggleStore}
          />

          {/* ===== MAIN ACTIONS ===== */}
          <MainActionCards />

          {/* ===== SEARCH BAR ===== */}
          <div>
            <SearchInput
              placeholder="Suche Produkte / Verkäufe"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full"
              esHome={true}
            />
          </div>

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
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-8">
          {/* ===== HEADER SECTION ===== */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Willkommen zurück, Peter! Hier ist dein Überblick für heute.</p>
            </div>
            <div className="w-full lg:w-[500px]">
              <SearchInput
                placeholder="Produkte / Verkäufe suchen"
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="w-full"
                esHome={true}
                showFilters={true}
                onFilterClick={() => {
                  // TODO: Implementar modal de filtros
                  console.log('Abrir filtros');
                }}
                recentSearches={[
                  'Produkte',
                  'Verkäufe heute',
                  'Kunden',
                  'Rabatte'
                ]}
                onRecentSearchClick={(search) => {
                  setSearchQuery(search);
                  handleSearch(search);
                }}
              />
            </div>
          </div>

          {/* ===== GREETING SECTION ===== */}
          <DashboardContainer variant="card">
            <GreetingSection
              onToggleStore={handleToggleStore}
            />
          </DashboardContainer>

          {/* ===== QUICK ACTIONS BAR ===== */}
          <DashboardContainer variant="card">
            <DashboardSection title="Hauptaktionen" variant="compact">
              <MainActionCards />
            </DashboardSection>
          </DashboardContainer>

          {/* ===== SYSTEM STATUS ===== */}
          <SystemStatusWidget />

          {/* ===== STATS ROW: TODAY'S STATS ===== */}
          <DashboardContainer variant="card">
            <TodayStatsCard />
          </DashboardContainer>

          {/* ===== MAIN CONTENT ROW: GOALS & METRICS ===== */}
          <DashboardGrid cols={{ desktop: 2 }} gap="lg">
            {/* Daily Goal - Takes 1 column */}
            <DashboardContainer variant="card">
              <DailyGoalCard
                currentAmount={currentAmount}
                goalAmount={goalAmount}
                percentage={percentage}
              />
            </DashboardContainer>

            {/* Quick Metrics - Takes 1 column */}
            <QuickMetricsWidget />
          </DashboardGrid>

          {/* ===== BOTTOM ROW: TOOLS & ACTIVITY ===== */}
          <DashboardGrid cols={{ desktop: 2 }} gap="lg">
            {/* Tools & Shortcuts */}
            <DashboardContainer variant="card">
              <DashboardSection title="Tools & Shortcuts" variant="compact">
                <Slider />
              </DashboardSection>
            </DashboardContainer>

            {/* Recent Sales */}
            <DashboardContainer variant="card">
              <RecentSalesSection sales={recentSales} />
            </DashboardContainer>
          </DashboardGrid>

          {/* ===== SEARCH RESULTS - Full Width ===== */}
          {(isSearching || searchResults.length > 0) && (
            <DashboardContainer variant="card">
              <SearchResultsSection
                isSearching={isSearching}
                results={searchResults}
              />
            </DashboardContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
