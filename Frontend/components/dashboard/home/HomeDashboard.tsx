"use client";

import React from "react";
import { SearchInput } from "@/components/ui/search-input";
import { DashboardContainer, DashboardSection } from "@/components/dashboard/containers";

// Import dashboard components and hooks
import {
  GreetingSection,
  MainActionCards,
  DailyGoalCard,
  Slider,
  TodayStatsCard,
  RecentSalesSection,
  SearchResultsSection,
  DashboardSkeletonLoader,
  DashboardErrorState,
} from "@/components/dashboard";
import { useDashboard } from "@/hooks";

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
      {/* ===== SOLO MÓVIL (< 768px) ===== */}
      <div className="block md:hidden">
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
              className="w-full h-[54px]"
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

      {/* ===== TABLET + DESKTOP (≥ 768px) ===== */}
      <div className="hidden md:block">
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-10 lg:space-y-12">
          {/* ===== HEADER SECTION ===== */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Willkommen zurück! Hier ist dein Überblick für heute.</p>
            </div>
            <div className="w-full md:max-w-sm lg:w-[380px]">
              <SearchInput
                placeholder="Suchen..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="w-full"
                esHome={true}
                showFilters={true}
                onFilterClick={() => {}}
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
            <GreetingSection onToggleStore={handleToggleStore} />
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

          {/* ===== TAGESZIEL: una columna, card con más aire interno ===== */}
          <DailyGoalCard
            currentAmount={currentAmount}
            goalAmount={goalAmount}
            percentage={percentage}
          />

          {/* ===== QUICK METRICS: una columna (widget con su propia card) ===== */}
          <QuickMetricsWidget />

          {/* ===== TOOLS & SHORTCUTS: una columna ===== */}
          <DashboardContainer variant="card">
            <DashboardSection title="Tools & Shortcuts" variant="compact">
              <Slider />
            </DashboardSection>
          </DashboardContainer>

          {/* ===== RECENT SALES: una columna ===== */}
          <DashboardContainer variant="card">
            <RecentSalesSection sales={recentSales} />
          </DashboardContainer>

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
