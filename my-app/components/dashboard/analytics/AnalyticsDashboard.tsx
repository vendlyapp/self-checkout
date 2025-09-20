import React, { useState, useCallback, useEffect } from "react";

import { useAnalytics, useQuickAccess } from "./hooks/useAnalytics";
import ActiveCustomers from "./ActiveCustomers";
import SalesChart from "./SalesChart";
import QuickAccessGrid from "./QuickAccessGrid";
import PaymentMethods from "./PaymentMethods";
import CartGauge from "./CartGauge";
import { SearchInput } from "@/components/ui/search-input";
import SearchResultsSection from "../home/SearchResultsSection";
import { AnalyticsDashboardSkeletonLoader } from "../skeletons";

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
    setSalesPeriod,
    setPaymentPeriod,
    setCartPeriod,
    refreshData,
    totalSales,
    salesGrowth,
  } = useAnalytics();

  const {
    handleSalesAction,
    handleCancelAction,
    handleReceiptsAction,
    handleCartAction,
  } = useQuickAccess();

  // Simular búsqueda de analytics
  const searchAnalyticsData = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return [
        {
          id: 1,
          name: `Analytics resultado para "${query}" 1`,
          type: "metric",
        },
        {
          id: 2,
          name: `Analytics resultado para "${query}" 2`,
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
        console.error("Error searching analytics:", err);
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
            onClick={refreshData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-fast"
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
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-6">
          {/* Search Section */}
          <div>
            <SearchInput
              placeholder="Suche Produkte / Verkäufe"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full"
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
                data={
                  data?.shopActivity || {
                    activeCustomers: [],
                    totalActive: 0,
                    totalInactive: 0,
                    openCartsValue: 0,
                    progressPercentage: 0,
                  }
                }
                loading={loading}
              />
            </section>

            {/* Sales Chart Section */}
            <section>
              <SalesChart
                data={data?.salesData || []}
                totalSales={totalSales}
                salesGrowth={salesGrowth}
                period={salesPeriod}
                onPeriodChange={setSalesPeriod}
                loading={loading}
              />
            </section>

            {/* Quick Access Section */}
            <section>
              <QuickAccessGrid
                onSalesAction={handleSalesAction}
                onCancelAction={handleCancelAction}
                onReceiptsAction={handleReceiptsAction}
                onCartAction={handleCartAction}
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
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:block">
        <div className="p-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics & Verkäufe</h1>
              <p className="text-gray-600 mt-1">Überwachen Sie Ihre Verkaufsleistung und Kundenaktivität</p>
            </div>
            <div className="w-full lg:w-[500px]">
              <SearchInput
                placeholder="Analytics durchsuchen..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="w-full"
                esHome={false}
              />
            </div>
          </div>

          {/* Search Results */}
          {(isSearching || searchResults.length > 0) && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <SearchResultsSection
                isSearching={isSearching}
                results={searchResults}
              />
            </div>
          )}

          {/* Top Row: Active Customers & Sales Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shop Activity Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <ActiveCustomers
                data={
                  data?.shopActivity || {
                    activeCustomers: [],
                    totalActive: 0,
                    totalInactive: 0,
                    openCartsValue: 0,
                    progressPercentage: 0,
                  }
                }
                loading={loading}
              />
            </div>

            {/* Sales Chart Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <SalesChart
                data={data?.salesData || []}
                totalSales={totalSales}
                salesGrowth={salesGrowth}
                period={salesPeriod}
                onPeriodChange={setSalesPeriod}
                loading={loading}
              />
            </div>
          </div>

          {/* Middle Row: Quick Access & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Access Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <QuickAccessGrid
                onSalesAction={handleSalesAction}
                onCancelAction={handleCancelAction}
                onReceiptsAction={handleReceiptsAction}
                onCartAction={handleCartAction}
                loading={loading}
              />
            </div>

            {/* Payment Methods Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <PaymentMethods
                data={data?.paymentMethods || []}
                period={paymentPeriod}
                onPeriodChange={setPaymentPeriod}
                loading={loading}
              />
            </div>
          </div>

          {/* Bottom Row: Cart Gauge - Full Width */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
