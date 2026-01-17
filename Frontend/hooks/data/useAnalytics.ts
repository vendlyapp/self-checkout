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

// Helper function to transform orders into SalesData based on period
const transformOrdersToSalesData = (orders: RecentOrder[], period: TimePeriod): SalesData[] => {
  if (orders.length === 0) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let periodStart: Date;
  let periodEnd: Date = new Date(today);
  periodEnd.setHours(23, 59, 59, 999);

  // Determinar el rango de fechas según el período
  switch (period) {
    case 'heute':
      periodStart = new Date(today);
      break;
    case 'woche':
      periodStart = new Date(today);
      periodStart.setDate(today.getDate() - today.getDay()); // Domingo
      break;
    case 'monat':
      periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'jahr':
      periodStart = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      periodStart = new Date(today);
      periodStart.setDate(today.getDate() - today.getDay());
  }

  // Filtrar órdenes del período
  const periodOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= periodStart && orderDate <= periodEnd;
  });

  if (periodOrders.length === 0) {
    return [];
  }

  // Agrupar por día según el período
  if (period === 'heute' || period === 'woche') {
    // Para hoy/semana: agrupar por día de la semana
    const daysMap: Record<number, string> = {
      0: 'S', 1: 'M', 2: 'D', 3: 'M', 4: 'D', 5: 'F', 6: 'S',
    };

    const salesByDay: Array<{ dayOfWeek: number; current: number; last: number; date: string }> = [];
    
    // Inicializar días del período
    for (let i = 0; i < (period === 'heute' ? 1 : 7); i++) {
      const day = new Date(periodStart);
      day.setDate(periodStart.getDate() + i);
      const dayOfWeek = day.getDay();
      salesByDay.push({ dayOfWeek, current: 0, last: 0, date: day.toISOString().split('T')[0] });
    }

    // Agrupar órdenes por día
    periodOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;
      const dayOfWeek = orderDate.getDay();
      const dayData = salesByDay.find(d => d.dayOfWeek === dayOfWeek);
      if (dayData) {
        dayData.current += orderTotal;
      }
    });

    salesByDay.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return salesByDay.map((data) => ({
      day: daysMap[data.dayOfWeek],
      currentWeek: data.current,
      lastWeek: data.last,
      date: data.date,
    }));
  } else {
    // Para mes/año: agrupar por semana del período
    const salesByWeek: Map<string, number> = new Map();
    
    periodOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;
      
      // Calcular semana del año
      const weekNumber = getWeekNumber(orderDate);
      const weekKey = `${orderDate.getFullYear()}-W${weekNumber}`;
      
      salesByWeek.set(weekKey, (salesByWeek.get(weekKey) || 0) + orderTotal);
    });

    // Convertir a array y ordenar
    return Array.from(salesByWeek.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekKey, total]) => {
        const [year, weekStr] = weekKey.split('-W');
        return {
          day: `W${weekStr}`,
          currentWeek: total,
          lastWeek: 0,
          date: weekKey,
        };
      });
  }
};

// Helper para calcular número de semana
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
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
  
  // Obtener órdenes recientes (ya filtradas por store automáticamente)
  // Usar más órdenes para tener datos históricos según el período seleccionado
  const { data: recentOrders = [], isLoading: ordersLoading, error: ordersError } = useRecentOrders(500);

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

    const salesData = transformOrdersToSalesData(recentOrders, salesPeriod);
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
  }, [recentOrders, salesPeriod]);

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
