'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';
import { SuperAdminMetrics } from '@/components/admin/dashboard/SuperAdminMetrics';
import SuperAdminSalesChart from '@/components/admin/dashboard/SuperAdminSalesChart';
import SuperAdminStatisticsChart from '@/components/admin/dashboard/SuperAdminStatisticsChart';
import SuperAdminRecentOrders from '@/components/admin/dashboard/SuperAdminRecentOrders';
import SuperAdminTarget from '@/components/admin/dashboard/SuperAdminTarget';
import SuperAdminQuickActions from '@/components/admin/dashboard/SuperAdminQuickActions';
import SuperAdminPlatformOverview from '@/components/admin/dashboard/SuperAdminPlatformOverview';

export default function SuperAdminDashboard() {
  const { 
    stats, 
    statsLoading, 
    statsError, 
    fetchStats, 
    refreshAll 
  } = useSuperAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    refreshAll();
  };

  // Solo mostrar loader si está cargando Y no hay datos
  if (statsLoading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
          {statsError}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calcular datos para el target
  const currentRevenue = Number(stats.orders.revenue || 0);
  const targetRevenue = 50000; // Meta mensual
  const targetPercentage = Math.min((currentRevenue / targetRevenue) * 100, 100);
  const growth = 23.1; // Porcentaje de crecimiento (puede venir de la API)

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================ */}
      {/* ACTIONS BAR - Minimalist */}
      {/* ============================================ */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={statsLoading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ============================================ */}
      {/* MÉTRICAS PRINCIPALES - 4 en una fila */}
      {/* ============================================ */}
      <div>
        <SuperAdminMetrics stats={stats} />
      </div>

      {/* ============================================ */}
      {/* ROW 1: Gráfico de Ventas + Objetivo Mensual */}
      {/* ============================================ */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-7 flex">
          <div className="w-full">
            <SuperAdminSalesChart />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 flex">
          <div className="w-full h-full">
            <SuperAdminTarget
              targetPercentage={targetPercentage}
              currentRevenue={currentRevenue}
              targetRevenue={targetRevenue}
              growth={growth}
            />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ROW 2: Estadísticas + Resumen de Plataforma */}
      {/* ============================================ */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-8 flex">
          <div className="w-full">
            <SuperAdminStatisticsChart />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 flex">
          <div className="w-full h-full">
            <SuperAdminPlatformOverview stats={stats} />
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ROW 3: Acciones Rápidas + Órdenes Recientes */}
      {/* ============================================ */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 xl:col-span-5 flex">
          <div className="w-full h-full">
            <SuperAdminQuickActions />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-7 flex">
          <div className="w-full h-full">
            <SuperAdminRecentOrders />
          </div>
        </div>
      </div>
    </div>
  );
}
