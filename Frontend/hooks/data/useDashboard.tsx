import { useState, useCallback, useMemo } from 'react';
import { Users, Flame, FileText, Tag, Calculator, ShoppingCart } from 'lucide-react';
import type { SearchResult, DashboardData, UseDashboardReturn } from '@/types';
import { useOrderStats, useRecentOrders } from '@/hooks/queries';
import { useMyStore } from '@/hooks/queries/useMyStore';

/**
 * Hook principal para gestión del dashboard
 * Maneja estado de la tienda, búsquedas, datos y navegación
 *
 * @returns UseDashboardReturn - Estado completo del dashboard
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   loading,
 *   error,
 *   isStoreOpen,
 *   searchQuery,
 *   searchResults,
 *   handleSearch,
 *   handleToggleStore,
 *   refreshData,
 * } = useDashboard();
 *
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 *
 * return <Dashboard data={data} />;
 * ```
 */
// DashboardData and UseDashboardReturn interfaces moved to @/types

// Datos mock para el dashboard
const mockDashboardData: DashboardData = {
  currentAmount: 1580,
  goalAmount: 2000,
  percentage: 79,
  quickAccessItems: [
    { id: '1', icon: <Users className="w-5 h-5" />, title: 'Kunden', subtitle: 'Verwalten', color: 'blue', iconColor: 'blue', action: () => {} },
    { id: '2', icon: <Flame className="w-5 h-5" />, title: 'Bestseller', subtitle: 'Anzeigen', color: 'red', iconColor: 'red', action: () => {} },
    { id: '3', icon: <FileText className="w-5 h-5" />, title: 'Verkäufe', subtitle: 'Berichte', color: 'green', iconColor: 'green', action: () => {} },
    { id: '4', icon: <Tag className="w-5 h-5" />, title: 'Rabatte', subtitle: 'Verwalten', color: 'purple', iconColor: 'purple', action: () => {} },
    { id: '5', icon: <Calculator className="w-5 h-5" />, title: 'Rechner', subtitle: 'Tools', color: 'orange', iconColor: 'orange', action: () => {} },
    { id: '6', icon: <ShoppingCart className="w-5 h-5" />, title: 'Warenkorb', subtitle: 'Verwalten', color: 'teal', iconColor: 'teal', action: () => {} },
  ],
  recentSales: [
    {
      id: '1',
      name: 'Sandra Keller',
      receipt: 'Beleg #0388',
      time: '3h',
      amount: 158,
      paymentMethod: 'TWINT',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Michael Weber',
      receipt: 'Beleg #0387',
      time: '5h',
      amount: 89,
      paymentMethod: 'Karte',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Anna Müller',
      receipt: 'Beleg #0386',
      time: '7h',
      amount: 234,
      paymentMethod: 'Bar',
      status: 'completed'
    }
  ]
};

export const useDashboard = (): UseDashboardReturn => {
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Obtener store del usuario para filtrar estadísticas
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId || store?.id;

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Usar React Query para obtener estadísticas del día (con cache) - filtrado por tienda
  const { 
    data: orderStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useOrderStats(today, ownerId);

  // Usar React Query para obtener órdenes recientes (con cache)
  const { 
    data: recentOrders, 
    isLoading: ordersLoading, 
    error: ordersError 
  } = useRecentOrders(10);

  // Calcular datos del dashboard desde las queries
  const data = useMemo<DashboardData | null>(() => {
    if (!orderStats && !recentOrders) {
      return null;
    }

    const goalAmount = 2000; // Meta diaria fija (puede venir de configuración)
    const currentAmount = orderStats?.totalRevenue || 0;
    const percentage = goalAmount > 0 
      ? Math.min(100, Math.round((currentAmount / goalAmount) * 100))
      : 0;

    // Procesar órdenes recientes
    const recentSales: DashboardData['recentSales'] = recentOrders?.map((order) => {
      // Calcular tiempo transcurrido
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
      const timeAgo = diffHours > 0 ? `${diffHours}h` : 'Ahora';

      // Asegurar que amount sea un número
      const amount = typeof order.total === 'number' 
        ? order.total 
        : typeof order.total === 'string' 
          ? parseFloat(order.total) || 0 
          : 0;

      return {
        id: order.id,
        name: order.userName || 'Cliente',
        receipt: `Beleg #${String(order.id).slice(-4).toUpperCase()}`,
        time: timeAgo,
        amount,
        paymentMethod: order.paymentMethod || 'Karte', // Usar paymentMethod del backend si está disponible
        status: (order.status || 'completed') as 'pending' | 'completed' | 'cancelled',
      };
    }) || [];

    return {
      currentAmount,
      goalAmount,
      percentage,
      quickAccessItems: mockDashboardData.quickAccessItems,
      recentSales, // No usar mocks, mostrar solo ventas reales
    };
  }, [orderStats, recentOrders]);

  // Estados combinados
  const loading = statsLoading || ordersLoading;
  
  // No mostrar error si es "Backend no disponible" - los datos vacíos son suficientes
  // Solo mostrar errores que no sean de conexión
  const error = (statsError || ordersError) 
    ? (() => {
        const errorMessage = statsError?.message || ordersError?.message || '';
        // Si el error es de backend no disponible, no mostrar error (datos vacíos son suficientes)
        if (
          errorMessage.includes('Backend no disponible') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage === 'CANCELLED'
        ) {
          return null;
        }
        return errorMessage || 'Fehler beim Laden der Dashboard-Daten';
      })()
    : null;

  // Función para refrescar datos (invalidar cache de React Query)
  const refreshData = useCallback(async () => {
    // React Query maneja el refresh automáticamente
    // Si necesitamos forzar refresh, podemos usar queryClient.invalidateQueries
    // Por ahora, el cache se actualiza automáticamente según staleTime
  }, []);

  // Búsqueda simulada
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Simular delay de búsqueda
      await new Promise(resolve => setTimeout(resolve, 500));

      // Resultados mock
      const mockResults: SearchResult[] = [
        {
          id: 1,
          name: `Verkäufe für "${query}"`,
          type: 'metric'
        },
        {
          id: 2,
          name: `Produkte mit "${query}"`,
          type: 'product'
        }
      ];

      setSearchResults(mockResults);
    } catch (err) {
      console.error('Fehler bei der Suche:', err);
      // El error se maneja silenciosamente para búsquedas
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Alternar estado de la tienda
  const handleToggleStore = useCallback(() => {
    setIsStoreOpen(prev => !prev);
  }, []);


  return {
    data,
    loading,
    error,
    isStoreOpen,
    searchQuery,
    isSearching,
    searchResults,
    currentSlideIndex,
    setIsStoreOpen,
    setSearchQuery,
    setCurrentSlideIndex,
    handleSearch,
    handleToggleStore,
    refreshData,
  };
};
