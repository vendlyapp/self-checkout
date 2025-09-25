import { useState, useEffect, useCallback } from 'react';
import { Users, Flame, FileText, Tag, Calculator, ShoppingCart } from 'lucide-react';
import type { SearchResult, DashboardData, UseDashboardReturn } from '@/types';

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Simular carga de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setData(mockDashboardData);
    } catch (err) {
      setError('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setLoading(false);
    }
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
      setError('Fehler bei der Suche');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Alternar estado de la tienda
  const handleToggleStore = useCallback(() => {
    setIsStoreOpen(prev => !prev);
  }, []);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
