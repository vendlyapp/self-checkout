"use client";

import React, { useEffect, useMemo } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import { useSuperAdminStore } from "@/lib/stores/superAdminStore";
import { SuperAdminMetrics } from "@/components/admin/dashboard/SuperAdminMetrics";
import SuperAdminSalesChart from "@/components/admin/dashboard/SuperAdminSalesChart";
import SuperAdminStatisticsChart from "@/components/admin/dashboard/SuperAdminStatisticsChart";
import SuperAdminRecentOrders from "@/components/admin/dashboard/SuperAdminRecentOrders";
import SuperAdminTarget from "@/components/admin/dashboard/SuperAdminTarget";
import SuperAdminQuickActions from "@/components/admin/dashboard/SuperAdminQuickActions";
import SuperAdminPlatformOverview from "@/components/admin/dashboard/SuperAdminPlatformOverview";
import {
  AdminDataState,
  AdminPageHeader,
} from "@/components/admin/common";
import { cn } from "@/lib/utils";
import { getPlatformDescription } from "@/lib/config/brand";

const SuperAdminDashboard: React.FC = () => {
  const {
    stats,
    statsLoading,
    statsError,
    fetchStats,
    refreshAll,
    statsLastFetch,
  } = useSuperAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    refreshAll();
  };

  const lastUpdatedAt = useMemo(() => {
    if (!statsLastFetch) {
      return null;
    }

    return new Date(statsLastFetch).toLocaleString("de-CH", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [statsLastFetch]);

  const currentRevenue = Number(stats?.orders?.revenue ?? 0);
  const targetRevenue = 50000;
  const targetPercentage = useMemo(() => {
    if (!targetRevenue) {
      return 0;
    }

    return Math.min((currentRevenue / targetRevenue) * 100, 100);
  }, [currentRevenue, targetRevenue]);
  const growth = 23.1;

  if (statsLoading && !stats) {
    return (
      <AdminDataState
        type="loading"
        title="Statistiken werden geladen"
        description="Wir bereiten die Dashboard-Daten für Sie vor."
        className="min-h-[60vh]"
      />
    );
  }

  if (statsError) {
    return (
      <AdminDataState
        type="error"
        title="Statistiken konnten nicht geladen werden"
        description={statsError}
        actionLabel="Erneut versuchen"
        onAction={() => fetchStats(true)}
        className="min-h-[60vh]"
      />
    );
  }

  if (!stats) {
    return (
      <AdminDataState
        type="empty"
        title="Keine Daten verfügbar"
        description="Es gibt noch keine Statistiken zum Anzeigen. Bitte versuchen Sie es erneut zu aktualisieren."
        actionLabel="Aktualisieren"
        onAction={() => fetchStats(true)}
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description={getPlatformDescription()}
        meta={
          lastUpdatedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 dark:bg-gray-900/70 dark:text-gray-300">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Aktualisiert {lastUpdatedAt}</span>
            </span>
          ) : null
        }
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={statsLoading}
            tabIndex={0}
            aria-label="Dashboard-Daten aktualisieren"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleRefresh();
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:text-white dark:focus-visible:ring-offset-gray-950"
            title="Daten aktualisieren"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                statsLoading ? "animate-spin" : undefined,
              )}
            />
            <span>Aktualisieren</span>
          </button>
        }
      />

      <SuperAdminMetrics stats={stats} />

      <div className="grid grid-cols-12 gap-4 md:gap-6 xl:items-stretch">
        <div className="col-span-12 xl:col-span-7">
          <SuperAdminSalesChart />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <SuperAdminTarget
            targetPercentage={targetPercentage}
            currentRevenue={currentRevenue}
            targetRevenue={targetRevenue}
            growth={growth}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 xl:items-stretch">
        <div className="col-span-12 xl:col-span-8">
          <SuperAdminStatisticsChart />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <SuperAdminPlatformOverview stats={stats} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 xl:items-stretch">
        <div className="col-span-12 xl:col-span-5">
          <SuperAdminQuickActions />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <SuperAdminRecentOrders />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
