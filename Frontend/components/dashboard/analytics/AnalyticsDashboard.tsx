import React, { useState, useCallback, useEffect, useMemo } from "react";

import { useAnalytics, useQuickAccess } from "@/hooks";
import { useActiveStats } from "@/hooks/queries/useActiveStats";
import ActiveCustomers from "./ActiveCustomers";
import SalesChart from "./SalesChart";
import QuickAccessGrid from "./QuickAccessGrid";
import PaymentMethods from "./PaymentMethods";
import CartGauge from "./CartGauge";
import GoalsCard from "./GoalsCard";
import { SearchInput } from "@/components/ui/search-input";
import { devError } from "@/lib/utils/logger";
import SearchResultsSection from "../home/SearchResultsSection";
import { AnalyticsDashboardSkeletonLoader } from "../skeletons";
import type { Customer } from "./types";

interface SearchResult {
  id: number;
  name: string;
  type: "metric" | "report" | "product" | "sale";
}

const AnalyticsDashboard: React.FC = () => {
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const {
    data,
    loading,
    error,
    salesPeriod,
    paymentPeriod,
    cartPeriod,
    salesPeriodLabels,
    setSalesPeriod,
    setPaymentPeriod,
    setCartPeriod,
    refreshData,
    totalSales,
    salesGrowth,
  } = useAnalytics();

  const {
    handleViewSales,
    handleCancelSale,
    handleViewReceipts,
    handleGoToCart,
  } = useQuickAccess();

  const {
    data: activeStats,
    isSuccess: activeTelemetryOk,
    isLoading: activeTelemetryLoading,
  } = useActiveStats();

  /** „Jetzt im Shop“: bei erfolgreicher Telemetrie nur Live-Zähler + Platzhalter-Avatare; sonst Fallback aus Bestellungen (24h). */
  const shopActivityData = useMemo(() => {
    if (!data) {
      return {
        activeCustomers: [] as Customer[],
        totalActive: 0,
        totalInactive: 0,
        openCartsValue: 0,
        progressPercentage: 0,
        lastSeenAt: null as string | null,
      };
    }

    const base = data.shopActivity;

    if (!activeTelemetryOk || !activeStats) {
      return { ...base, lastSeenAt: null };
    }

    const n = Math.max(0, Math.floor(Number(activeStats.activeCustomers) || 0));
    const placeholders: Customer[] = Array.from(
      { length: Math.min(2, n) },
      (_, i) => ({
        id: `live-${i}`,
        avatar: "👤",
        name: "Kunde im Shop",
        status: "active" as const,
      })
    );

    const progressPercentage =
      n === 0 ? 0 : Math.min(100, 25 + (n - 1) * 22);

    return {
      activeCustomers: placeholders,
      totalActive: n,
      totalInactive: Math.max(0, n - 2),
      openCartsValue: Number(activeStats.openCartsValue) || 0,
      progressPercentage,
      lastSeenAt: activeStats.lastSeen ?? null,
    };
  }, [data, activeTelemetryOk, activeStats]);

  // Simular búsqueda de analytics
  const searchAnalyticsData = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          name: `Analytics-Ergebnis für «${query}» 1`,
          type: "metric",
        },
        {
          id: 2,
          name: `Analytics-Ergebnis für «${query}» 2`,
          type: "report",
        },
      ];
    },
    []
  );

  // Manejar búsqueda
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);

      try {
        const results = await searchAnalyticsData(query);
        setSearchResults(results);
      } catch (err) {
        devError("Error searching analytics:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [searchAnalyticsData]
  );

  // Limpiar resultados de búsqueda cuando cambia el query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-destructive text-lg font-semibold mb-2">
            Fehler beim Laden der Analytics
          </div>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            type="button"
            onClick={refreshData}
            className="cursor-pointer px-4 py-3 min-h-[44px] bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-fast font-medium"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // Loading state - mostrar skeleton mientras carga
  if (loading || !data) {
    return <AnalyticsDashboardSkeletonLoader />;
  }

  return (
    <div className="w-full">
      {/* ===== SOLO MÓVIL (< 768px) ===== */}
      <div className="block md:hidden">
        <div className="p-4 space-y-6">
          {/* Search Section - tamaño fijo y organizado */}
          <div className="w-full max-w-full">
            <SearchInput
              placeholder="Suche Produkte / Verkäufe"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full h-[54px] min-h-[54px]"
              esHome={false}
            />
          </div>

          {/* Search Results */}
          {(isSearching || searchResults.length > 0) && (
            <section className="mb-6">
              <SearchResultsSection
                isSearching={isSearching}
                results={searchResults}
              />
            </section>
          )}

          {/* Analytics Components */}
          <div className="space-y-6">
            {/* Shop Activity Section */}
            <section>
              <ActiveCustomers
                data={shopActivityData}
                loading={loading || activeTelemetryLoading}
              />
            </section>

            {/* Sales Chart Section */}
            <section>
              <SalesChart
                data={data?.salesData || []}
                totalSales={totalSales}
                salesGrowth={salesGrowth}
                period={salesPeriod}
                periodLabels={salesPeriodLabels}
                onPeriodChange={setSalesPeriod}
                loading={loading}
              />
            </section>

            {/* Quick Access Section */}
            <section>
              <QuickAccessGrid
                onSalesAction={handleViewSales}
                onCancelAction={handleCancelSale}
                onReceiptsAction={handleViewReceipts}
                onCartAction={handleGoToCart}
                loading={loading}
              />
            </section>

            {/* Payment Methods Section */}
            <section>
              <PaymentMethods
                data={data?.paymentMethods || []}
                period={paymentPeriod}
                onPeriodChange={setPaymentPeriod}
                loading={loading}
              />
            </section>

            {/* Cart Gauge Section */}
            <section>
              <CartGauge
                data={
                  data?.cartData || {
                    averageValue: 0,
                    percentageChange: 0,
                    trend: "up",
                    comparisonPeriod: "gestern",
                    maxValue: 100,
                    minValue: 0,
                  }
                }
                period={cartPeriod}
                onPeriodChange={setCartPeriod}
                loading={loading}
              />
            </section>

            {/* Ziele Section */}
            <section>
              <GoalsCard />
            </section>
          </div>
        </div>
      </div>

      {/* ===== TABLET + DESKTOP (≥ 768px) ===== */}
      <div className="hidden md:block min-w-0">
        <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-6 xl:p-8 space-y-5 md:space-y-6 lg:space-y-8 xl:space-y-10 max-w-[1600px]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 lg:gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">Analytics & Verkäufe</h1>
              <p className="text-muted-foreground mt-0.5 text-xs md:text-xs lg:text-sm">Überwachen Sie Ihre Verkaufsleistung und Kundenaktivität</p>
            </div>
            <div className="w-full md:w-[200px] lg:w-[280px] xl:w-[320px] flex-shrink-0 md:flex md:items-center">
              <SearchInput
                placeholder="Suchen..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="w-full h-[54px] min-h-[54px]"
                esHome={false}
              />
            </div>
          </div>

          {/* Search Results */}
          {(isSearching || searchResults.length > 0) && (
            <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-sm border border-border">
              <SearchResultsSection
                isSearching={isSearching}
                results={searchResults}
              />
            </div>
          )}

          {/* Top Row: Active Customers & Sales Chart — 1 col hasta xl, 2 cols desde 1280px */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 lg:gap-6 min-w-0">
            <ActiveCustomers
              data={shopActivityData}
              loading={loading || activeTelemetryLoading}
            />
            <SalesChart
              data={data?.salesData || []}
              totalSales={totalSales}
              salesGrowth={salesGrowth}
              period={salesPeriod}
              periodLabels={salesPeriodLabels}
              onPeriodChange={setSalesPeriod}
              loading={loading}
            />
          </div>

          {/* Middle Row: Quick Access & Payment Methods — 1 col hasta xl, 2 cols desde 1280px */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 lg:gap-6 min-w-0">
            <div className="bg-card rounded-2xl p-4 lg:p-6 shadow-sm border border-border">
              <QuickAccessGrid
                onSalesAction={handleViewSales}
                onCancelAction={handleCancelSale}
                onReceiptsAction={handleViewReceipts}
                onCartAction={handleGoToCart}
                loading={loading}
              />
            </div>
            <PaymentMethods
              data={data?.paymentMethods || []}
              period={paymentPeriod}
              onPeriodChange={setPaymentPeriod}
              loading={loading}
            />
          </div>

          {/* Bottom Row: Cart Gauge - full width, su propia card */}
          <CartGauge
            data={
              data?.cartData || {
                averageValue: 0,
                percentageChange: 0,
                trend: "up",
                comparisonPeriod: "gestern",
                maxValue: 100,
                minValue: 0,
              }
            }
            period={cartPeriod}
            onPeriodChange={setCartPeriod}
            loading={loading}
          />

          {/* Ziele Card - below Cart Gauge */}
          <GoalsCard />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
