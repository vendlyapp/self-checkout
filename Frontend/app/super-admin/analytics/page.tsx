'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Store, DollarSign, TrendingDown, TrendingUp, ShoppingCart } from 'lucide-react';
import { useSuperAdminStore } from '@/lib/stores/superAdminStore';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export default function SuperAdminAnalytics() {
  const { 
    stats,
    stores,
    products,
    statsLoading,
    storesLoading,
    usersLoading,
    productsLoading,
    statsError,
    refreshAll,
    fetchStats,
    fetchStores,
    fetchUsers,
    fetchProducts
  } = useSuperAdminStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchStats();
    fetchStores();
    fetchUsers();
    fetchProducts();
  }, [fetchStats, fetchStores, fetchUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = (statsLoading || storesLoading || usersLoading || productsLoading) && (!stats || stores.length === 0);

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    if (!stats || stores.length === 0) return null;

    // Sales by store
    const salesByStore = stores.map(store => ({
      name: store.name,
      revenue: Number(store.totalRevenue || 0),
      orders: Number(store.orderCount || 0),
      products: Number(store.productCount || 0)
    })).sort((a, b) => b.revenue - a.revenue);

    // Revenue distribution
    const totalRevenue = salesByStore.reduce((sum, s) => sum + s.revenue, 0);
    const revenueDistribution = salesByStore.map(store => ({
      name: store.name,
      value: store.revenue,
      percentage: totalRevenue > 0 ? (store.revenue / totalRevenue) * 100 : 0
    }));

    // User growth (last 12 months simulation)
    const userGrowthData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month.toLocaleDateString('es-ES', { month: 'short' }),
        users: Math.floor(stats.users.total * (0.7 + (i / 12) * 0.3))
      };
    });

    // Products by category
    const productsByCategory = products.reduce((acc: Record<string, number>, product) => {
      const category = product.category || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(productsByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Monthly sales trend (simulated)
    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - i));
      return {
        month: month.toLocaleDateString('es-ES', { month: 'short' }),
        sales: Math.floor(Number(stats.orders.revenue || 0) / 12 * (0.8 + Math.random() * 0.4))
      };
    });

    // Store performance metrics
    const storePerformance = stores.map(store => ({
      name: store.name,
      revenue: Number(store.totalRevenue || 0),
      orders: Number(store.orderCount || 0),
      avgOrderValue: Number(store.orderCount || 0) > 0 
        ? Number(store.totalRevenue || 0) / Number(store.orderCount || 0) 
        : 0,
      products: Number(store.productCount || 0),
      isActive: store.isActive
    })).sort((a, b) => b.revenue - a.revenue);

    return {
      salesByStore,
      revenueDistribution,
      userGrowthData,
      topCategories,
      monthlySales,
      storePerformance,
      totalRevenue
    };
  }, [stats, stores, products]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (statsError || !stats || !analyticsData) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl dark:bg-red-500/15 dark:border-red-500/50 dark:text-red-400">
          {statsError || 'Error al cargar los datos de analytics'}
        </div>
      </div>
    );
  }

  // Chart configurations
  const salesByStoreOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    colors: ['#25d076'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 8,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: analyticsData.salesByStore.slice(0, 10).map(s => s.name),
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      title: { text: 'CHF' },
      labels: { formatter: (val) => `CHF ${val.toLocaleString()}` }
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => `CHF ${val.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    },
    grid: { borderColor: '#e5e7eb' },
  };

  const salesByStoreSeries = [{
    name: 'Ingresos',
    data: analyticsData.salesByStore.slice(0, 10).map(s => s.revenue)
  }];

  const revenueDistributionOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'donut',
      height: 350,
    },
    colors: ['#25d076', '#22c57f', '#1fb366', '#1aa059', '#158d4d', '#107a41', '#0b6735', '#065429'],
    labels: analyticsData.revenueDistribution.slice(0, 8).map(s => s.name),
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Revenue',
              formatter: () => `CHF ${analyticsData.totalRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`
    },
    tooltip: {
      y: {
        formatter: (val) => `CHF ${val.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    },
  };

  const revenueDistributionSeries = analyticsData.revenueDistribution.slice(0, 8).map(s => s.value);

  const userGrowthOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'line',
      height: 300,
      toolbar: { show: false },
    },
    colors: ['#25d076'],
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 5, hover: { size: 7 } },
    xaxis: {
      categories: analyticsData.userGrowthData.map(d => d.month),
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      title: { text: 'Usuarios' },
      labels: { formatter: (val) => Math.floor(val).toString() }
    },
    tooltip: {
      y: { formatter: (val) => `${Math.floor(val)} usuarios` }
    },
    grid: { borderColor: '#e5e7eb' },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100]
      }
    },
  };

  const userGrowthSeries = [{
    name: 'Total Usuarios',
    data: analyticsData.userGrowthData.map(d => d.users)
  }];

  const categoriesOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    colors: ['#25d076'],
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '55%',
        borderRadius: 8,
      },
    },
    dataLabels: { enabled: true },
    xaxis: {
      categories: analyticsData.topCategories.map(c => c.name),
      labels: { style: { fontSize: '12px' } }
    },
    tooltip: {
      y: { formatter: (val) => `${val} productos` }
    },
    grid: { borderColor: '#e5e7eb' },
  };

  const categoriesSeries = [{
    name: 'Productos',
    data: analyticsData.topCategories.map(c => c.count)
  }];

  const monthlySalesOptions: ApexOptions = {
    chart: {
      fontFamily: 'Outfit, sans-serif',
      type: 'area',
      height: 350,
      toolbar: { show: false },
    },
    colors: ['#25d076', '#22c57f'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      }
    },
    xaxis: {
      categories: analyticsData.monthlySales.map(d => d.month),
      labels: { style: { fontSize: '12px' } }
    },
    yaxis: {
      title: { text: 'CHF' },
      labels: { formatter: (val) => `CHF ${val.toLocaleString()}` }
    },
    tooltip: {
      y: {
        formatter: (val) => `CHF ${val.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      }
    },
    legend: {
      position: 'top',
    },
    grid: { borderColor: '#e5e7eb' },
  };

  const monthlySalesSeries = [
    {
      name: 'Ventas',
      data: analyticsData.monthlySales.map(d => d.sales)
    },
    {
      name: 'Promedio',
      data: analyticsData.monthlySales.map(() => 
        analyticsData.monthlySales.reduce((sum, d) => sum + d.sales, 0) / analyticsData.monthlySales.length
      )
    }
  ];

  // Calculate key metrics
  const totalOrders = stores.reduce((sum, s) => sum + Number(s.orderCount || 0), 0);
  const avgOrderValue = totalOrders > 0 
    ? analyticsData.totalRevenue / totalOrders 
    : 0;
  const activeStores = stores.filter(s => s.isActive).length;
  const avgRevenuePerStore = stores.length > 0 
    ? analyticsData.totalRevenue / stores.length 
    : 0;
  const userGrowthRate = analyticsData.userGrowthData.length > 1
    ? ((analyticsData.userGrowthData[analyticsData.userGrowthData.length - 1].users - analyticsData.userGrowthData[0].users) / analyticsData.userGrowthData[0].users) * 100
    : 0;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white/90">Analytics & Insights</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Análisis completo de la plataforma Vendly</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-900 p-1">
            {(['month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {period === 'month' ? 'Mensual' : period === 'quarter' ? 'Trimestral' : 'Anual'}
              </button>
            ))}
          </div>
          <button
            onClick={() => refreshAll()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* MÉTRICAS PRINCIPALES */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                CHF {analyticsData.totalRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{totalOrders} órdenes</p>
            </div>
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                CHF {avgOrderValue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Por orden</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Crecimiento</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                {userGrowthRate >= 0 ? '+' : ''}{userGrowthRate.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Usuarios</p>
            </div>
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/15 rounded-xl flex items-center justify-center">
              {userGrowthRate >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue/Tienda</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
                CHF {avgRevenuePerStore.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeStores} activas</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/15 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ROW 1: Ventas Mensuales + Distribución por Tienda */}
      {/* ============================================ */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-8 flex">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Tendencias de Ventas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ventas mensuales vs promedio</p>
            </div>
            <div className="h-[350px]">
              <ReactApexChart
                options={monthlySalesOptions}
                series={monthlySalesSeries}
                type="area"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Distribución de Ingresos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Por tienda</p>
            </div>
            <div className="h-[350px]">
              <ReactApexChart
                options={revenueDistributionOptions}
                series={revenueDistributionSeries}
                type="donut"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ROW 2: Ventas por Tienda + Crecimiento de Usuarios */}
      {/* ============================================ */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">
        <div className="col-span-12 lg:col-span-7 flex">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Top Tiendas por Ingresos</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Top 10 tiendas con mayor revenue</p>
            </div>
            <div className="h-[350px]">
              <ReactApexChart
                options={salesByStoreOptions}
                series={salesByStoreSeries}
                type="bar"
                height={350}
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 flex">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Crecimiento de Usuarios</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Últimos 12 meses</p>
            </div>
            <div className="h-[350px]">
              <ReactApexChart
                options={userGrowthOptions}
                series={userGrowthSeries}
                type="line"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ROW 3: Productos por Categoría */}
      {/* ============================================ */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 flex">
          <div className="w-full rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Productos por Categoría</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Distribución de productos en la plataforma</p>
            </div>
            <div className="h-[350px]">
              <ReactApexChart
                options={categoriesOptions}
                series={categoriesSeries}
                type="bar"
                height={350}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* TABLA DE RENDIMIENTO DE TIENDAS */}
      {/* ============================================ */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Rendimiento de Tiendas</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comparativa de métricas por tienda</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Tienda</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Órdenes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Ticket Promedio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {analyticsData.storePerformance.slice(0, 10).map((store, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 dark:bg-brand-500/20 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white/90 text-sm">{store.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white/90">
                      CHF {store.revenue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">{store.orders}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-brand-600 dark:text-brand-400">
                      CHF {store.avgOrderValue.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 dark:text-gray-300">{store.products}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      store.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500'
                    }`}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}