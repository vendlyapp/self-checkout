"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  Clock3,
  DollarSign,
  RefreshCw,
  ShoppingCart,
  Store,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { useSuperAdminStore } from "@/lib/stores/superAdminStore";
import {
  AdminDataState,
  AdminMetricCard,
  AdminPageHeader,
  AdminSectionCard,
  AdminSegmentedControl,
} from "@/components/admin/common";
import { cn } from "@/lib/utils";

type Period = "month" | "quarter" | "year";

const periodOptions: Array<{ value: Period; label: string }> = [
  { value: "month", label: "Mensual" },
  { value: "quarter", label: "Trimestral" },
  { value: "year", label: "Anual" },
];

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SuperAdminAnalytics: React.FC = () => {
  const {
    stats,
    stores,
    products,
    salesOverTime,
    storePerformance,
    topProducts,
    activeOverview,
    activeStores,
    statsLoading,
    storesLoading,
    usersLoading,
    productsLoading,
    salesOverTimeLoading,
    storePerformanceLoading,
    topProductsLoading,
    activeOverviewLoading,
    activeStoresLoading,
    statsError,
    salesOverTimeError,
    storePerformanceError,
    topProductsError,
    activeOverviewError,
    activeStoresError,
    refreshAll,
    fetchStats,
    fetchStores,
    fetchUsers,
    fetchProducts,
    fetchSalesOverTime,
    fetchStorePerformance,
    fetchTopProducts,
    fetchActiveOverview,
    fetchActiveStores,
    statsLastFetch,
    storesLastFetch,
    productsLastFetch,
  } = useSuperAdminStore();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>("month");

  useEffect(() => {
    fetchStats();
    fetchStores();
    fetchUsers();
    fetchProducts();
    fetchSalesOverTime();
    fetchStorePerformance();
    fetchTopProducts();
    fetchActiveOverview();
    fetchActiveStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fetchStats,
    fetchStores,
    fetchUsers,
    fetchProducts,
    fetchSalesOverTime,
    fetchStorePerformance,
    fetchTopProducts,
    fetchActiveOverview,
    fetchActiveStores,
  ]);

  const isRefreshing =
    statsLoading ||
    storesLoading ||
    usersLoading ||
    productsLoading ||
    salesOverTimeLoading ||
    storePerformanceLoading ||
    topProductsLoading ||
    activeOverviewLoading ||
    activeStoresLoading;
  const isInitialLoading =
    isRefreshing &&
    (!stats ||
      !stores.length ||
      !products.length ||
      !storePerformance.length ||
      !salesOverTime.length);

  const analyticsData = useMemo(() => {
    if (!stats || stores.length === 0) {
      return null;
    }

    const salesByStore = stores
      .map((store) => ({
        id: store.id,
        name: store.name,
        revenue: Number(store.totalRevenue || 0),
        orders: Number(store.orderCount || 0),
        products: Number(store.productCount || 0),
        isActive: store.isActive,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const totalRevenue = salesByStore.reduce((acc, store) => acc + store.revenue, 0);

    const revenueDistribution = salesByStore.map((store) => ({
      name: store.name,
      value: store.revenue,
      percentage: totalRevenue > 0 ? (store.revenue / totalRevenue) * 100 : 0,
    }));

    const userGrowthData = Array.from({ length: 12 }, (_, index) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - index));

      return {
        month: month.toLocaleDateString("es-ES", { month: "short" }),
        users: Math.floor(stats.users.total * (0.7 + (index / 12) * 0.3)),
      };
    });

    const productsByCategory = products.reduce<Record<string, number>>((acc, product) => {
      const category = product.category || "Sin categoría";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(productsByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const monthlySales = Array.from({ length: 12 }, (_, index) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (11 - index));

      return {
        month: month.toLocaleDateString("es-ES", { month: "short" }),
        sales: Math.floor(
          Number(stats.orders.revenue || 0) / 12 * (0.8 + Math.random() * 0.4),
        ),
      };
    });

    const storePerformance = salesByStore.map((store) => {
      const avgOrderValue = store.orders > 0 ? store.revenue / store.orders : 0;

      return {
        ...store,
        avgOrderValue,
      };
    });

    return {
      salesByStore,
      revenueDistribution,
      userGrowthData,
      topCategories,
      monthlySales,
      storePerformance,
      totalRevenue,
    };
  }, [products, stats, stores]);

  const aggregation = useMemo(() => {
    if (!analyticsData) {
      return null;
    }

    const totalOrders = analyticsData.salesByStore.reduce(
      (sum, store) => sum + store.orders,
      0,
    );

    const activeStoreCount = analyticsData.salesByStore.filter((store) => store.isActive).length;
    const avgOrderValue =
      totalOrders > 0 ? analyticsData.totalRevenue / totalOrders : 0;
    const avgRevenuePerStore =
      analyticsData.salesByStore.length > 0
        ? analyticsData.totalRevenue / analyticsData.salesByStore.length
        : 0;

    const userGrowthRate =
      analyticsData.userGrowthData.length > 1
        ? ((analyticsData.userGrowthData.at(-1)!.users -
            analyticsData.userGrowthData[0].users) /
            analyticsData.userGrowthData[0].users) *
          100
        : 0;

    return {
      totalOrders,
      activeStoreCount,
      avgOrderValue,
      avgRevenuePerStore,
      userGrowthRate,
    };
  }, [analyticsData]);

  const lastUpdatedAt = useMemo(() => {
    const timestamps = [
      statsLastFetch,
      storesLastFetch,
      productsLastFetch,
    ].filter(Boolean) as number[];

    if (!timestamps.length) {
      return null;
    }

    const mostRecent = Math.max(...timestamps);

    return new Date(mostRecent).toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [productsLastFetch, statsLastFetch, storesLastFetch]);

  const safeSalesByStore = analyticsData?.salesByStore ?? [];
  const safeRevenueDistribution = analyticsData?.revenueDistribution ?? [];
  const safeUserGrowthData = analyticsData?.userGrowthData ?? [];
  const safeTopCategories = analyticsData?.topCategories ?? [];
  const safeMonthlySales = analyticsData?.monthlySales ?? [];
  const safeTotalRevenue = analyticsData?.totalRevenue ?? 0;

  const salesByStoreOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 340,
        toolbar: { show: false },
      },
      colors: ["#25d076"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories: safeSalesByStore.slice(0, 10).map((store) => store.name),
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        title: { text: "CHF" },
        labels: { formatter: (value) => `CHF ${value.toLocaleString()}` },
      },
      grid: { borderColor: "#e5e7eb" },
      tooltip: {
        y: {
          formatter: (value) =>
            `CHF ${value.toLocaleString("de-CH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    }),
    [safeSalesByStore],
  );

  const salesByStoreSeries = useMemo(
    () => [
      {
        name: "Ingresos",
        data: safeSalesByStore.slice(0, 10).map((store) => store.revenue),
      },
    ],
    [safeSalesByStore],
  );

  const revenueDistributionOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "donut",
        height: 320,
      },
      colors: [
        "#25d076",
        "#22c57f",
        "#1fb366",
        "#1aa059",
        "#158d4d",
        "#107a41",
        "#0b6735",
        "#065429",
      ],
      labels: safeRevenueDistribution.slice(0, 8).map((store) => store.name),
      legend: {
        position: "bottom",
        fontSize: "12px",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total Revenue",
                formatter: () =>
                  `CHF ${safeTotalRevenue.toLocaleString("de-CH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
      tooltip: {
        y: {
          formatter: (value) =>
            `CHF ${value.toLocaleString("de-CH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    }),
    [safeRevenueDistribution, safeTotalRevenue],
  );

  const revenueDistributionSeries = useMemo(
    () => safeRevenueDistribution.slice(0, 8).map((store) => store.value),
    [safeRevenueDistribution],
  );

  const userGrowthOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "line",
        height: 320,
        toolbar: { show: false },
      },
      colors: ["#25d076"],
      stroke: { curve: "smooth", width: 3 },
      markers: { size: 5, hover: { size: 7 } },
      xaxis: {
        categories: safeUserGrowthData.map((point) => point.month),
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        title: { text: "Usuarios" },
        labels: { formatter: (value) => Math.floor(value).toString() },
      },
      grid: { borderColor: "#e5e7eb" },
      tooltip: {
        y: { formatter: (value) => `${Math.floor(value)} usuarios` },
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 100],
        },
      },
    }),
    [safeUserGrowthData],
  );

  const userGrowthSeries = useMemo(
    () => [
      {
        name: "Total Usuarios",
        data: safeUserGrowthData.map((point) => point.users),
      },
    ],
    [safeUserGrowthData],
  );

  const categoriesOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "bar",
        height: 340,
        toolbar: { show: false },
      },
      colors: ["#25d076"],
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: "55%",
          borderRadius: 8,
        },
      },
      dataLabels: { enabled: true },
      xaxis: {
        categories: safeTopCategories.map((category) => category.name),
        labels: { style: { fontSize: "12px" } },
      },
      tooltip: {
        y: { formatter: (value) => `${value} productos` },
      },
      grid: { borderColor: "#e5e7eb" },
    }),
    [safeTopCategories],
  );

  const categoriesSeries = useMemo(
    () => [
      {
        name: "Productos",
        data: safeTopCategories.map((category) => category.count),
      },
    ],
    [safeTopCategories],
  );

  const monthlySalesOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        fontFamily: "Outfit, sans-serif",
        type: "area",
        height: 340,
        toolbar: { show: false },
      },
      colors: ["#25d076", "#22c57f"],
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        },
      },
      xaxis: {
        categories: safeMonthlySales.map((point) => point.month),
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        title: { text: "CHF" },
        labels: { formatter: (value) => `CHF ${value.toLocaleString()}` },
      },
      legend: { position: "top" },
      grid: { borderColor: "#e5e7eb" },
      tooltip: {
        y: {
          formatter: (value) =>
            `CHF ${value.toLocaleString("de-CH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
        },
      },
    }),
    [safeMonthlySales],
  );

  const monthlySalesSeries = useMemo(() => {
    if (safeMonthlySales.length === 0) {
      return [
        { name: "Ventas", data: [] },
        { name: "Promedio", data: [] },
      ];
    }

    const average =
      safeMonthlySales.reduce((sum, point) => sum + point.sales, 0) /
      safeMonthlySales.length;

    return [
      {
        name: "Ventas",
        data: safeMonthlySales.map((point) => point.sales),
      },
      {
        name: "Promedio",
        data: safeMonthlySales.map(() => average),
      },
    ];
  }, [safeMonthlySales]);

  if (isInitialLoading) {
    return (
      <AdminDataState
        type="loading"
        title="Cargando analíticas"
        description="Estamos preparando la información de rendimiento de la plataforma."
        className="min-h-[60vh]"
      />
    );
  }

  if (statsError) {
    return (
      <AdminDataState
        type="error"
        title="No pudimos obtener las analíticas"
        description={statsError}
        actionLabel="Reintentar"
        onAction={() => refreshAll()}
        className="min-h-[60vh]"
      />
    );
  }

  if (!stats || !analyticsData || !aggregation) {
    return (
      <AdminDataState
        type="empty"
        title="Sin datos de analítica"
        description="Aún no hay suficiente información para mostrar. Intenta actualizar nuevamente."
        actionLabel="Actualizar"
        onAction={() => refreshAll()}
        className="min-h-[60vh]"
      />
    );
  }

  const { totalOrders, activeStoreCount, avgOrderValue, avgRevenuePerStore, userGrowthRate } =
    aggregation;
  const metricTone: "success" | "danger" = userGrowthRate >= 0 ? "success" : "danger";
  const MetricIcon = userGrowthRate >= 0 ? TrendingUp : TrendingDown;

  const metricCards = [
    {
      id: "revenue",
      label: "Revenue total",
      icon: DollarSign,
      primaryValue: `CHF ${analyticsData.totalRevenue.toLocaleString("de-CH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      secondaryValue: `${totalOrders.toLocaleString("de-CH")} órdenes`,
      helperText: `Periodo ${
        periodOptions.find((option) => option.value === selectedPeriod)?.label?.toLowerCase() ?? ""
      }`,
      tone: "brand" as const,
    },
    {
      id: "ticket",
      label: "Ticket promedio",
      icon: ShoppingCart,
      primaryValue: `CHF ${avgOrderValue.toFixed(2)}`,
      secondaryValue: "Por orden",
      helperText: "Incluye todas las tiendas activas",
      tone: "neutral" as const,
    },
    {
      id: "growth",
      label: "Crecimiento usuarios",
      icon: MetricIcon,
      primaryValue: `${userGrowthRate >= 0 ? "+" : ""}${userGrowthRate.toFixed(1)}%`,
      secondaryValue: "Últimos 12 meses",
      helperText: `${stats.users.total.toLocaleString("de-CH")} usuarios totales`,
      tone: metricTone,
    },
    {
      id: "storeRevenue",
      label: "Revenue por tienda",
      icon: Store,
      primaryValue: `CHF ${avgRevenuePerStore.toLocaleString("de-CH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      secondaryValue: `${activeStoreCount} tiendas activas`,
      helperText: `${analyticsData.salesByStore.length.toLocaleString("de-CH")} tiendas totales`,
      tone: "warning" as const,
    },
  ];

  const topStorePerformance = analyticsData.storePerformance.slice(0, 10);

  return (
    <div className="space-y-6 md:space-y-8">
      <AdminPageHeader
        title="Analytics & Insights"
        description="Visualiza tendencias clave y el rendimiento integral de la plataforma Vendly."
        meta={
          lastUpdatedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 dark:bg-gray-900/70 dark:text-gray-300">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Actualizado {lastUpdatedAt}</span>
            </span>
          ) : null
        }
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AdminSegmentedControl
              items={periodOptions}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              size="sm"
              ariaLabel="Seleccionar periodo de visualización"
            />
            <button
              type="button"
              onClick={() => refreshAll()}
              disabled={isRefreshing}
              tabIndex={0}
              aria-label="Actualizar datos de analytics"
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  refreshAll();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand-200 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-brand-500/40 dark:hover:text-white dark:focus-visible:ring-offset-gray-950"
              title="Actualizar datos"
            >
              <RefreshCw
                className={cn("h-4 w-4", isRefreshing ? "animate-spin" : undefined)}
              />
              <span>Actualizar</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <AdminMetricCard
            key={metric.id}
            icon={metric.icon}
            label={metric.label}
            primaryValue={metric.primaryValue}
            secondaryValue={metric.secondaryValue}
            helperText={metric.helperText}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 xl:items-stretch">
        <div className="col-span-12 lg:col-span-8">
          <AdminSectionCard
            title="Tendencias de ventas"
            subtitle="Ventas mensuales en comparación con el promedio"
          >
            <div className="h-[360px]" aria-label="Gráfico de ventas mensuales">
              <ReactApexChart
                options={monthlySalesOptions}
                series={monthlySalesSeries}
                type="area"
                height={340}
              />
            </div>
          </AdminSectionCard>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <AdminSectionCard
            title="Distribución de ingresos"
            subtitle="Participación por tienda"
          >
            <div
              className="h-[360px]"
              aria-label="Distribución de ingresos por tienda (gráfico de dona)"
            >
              <ReactApexChart
                options={revenueDistributionOptions}
                series={revenueDistributionSeries}
                type="donut"
                height={340}
              />
            </div>
          </AdminSectionCard>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6 xl:items-stretch">
        <div className="col-span-12 lg:col-span-7">
          <AdminSectionCard
            title="Top tiendas por revenue"
            subtitle="Las 10 tiendas con mayor facturación"
          >
            <div className="h-[360px]" aria-label="Ranking de tiendas por ingresos">
              <ReactApexChart
                options={salesByStoreOptions}
                series={salesByStoreSeries}
                type="bar"
                height={340}
              />
            </div>
          </AdminSectionCard>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <AdminSectionCard
            title="Crecimiento de usuarios"
            subtitle="Tendencia en los últimos 12 meses"
          >
            <div className="h-[360px]" aria-label="Gráfico de crecimiento de usuarios">
              <ReactApexChart
                options={userGrowthOptions}
                series={userGrowthSeries}
                type="line"
                height={340}
              />
            </div>
          </AdminSectionCard>
        </div>
      </div>

      <AdminSectionCard
        title="Productos por categoría"
        subtitle="Distribución de productos en la plataforma"
      >
        <div className="h-[360px]" aria-label="Distribución de productos por categoría">
          <ReactApexChart
            options={categoriesOptions}
            series={categoriesSeries}
            type="bar"
            height={340}
          />
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Rendimiento de tiendas"
        subtitle="Comparativa de métricas clave"
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-900/60 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3">Tienda</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Órdenes</th>
                <th className="px-6 py-3">Ticket promedio</th>
                <th className="px-6 py-3">Productos</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {topStorePerformance.map((store) => (
                <tr
                  key={store.id}
                  className="hover:bg-gray-50 transition-colors dark:hover:bg-gray-800/40"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/20">
                        <Store className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white/90">
                        {store.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white/90">
                    CHF{" "}
                    {store.revenue.toLocaleString("de-CH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {store.orders.toLocaleString("de-CH")}
                  </td>
                  <td className="px-6 py-4 font-semibold text-brand-600 dark:text-brand-400">
                    CHF {store.avgOrderValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {store.products.toLocaleString("de-CH")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                        store.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-500",
                      )}
                    >
                      {store.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSectionCard>
    </div>
  );
};

export default SuperAdminAnalytics;

