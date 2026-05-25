"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SearchInput } from "@/components/ui/search-input";
import { DashboardContainer, DashboardSection } from "@/components/dashboard/containers";
import {
  GreetingSection,
  MainActionCards,
  Slider,
  SearchResultsSection,
} from "@/components/dashboard";
import { useMyStore } from "@/hooks/queries/useMyStore";
import { useRecentOrders } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { devError } from "@/lib/utils/logger";
import type { SearchResult } from "@/types";

// Lazy-load — chart-heavy and below-fold components stay out of initial bundle
const TodayStatsCard    = dynamic(() => import("./TodayStatsCard"),    { ssr: false });
const DailyGoalCard     = dynamic(() => import("./DailyGoalCard"),     { ssr: false });
const RecentSalesSection = dynamic(() => import("@/components/dashboard/sale/RecentSalesSection"), { ssr: false });
const SystemStatusWidget = dynamic(() => import("./SystemStatusWidget"), { ssr: false });
const QuickMetricsWidget = dynamic(() => import("./QuickMetricsWidget"), { ssr: false });

const HomeDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: store } = useMyStore();
  const { data: recentOrders } = useRecentOrders(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleToggleStore = useCallback(() => {}, []);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setSearchResults([
        { id: 1, name: `Verkäufe für "${query}"`, type: "metric" },
        { id: 2, name: `Produkte mit "${query}"`, type: "product" },
      ]);
    } catch (err) {
      devError("Suche fehlgeschlagen:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["orderStats"] }),
      queryClient.invalidateQueries({ queryKey: ["recentOrders"] }),
      queryClient.invalidateQueries({ queryKey: ["myStore"] }),
      queryClient.invalidateQueries({ queryKey: ["topProducts"] }),
    ]);
  }, [queryClient]);

  // recentSales procesado aquí para no bloquear el render
  const recentSales = recentOrders?.map((order) => {
    let meta = order.metadata as { customer?: { name?: string }; customerData?: { name?: string } } | string | undefined;
    if (typeof meta === "string") { try { meta = JSON.parse(meta) as typeof meta; } catch { meta = undefined; } }
    const customerName = (meta && typeof meta === "object" && (meta.customer?.name?.trim() || meta.customerData?.name?.trim())) || null;
    const userName = order.userName ?? (order as { username?: string }).username;
    const displayName = customerName || userName?.trim() || "Kunde";
    const amount = typeof order.total === "number" ? order.total : parseFloat(String(order.total)) || 0;
    return {
      id: order.id,
      name: displayName,
      receipt: `Beleg #${String(order.id).slice(-4).toUpperCase()}`,
      time: order.createdAt,
      amount,
      paymentMethod: order.paymentMethod || "Karte",
      status: (order.status || "completed") as "pending" | "completed" | "cancelled",
    };
  }) ?? [];

  void store; void refreshData; // used via child hooks

  return (
    <div className="w-full min-h-dvh">
      {/* ===== MÓVIL (< 768px) ===== */}
      <div className="block md:hidden">
        <div className="p-4 space-y-6">
          <GreetingSection onToggleStore={handleToggleStore} />
          <MainActionCards />
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
          <TodayStatsCard />
          <DailyGoalCard />
          <Slider />
          <RecentSalesSection sales={recentSales} />
          {(isSearching || searchResults.length > 0) && (
            <SearchResultsSection isSearching={isSearching} results={searchResults} />
          )}
        </div>
      </div>

      {/* ===== TABLET + DESKTOP (≥ 768px) ===== */}
      <div className="hidden md:block">
        <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-8 space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-5 lg:gap-6">
            <div className="min-w-0">
              <h1 className="text-xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm md:text-sm lg:text-base">Willkommen zurück! Hier ist dein Überblick für heute.</p>
            </div>
            <div className="w-full md:w-[240px] lg:w-[320px] xl:w-[380px] flex-shrink-0">
              <SearchInput
                placeholder="Suchen..."
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="w-full h-[54px]"
                esHome={true}
                showFilters={true}
                onFilterClick={() => {}}
                recentSearches={["Produkte", "Verkäufe heute", "Kunden", "Rabatte"]}
                onRecentSearchClick={(search) => { setSearchQuery(search); handleSearch(search); }}
              />
            </div>
          </div>

          <DashboardContainer variant="card">
            <GreetingSection onToggleStore={handleToggleStore} />
          </DashboardContainer>

          <DashboardContainer variant="card">
            <DashboardSection title="Hauptaktionen" variant="compact">
              <MainActionCards />
            </DashboardSection>
          </DashboardContainer>

          <SystemStatusWidget />

          <DashboardContainer variant="card">
            <TodayStatsCard />
          </DashboardContainer>

          <DailyGoalCard />

          <QuickMetricsWidget />

          <DashboardContainer variant="card">
            <DashboardSection title="Tools & Shortcuts" variant="compact">
              <Slider />
            </DashboardSection>
          </DashboardContainer>

          <DashboardContainer variant="card">
            <RecentSalesSection sales={recentSales} />
          </DashboardContainer>

          {(isSearching || searchResults.length > 0) && (
            <DashboardContainer variant="card">
              <SearchResultsSection isSearching={isSearching} results={searchResults} />
            </DashboardContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
