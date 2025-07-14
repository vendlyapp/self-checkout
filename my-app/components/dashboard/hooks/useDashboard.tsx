import { useState, useEffect, useCallback } from 'react';
import { Users, Flame, FileText, Tag, Calculator, ShoppingCart } from 'lucide-react';
import type { QuickAccessItem, Sale, SearchResult } from '../types';

interface DashboardData {
  currentAmount: number;
  goalAmount: number;
  percentage: number;
  quickAccessItems: QuickAccessItem[];
  recentSales: Sale[];
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  isStoreOpen: boolean;
  searchQuery: string;
  isSearching: boolean;
  searchResults: SearchResult[];
  currentSlideIndex: number;
  setIsStoreOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCurrentSlideIndex: (index: number) => void;
  handleSearch: (query: string) => Promise<void>;
  handleToggleStore: () => void;
  refreshData: () => Promise<void>;
}

// Datos mock para el dashboard
const mockDashboardData: DashboardData = {
  currentAmount: 1580,
  goalAmount: 2000,
  percentage: 79,
  quickAccessItems: [
    { id: '1', icon: <Users className="w-5 h-5" />, label: 'Kunden' },
    { id: '2', icon: <Flame className="w-5 h-5" />, label: 'Bestseller' },
    { id: '3', icon: <FileText className="w-5 h-5" />, label: 'Verkäufe' },
    { id: '4', icon: <Tag className="w-5 h-5" />, label: 'Rabatte' },
    { id: '5', icon: <Calculator className="w-5 h-5" />, label: 'Rechner' },
    { id: '6', icon: <ShoppingCart className="w-5 h-5" />, label: 'Warenkorb' },
  ],
  recentSales: [
    {
      id: '1',
      name: 'Sandra Keller',
      receipt: 'Beleg #0388',
      time: '3h',
      amount: 158.50,
      paymentMethod: 'TWINT',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Gastkunde',
      receipt: 'Beleg #0384',
      time: '5h',
      amount: 18,
      paymentMethod: 'Debitkarte',
      status: 'pending'
    },
    {
      id: '3',
      name: 'Max Meier',
      receipt: 'Beleg #0382',
      time: '7h',
      amount: 9,
      paymentMethod: 'Bar',
      status: 'cancelled'
    },
    {
      id: '4',
      name: 'Max Meier',
      receipt: 'Beleg #0382',
      time: '10h',
      amount: 100,
      paymentMethod: 'Bar',
      status: 'completed'
    }
  ]
};

// Simular carga de datos desde API
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockDashboardData;
};

// Simular búsqueda
const searchData = async (query: string): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { id: 1, name: `Resultado para "${query}" 1`, type: 'product' },
    { id: 2, name: `Resultado para "${query}" 2`, type: 'sale' },
  ];
};

export const useDashboard = (): UseDashboardReturn => {
  // Estado principal
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de UI
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  // Cargar datos iniciales
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejar búsqueda
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchData(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Toggle de tienda
  const handleToggleStore = useCallback(() => {
    setIsStoreOpen(prev => !prev);
  }, []);

  // Refrescar datos
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Cargar datos al montar
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Limpiar resultados de búsqueda cuando cambia el query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

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
    refreshData
  };
}; 