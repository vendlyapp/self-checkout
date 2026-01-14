import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsData, TimePeriod, UseAnalyticsReturn, QuickAccessReturn } from '@/types';
import {
  calculateTotalSales,
  calculateSalesGrowth
} from '@/components/dashboard/analytics/data/mockData';
import { useOrderStats, useRecentOrders } from '@/hooks/queries';
import { useMyStore } from '@/hooks/queries/useMyStore';
import type { SalesData, PaymentMethod, ShopActivity, CartData, Customer } from '@/components/dashboard/analytics/types';
import { RecentOrder } from '@/lib/services/orderService';

/**
 * Hook para gestión de analytics y métricas del dashboard
 * Maneja datos de ventas, pagos y actividad del carrito
 *
 * @returns UseAnalyticsReturn - Estado completo de analytics
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   loading,
 *   error,
 *   salesPeriod,
 *   totalSales,
 *   salesGrowth,
 *   refreshData,
 * } = useAnalytics();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return <AnalyticsChart data={data} />;
 * ```
 */
// UseAnalyticsReturn interface moved to @/types

// Helper function to transform orders into SalesData
const transformOrdersToSalesData = (orders: RecentOrder[]): SalesData[] => {
  if (orders.length === 0) {
    return [];
  }

  // Agrupar órdenes por día de la semana actual
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay()); // Domingo
  currentWeekStart.setHours(0, 0, 0, 0);

  // Mapeo de días de la semana (getDay() retorna 0=Domingo, 1=Lunes, etc.)
  // Usar abreviaciones alemanas: M=Lunes, D=Martes, M=Miércoles, D=Jueves, F=Viernes, S=Sábado, S=Domingo
  const daysMap: Record<number, string> = {
    0: 'S', // Domingo (Sonntag)
    1: 'M', // Lunes (Montag)
    2: 'D', // Martes (Dienstag)
    3: 'M', // Miércoles (Mittwoch)
    4: 'D', // Jueves (Donnerstag)
    5: 'F', // Viernes (Freitag)
    6: 'S', // Sábado (Samstag)
  };

  const salesByDay: Array<{ dayOfWeek: number; current: number; last: number; date: string }> = [];

  // Inicializar todos los días de la semana
  for (let i = 0; i < 7; i++) {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + i);
    const dayOfWeek = day.getDay();
    salesByDay.push({ dayOfWeek, current: 0, last: 0, date: day.toISOString().split('T')[0] });
  }

  // Agrupar órdenes por día
  orders.forEach((order) => {
    const orderDate = new Date(order.createdAt);
    const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;

    // Solo contar órdenes de la semana actual
    if (orderDate >= currentWeekStart) {
      const dayOfWeek = orderDate.getDay();
      const dayData = salesByDay.find(d => d.dayOfWeek === dayOfWeek);
      if (dayData) {
        dayData.current += orderTotal;
      }
    }
  });

  // Ordenar por día de la semana (0-6)
  salesByDay.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  // Convertir a array con formato SalesData
  return salesByDay.map((data) => ({
    day: daysMap[data.dayOfWeek],
    currentWeek: data.current,
    lastWeek: data.last, // Por ahora 0, se puede mejorar obteniendo datos de la semana pasada
    date: data.date,
  }));
};

// Helper function to transform orders into PaymentMethods
const transformOrdersToPaymentMethods = (orders: RecentOrder[]): PaymentMethod[] => {
  if (orders.length === 0) {
    return [];
  }

  // Agrupar órdenes por método de pago
  const paymentMethodMap = new Map<string, { count: number; total: number }>();

  orders.forEach((order) => {
    const method = order.paymentMethod || 'Desconocido';
    const total = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;

    if (!paymentMethodMap.has(method)) {
      paymentMethodMap.set(method, { count: 0, total: 0 });
    }

    const current = paymentMethodMap.get(method)!;
    current.count += 1;
    current.total += total;
  });

  // Convertir a array de PaymentMethod
  const totalOrders = orders.length;
  const totalRevenue = Array.from(paymentMethodMap.values()).reduce((sum, method) => sum + method.total, 0);

  return Array.from(paymentMethodMap.entries()).map(([name, data]) => ({
    type: name,
    percentage: totalOrders > 0 ? Math.round((data.count / totalOrders) * 100) : 0,
    total: data.total,
    color: getPaymentMethodColor(name),
    transactions: data.count,
  }));
};

// Helper para asignar colores a métodos de pago
const getPaymentMethodColor = (method: string): string => {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('twint')) return '#6B46C1';
  if (methodLower.includes('qr') || methodLower.includes('rechnung')) return '#059669';
  if (methodLower.includes('cash') || methodLower.includes('bargeld')) return '#D97706';
  if (methodLower.includes('card') || methodLower.includes('kredit') || methodLower.includes('debit')) return '#2563EB';
  if (methodLower.includes('klarna')) return '#F97316';
  if (methodLower.includes('postfinance')) return '#DC2626';
  return '#6B7280'; // Default gray
};

// Helper function to transform orders into ShopActivity
const transformOrdersToShopActivity = (orders: RecentOrder[]): ShopActivity => {
  // Obtener usuarios únicos de las órdenes
  const uniqueUsers = new Map<string, { name: string; lastOrder: Date }>();
  
  orders.forEach((order) => {
    const userId = order.userId;
    const userName = order.userName || 'Cliente';
    const orderDate = new Date(order.createdAt);

    if (!uniqueUsers.has(userId) || uniqueUsers.get(userId)!.lastOrder < orderDate) {
      uniqueUsers.set(userId, { name: userName, lastOrder: orderDate });
    }
  });

  // Considerar usuarios activos si han hecho una orden en las últimas 24 horas
  const now = new Date();
  const activeCustomers: Customer[] = Array.from(uniqueUsers.values())
    .filter(user => {
      const hoursSinceLastOrder = (now.getTime() - user.lastOrder.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastOrder <= 24;
    })
    .map((user, index) => ({
      id: `customer-${index}`,
      avatar: '👤',
      name: user.name,
      status: 'active' as const,
    }));

  const totalActive = activeCustomers.length;
  const totalInactive = Math.max(0, uniqueUsers.size - totalActive);

  // Calcular valor de carritos abiertos (por ahora 0, se puede mejorar con carritos activos)
  const openCartsValue = 0;
  const progressPercentage = totalActive > 0 ? Math.round((totalActive / Math.max(1, uniqueUsers.size)) * 100) : 0;

  return {
    activeCustomers,
    totalActive,
    totalInactive,
    openCartsValue,
    progressPercentage,
  };
};

// Helper function to create CartData
const createCartData = (orders: RecentOrder[]): CartData => {
  if (orders.length === 0) {
    return {
      averageValue: 0,
      percentageChange: 0,
      trend: 'up',
      comparisonPeriod: 'gestern',
      maxValue: 100,
      minValue: 0,
    };
  }

  const totals = orders.map(order => typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0);
  const averageValue = totals.reduce((sum, total) => sum + total, 0) / totals.length;
  const maxValue = Math.max(...totals);
  const minValue = Math.min(...totals);

  return {
    averageValue: Math.round(averageValue),
    percentageChange: 0, // Por ahora 0, se puede calcular comparando con el día anterior
    trend: 'up',
    comparisonPeriod: 'gestern',
    maxValue: Math.ceil(maxValue),
    minValue: Math.floor(minValue),
  };
};

export const useAnalytics = (): UseAnalyticsReturn => {
  // Period states for different components
  const [salesPeriod, setSalesPeriod] = useState<TimePeriod>('woche');
  const [paymentPeriod, setPaymentPeriod] = useState<TimePeriod>('heute');
  const [cartPeriod, setCartPeriod] = useState<TimePeriod>('heute');

  // Obtener store del usuario para filtrar órdenes
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId || store?.id;

  // Obtener estadísticas de órdenes
  const { data: orderStats, isLoading: statsLoading, error: statsError } = useOrderStats(undefined, ownerId);
  
  // Obtener órdenes recientes (por ahora todas, se puede filtrar por store cuando el backend lo soporte)
  const { data: recentOrders = [], isLoading: ordersLoading, error: ordersError } = useRecentOrders(100);

  // Transformar datos reales en AnalyticsData
  const data = useMemo<AnalyticsData | null>(() => {
    if (!recentOrders || recentOrders.length === 0) {
      // Si no hay órdenes, retornar datos vacíos con estructura correcta
      return {
        shopActivity: {
          activeCustomers: [],
          totalActive: 0,
          totalInactive: 0,
          openCartsValue: 0,
          progressPercentage: 0,
        },
        salesData: [],
        paymentMethods: [],
        cartData: {
          averageValue: 0,
          percentageChange: 0,
          trend: 'up',
          comparisonPeriod: 'gestern',
          maxValue: 100,
          minValue: 0,
        },
        quickAccess: [
          { id: 'sales', title: 'Verkäufe', subtitle: 'Ansehen, verwalten', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { id: 'cancel', title: 'Storno', subtitle: 'Verkauf stornieren', color: 'bg-red-100', iconColor: 'text-red-600' },
          { id: 'receipts', title: 'Belege', subtitle: 'Ansehen, senden', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { id: 'cart', title: 'Warenkorb', subtitle: 'Ansehen', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        ],
      };
    }

    const salesData = transformOrdersToSalesData(recentOrders);
    const paymentMethods = transformOrdersToPaymentMethods(recentOrders);
    const shopActivity = transformOrdersToShopActivity(recentOrders);
    const cartData = createCartData(recentOrders);

    return {
      shopActivity,
      salesData,
      paymentMethods,
      cartData,
      quickAccess: [
        { id: 'sales', title: 'Verkäufe', subtitle: 'Ansehen, verwalten', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { id: 'cancel', title: 'Storno', subtitle: 'Verkauf stornieren', color: 'bg-red-100', iconColor: 'text-red-600' },
        { id: 'receipts', title: 'Belege', subtitle: 'Ansehen, senden', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
        { id: 'cart', title: 'Warenkorb', subtitle: 'Ansehen', color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
      ],
    };
  }, [recentOrders]);

  // Calculate derived values
  const totalSales = useMemo(() => {
    return data ? calculateTotalSales(data.salesData) : 0;
  }, [data]);

  const salesGrowth = useMemo(() => {
    return data ? calculateSalesGrowth(data.salesData) : 0;
  }, [data]);

  // Loading and error states
  const loading = statsLoading || ordersLoading;
  const error = statsError || ordersError 
    ? (statsError?.message || ordersError?.message || 'Fehler beim Laden der Analytics-Daten')
    : null;

  // Refresh data function (usando React Query, el cache se actualiza automáticamente)
  const refreshData = useCallback(async () => {
    // React Query maneja el refresh automáticamente según staleTime
    // Si necesitamos forzar refresh, podemos invalidar queries aquí
  }, []);

  return {
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
  };
};

/**
 * Hook para acceso rápido a funciones del dashboard
 * Proporciona funciones de navegación y acciones rápidas
 *
 * @returns QuickAccessReturn - Funciones de acceso rápido
 *
 * @example
 * ```tsx
 * const { handleViewSales, handleCancelSale, handleViewReceipts } = useQuickAccess();
 *
 * return (
 *   <div>
 *     <button onClick={handleViewSales}>Ver Ventas</button>
 *     <button onClick={handleCancelSale}>Cancelar Venta</button>
 *   </div>
 * );
 * ```
 */
// QuickAccessReturn interface moved to @/types

export const useQuickAccess = (): QuickAccessReturn => {
  const router = useRouter();

  const handleViewSales = () => {
    // TODO: Implement navigation to sales page
    console.log('Navigate to sales page');
  };

  const handleCancelSale = () => {
    // TODO: Implement cancel sale functionality
    console.log('Cancel current sale');
  };

  const handleViewReceipts = () => {
    router.push('/sales/invoices');
  };

  const handleGoToCart = () => {
    router.push('/sales/orders');
  };

  return {
    handleViewSales,
    handleCancelSale,
    handleViewReceipts,
    handleGoToCart,
  };
};
