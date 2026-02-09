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
import { useCartStore } from '@/lib/stores/cartStore';

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

// Helper para formatear rango de fechas (de-CH)
const formatDateRange = (start: Date, end: Date): string => {
  const fmt = (d: Date) => d.toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
};

// Fecha local YYYY-MM-DD (evita que el gráfico muestre "un día adelantado" por UTC)
const toLocalDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Helper function to transform orders into SalesData based on period (always returns labels)
const transformOrdersToSalesData = (
  orders: RecentOrder[],
  period: TimePeriod
): { data: SalesData[]; currentPeriodLabel: string; lastPeriodLabel: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  let periodStart: Date;
  let periodEnd: Date;

  switch (period) {
    case 'heute':
      periodStart = new Date(today);
      periodEnd = new Date(today);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case 'woche':
      // Lunes como inicio de semana (ISO)
      const dayNum = today.getDay() || 7; // 0=Dom -> 7, 1=Lun -> 1
      periodStart = new Date(today);
      periodStart.setDate(today.getDate() - dayNum + 1);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case 'monat':
      periodStart = new Date(year, today.getMonth(), 1);
      periodEnd = new Date(year, today.getMonth() + 1, 0);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case 'jahr':
      periodStart = new Date(year, 0, 1);
      periodEnd = new Date(year, 11, 31);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    default:
      periodStart = new Date(today);
      periodStart.setDate(today.getDate() - (today.getDay() || 7) + 1);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
  }

  // Período anterior
  const lastPeriodStart = new Date(periodStart);
  const lastPeriodEnd = new Date(periodEnd);
  if (period === 'heute') {
    lastPeriodStart.setDate(periodStart.getDate() - 1);
    lastPeriodEnd.setDate(periodEnd.getDate() - 1);
    lastPeriodEnd.setHours(23, 59, 59, 999);
  } else if (period === 'woche') {
    lastPeriodStart.setDate(periodStart.getDate() - 7);
    lastPeriodEnd.setDate(periodEnd.getDate() - 7);
  } else if (period === 'monat') {
    lastPeriodStart.setMonth(periodStart.getMonth() - 1);
    lastPeriodEnd.setMonth(periodEnd.getMonth() - 1);
    lastPeriodEnd.setHours(23, 59, 59, 999);
  } else {
    lastPeriodStart.setFullYear(periodStart.getFullYear() - 1);
    lastPeriodEnd.setFullYear(periodEnd.getFullYear() - 1);
  }

  const currentOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= periodStart && d <= periodEnd;
  });
  const lastOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return d >= lastPeriodStart && d <= lastPeriodEnd;
  });

  const currentPeriodLabel = formatDateRange(periodStart, periodEnd);
  const lastPeriodLabel = formatDateRange(lastPeriodStart, lastPeriodEnd);

  if (period === 'heute') {
    const total = currentOrders.reduce(
      (s, o) => s + (typeof o.total === 'number' ? o.total : parseFloat(String(o.total)) || 0),
      0
    );
    const lastTotal = lastOrders.reduce(
      (s, o) => s + (typeof o.total === 'number' ? o.total : parseFloat(String(o.total)) || 0),
      0
    );
    return {
      data: [{ day: 'Heute', currentWeek: total, lastWeek: lastTotal, date: toLocalDateString(periodStart) }],
      currentPeriodLabel,
      lastPeriodLabel,
    };
  }

  if (period === 'woche') {
    const daysMap: Record<number, string> = {
      1: 'Mo',
      2: 'Di',
      3: 'Mi',
      4: 'Do',
      5: 'Fr',
      6: 'Sa',
      0: 'So',
    };
    const buckets: Array<{ day: number; current: number; last: number; date: string }> = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(periodStart);
      d.setDate(periodStart.getDate() + i - 1);
      buckets.push({
        day: i === 7 ? 0 : i,
        current: 0,
        last: 0,
        date: toLocalDateString(d),
      });
    }
    const addToBucket = (orderList: RecentOrder[], key: 'current' | 'last') => {
      orderList.forEach((o) => {
        const date = new Date(o.createdAt);
        const dow = date.getDay();
        const total = typeof o.total === 'number' ? o.total : parseFloat(String(o.total)) || 0;
        const b = buckets.find((x) => x.day === dow);
        if (b) b[key] += total;
      });
    };
    addToBucket(currentOrders, 'current');
    addToBucket(lastOrders, 'last');
    buckets.sort((a, b) => (a.day === 0 ? 7 : a.day) - (b.day === 0 ? 7 : b.day));
    return {
      data: buckets.map((b) => ({
        day: daysMap[b.day],
        currentWeek: b.current,
        lastWeek: b.last,
        date: b.date,
      })),
      currentPeriodLabel,
      lastPeriodLabel,
    };
  }

  if (period === 'monat' || period === 'jahr') {
    const weekMap = new Map<string, { current: number; last: number }>();
    const addOrder = (orderList: RecentOrder[], key: 'current' | 'last') => {
      orderList.forEach((o) => {
        const wn = getWeekNumber(new Date(o.createdAt));
        const y = new Date(o.createdAt).getFullYear();
        const k = `${y}-W${wn}`;
        if (!weekMap.has(k)) weekMap.set(k, { current: 0, last: 0 });
        const entry = weekMap.get(k)!;
        entry[key] += typeof o.total === 'number' ? o.total : parseFloat(String(o.total)) || 0;
      });
    };
    addOrder(currentOrders, 'current');
    addOrder(lastOrders, 'last');
    const sorted = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return {
      data: sorted.map(([k, v]) => ({ day: `W${k.split('-W')[1]}`, currentWeek: v.current, lastWeek: v.last, date: k })),
      currentPeriodLabel,
      lastPeriodLabel,
    };
  }

  return { data: [], currentPeriodLabel: '', lastPeriodLabel: '' };
};

// Helper para calcular número de semana
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Helper function to format payment method name with proper capitalization
const formatPaymentMethodName = (method: string): string => {
  if (!method) return 'Unbekannt';
  
  // Convertir a minúsculas primero para normalizar
  const lowerMethod = method.toLowerCase().trim();
  
  // Mapeo de nombres conocidos con su formato correcto
  const methodMap: Record<string, string> = {
    'twint': 'Twint',
    'bargeld': 'Bargeld',
    'cash': 'Bargeld',
    'efectivo': 'Bargeld',
    'karte': 'Karte',
    'card': 'Karte',
    'kreditkarte': 'Kreditkarte',
    'credit card': 'Kreditkarte',
    'debitkarte': 'Debitkarte',
    'debit card': 'Debitkarte',
    'klarna': 'Klarna',
    'postfinance': 'PostFinance',
    'post finance': 'PostFinance',
    'qr': 'QR-Code',
    'qr code': 'QR-Code',
    'rechnung': 'Rechnung',
    'invoice': 'Rechnung',
    'überweisung': 'Überweisung',
    'transfer': 'Überweisung',
    'digital': 'Digital',
    'unbekannt': 'Unbekannt',
    'desconocido': 'Unbekannt',
    'unknown': 'Unbekannt',
  };
  
  // Buscar coincidencia exacta primero
  if (methodMap[lowerMethod]) {
    return methodMap[lowerMethod];
  }
  
  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(methodMap)) {
    if (lowerMethod.includes(key)) {
      return value;
    }
  }
  
  // Si no hay coincidencia, capitalizar primera letra
  return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
};

// Helper function to filter orders by period
const filterOrdersByPeriod = (orders: RecentOrder[], period: TimePeriod): RecentOrder[] => {
  if (orders.length === 0) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let periodStart: Date;
  let periodEnd: Date;

  switch (period) {
    case 'heute':
      periodStart = new Date(today);
      periodEnd = new Date(today);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case 'woche': {
      // Lunes–domingo (igual que el gráfico Umsatz)
      const dayNum = today.getDay() || 7;
      periodStart = new Date(today);
      periodStart.setDate(today.getDate() - dayNum + 1);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    }
    case 'monat':
      periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
      periodEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    case 'jahr':
      periodStart = new Date(today.getFullYear(), 0, 1);
      periodEnd = new Date(today.getFullYear(), 11, 31);
      periodEnd.setHours(23, 59, 59, 999);
      break;
    default:
      periodStart = new Date(today);
      periodEnd = new Date(today);
      periodEnd.setHours(23, 59, 59, 999);
  }

  // Filtrar órdenes del período
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= periodStart && orderDate <= periodEnd;
  });
};

// Helper function to transform orders into PaymentMethods
const transformOrdersToPaymentMethods = (orders: RecentOrder[], period: TimePeriod): PaymentMethod[] => {
  // Filtrar órdenes por período primero
  const periodOrders = filterOrdersByPeriod(orders, period);
  
  if (periodOrders.length === 0) {
    return [];
  }

  // Agrupar órdenes por método de pago
  const paymentMethodMap = new Map<string, { count: number; total: number }>();

  periodOrders.forEach((order) => {
    const rawMethod = order.paymentMethod || 'Unbekannt';
    const method = formatPaymentMethodName(rawMethod);
    const total = typeof order.total === 'number' ? order.total : parseFloat(String(order.total)) || 0;

    if (!paymentMethodMap.has(method)) {
      paymentMethodMap.set(method, { count: 0, total: 0 });
    }

    const current = paymentMethodMap.get(method)!;
    current.count += 1;
    current.total += total;
  });

  // Convertir a array de PaymentMethod
  const totalOrders = periodOrders.length;
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
    const userName = order.userName || 'Kunde';
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
  // Un solo período compartido: Umsatz, Zahlungsmethoden y Warenkorb sincronizados.
  // Al cambiar cualquier selector, los tres gráficos muestran el mismo período.
  const [analyticsPeriod, setAnalyticsPeriod] = useState<TimePeriod>('heute');
  const salesPeriod = analyticsPeriod;
  const paymentPeriod = analyticsPeriod;
  const cartPeriod = analyticsPeriod;
  const setSalesPeriod = setAnalyticsPeriod;
  const setPaymentPeriod = setAnalyticsPeriod;
  const setCartPeriod = setAnalyticsPeriod;

  // Obtener store del usuario para filtrar órdenes (ownerId = dueño de la tienda)
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId ?? (store as { ownerid?: string } | undefined)?.ownerid ?? store?.id;

  // Obtener estadísticas de órdenes
  const { data: orderStats, isLoading: statsLoading, error: statsError } = useOrderStats(undefined, ownerId);
  
  // Obtener órdenes recientes (ya filtradas por store automáticamente)
  // Usar más órdenes para tener datos históricos según el período seleccionado
  const { data: recentOrders = [], isLoading: ordersLoading, error: ordersError } = useRecentOrders(500);

  // Contamos todas las órdenes que NO están canceladas (pending, processing, completed = venta/ganancia).
  // Solo las canceladas se excluyen y no cuentan en gráficos ni estadísticas.
  const completedOrders = useMemo(
    () => (recentOrders || []).filter((o) => o.status !== 'cancelled'),
    [recentOrders]
  );

  // Transformar datos reales en AnalyticsData (siempre obtenemos labels de período)
  const { data: analyticsData, salesPeriodLabels } = useMemo(() => {
    const emptyStructure = {
      shopActivity: {
        activeCustomers: [] as Customer[],
        totalActive: 0,
        totalInactive: 0,
        openCartsValue: 0,
        progressPercentage: 0,
      },
      salesData: [] as SalesData[],
      paymentMethods: [] as PaymentMethod[],
      cartData: {
        averageValue: 0,
        percentageChange: 0,
        trend: 'up' as const,
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

    const { data: salesData, currentPeriodLabel, lastPeriodLabel } = transformOrdersToSalesData(completedOrders, salesPeriod);

    if (completedOrders.length === 0) {
      return {
        data: { ...emptyStructure } as AnalyticsData,
        salesPeriodLabels: { current: currentPeriodLabel, last: lastPeriodLabel },
      };
    }

    const paymentMethods = transformOrdersToPaymentMethods(completedOrders, paymentPeriod);
    const shopActivity = transformOrdersToShopActivity(completedOrders);
    const ordersForCart = filterOrdersByPeriod(completedOrders, cartPeriod);
    const cartData = createCartData(ordersForCart);
    return {
      data: {
        shopActivity,
        salesData,
        paymentMethods,
        cartData,
        quickAccess: emptyStructure.quickAccess,
      },
      salesPeriodLabels: { current: currentPeriodLabel, last: lastPeriodLabel },
    };
  }, [completedOrders, salesPeriod, paymentPeriod, cartPeriod]);

  const data = analyticsData;

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
    salesPeriodLabels: salesPeriodLabels ?? { current: '', last: '' },
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
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const handleViewSales = () => {
    // Navegar a página de ventas completas
    router.push('/sales/verkaufe');
  };

  const handleCancelSale = () => {
    // Navegar a órdenes canceladas (storno)
    router.push('/sales/orders?status=cancelled');
  };

  const handleViewReceipts = () => {
    router.push('/sales/invoices');
  };

  const handleGoToCart = () => {
    // Verificar si hay items en el carrito
    const totalItems = getTotalItems();
    if (totalItems > 0) {
      // Si hay items, ir al carrito
      router.push('/charge/cart');
    } else {
      // Si no hay items, ir a la página principal de charge
      router.push('/charge');
    }
  };

  return {
    handleViewSales,
    handleCancelSale,
    handleViewReceipts,
    handleGoToCart,
  };
};
