# 🎣 Dashboard Hooks

**Hooks centralizados para gestión de estado del dashboard**  
Lógica reutilizable y estado centralizado para componentes del dashboard en Vendly Self-Checkout.

## 📋 Hooks Disponibles

```
hooks/
├── useDashboard.tsx             # Hook principal del dashboard
└── index.ts                     # Barrel exports
```

## 🎯 Hook Principal

### **useDashboard**
**Hook centralizado para todo el estado del dashboard**

```tsx
import { useDashboard } from '@/components/dashboard/hooks';

const {
  // 📊 Data & Loading
  data,                    // DashboardData | null
  loading,                 // boolean
  error,                   // string | null
  
  // 🏪 Store State  
  isStoreOpen,            // boolean
  handleToggleStore,      // () => void
  
  // 🔍 Search
  searchQuery,            // string
  searchResults,          // any[]
  isSearching,            // boolean
  setSearchQuery,         // (query: string) => void
  handleSearch,           // (query: string) => Promise<void>
  
  // 🎠 Slider
  currentSlideIndex,      // number
  setCurrentSlideIndex,   // (index: number) => void
  
  // 🔄 Actions
  refreshData             // () => Promise<void>
} = useDashboard();
```

## 🏗️ Estructura de Datos

### **DashboardData Interface**
```typescript
interface DashboardData {
  // Información de la tienda
  store: {
    name: string;
    isOpen: boolean;
    lastSale: string;
    totalToday: number;
  };
  
  // Estadísticas del día
  todayStats: {
    sales: {
      count: number;
      amount: number;
      trend: 'up' | 'down' | 'neutral';
    };
    customers: {
      count: number;
      unique: number;
      trend: 'up' | 'down' | 'neutral';
    };
  };
  
  // Objetivo diario
  dailyGoal: {
    currentAmount: number;
    goalAmount: number;
    percentage: number;
  };
  
  // Ventas recientes
  recentSales: Sale[];
  
  // Acceso rápido
  quickAccess: {
    items: QuickAccessItem[];
    currentSlide: number;
  };
}
```

### **Sale Interface**
```typescript
interface Sale {
  id: string;
  customer: string;
  amount: number;
  time: string;
  items: number;
  paymentMethod: 'card' | 'cash' | 'qr' | 'other';
  status: 'completed' | 'pending' | 'failed';
}
```

### **QuickAccessItem Interface**
```typescript
interface QuickAccessItem {
  id: string;
  icon: string;
  label: string;
  href?: string;
  action?: () => void;
}
```

## 🔧 Funcionalidades del Hook

### **1. Gestión de Estado de Carga**
```tsx
const DashboardPage = () => {
  const { data, loading, error, refreshData } = useDashboard();
  
  if (error) return <DashboardErrorState error={error} onRetry={refreshData} />;
  if (loading) return <HomeDashboardSkeletonLoader />;
  
  return <DashboardContent data={data} />;
};
```

### **2. Control de Tienda**
```tsx
const GreetingSection = () => {
  const { isStoreOpen, handleToggleStore } = useDashboard();
  
  return (
    <div className="flex items-center justify-between">
      <h2>Guten Tag!</h2>
      <Toggle 
        checked={isStoreOpen}
        onCheckedChange={handleToggleStore}
      />
    </div>
  );
};
```

### **3. Búsqueda Centralizada**
```tsx
const SearchBar = () => {
  const { 
    searchQuery, 
    searchResults, 
    isSearching,
    setSearchQuery,
    handleSearch 
  } = useDashboard();
  
  return (
    <div>
      <SearchInput 
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={handleSearch}
        loading={isSearching}
      />
      
      {searchResults.length > 0 && (
        <SearchResults results={searchResults} />
      )}
    </div>
  );
};
```

### **4. Navegación de Slider**
```tsx
const QuickAccessSlider = () => {
  const { 
    data, 
    currentSlideIndex, 
    setCurrentSlideIndex 
  } = useDashboard();
  
  return (
    <Slider 
      items={data?.quickAccess.items || []}
      currentSlide={currentSlideIndex}
      onSlideChange={setCurrentSlideIndex}
    />
  );
};
```

## 🔄 Lógica Interna del Hook

### **Estado Inicial**
```tsx
const initialState: DashboardData = {
  store: {
    name: "Mein Laden",
    isOpen: true,
    lastSale: "vor 5 Minuten",
    totalToday: 1580
  },
  todayStats: {
    sales: { count: 23, amount: 1580, trend: 'up' },
    customers: { count: 18, unique: 16, trend: 'up' }
  },
  dailyGoal: {
    currentAmount: 1580,
    goalAmount: 2000,
    percentage: 79
  },
  recentSales: mockSales,
  quickAccess: {
    items: mockQuickAccessItems,
    currentSlide: 0
  }
};
```

### **Funciones API Ready**
```tsx
// Preparadas para backend real
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Mock implementation - cambiar por API real
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockDashboardData;
};

const updateStoreStatus = async (isOpen: boolean): Promise<void> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Store status updated:', isOpen);
};

const searchData = async (query: string): Promise<any[]> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockSearchResults.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
};
```

### **Error Handling**
```tsx
const useDashboard = () => {
  const [error, setError] = useState<string | null>(null);
  
  const handleError = (error: any) => {
    console.error('Dashboard error:', error);
    setError(error.message || 'Ein Fehler ist aufgetreten');
  };
  
  const refreshData = async () => {
    try {
      setError(null);
      setLoading(true);
      const newData = await fetchDashboardData();
      setData(newData);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return { error, refreshData, /* ... */ };
};
```

## 📱 Optimizaciones Mobile

### **Debounced Search**
```tsx
const useDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce search para evitar muchas llamadas
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) return;
      
      setIsSearching(true);
      try {
        const results = await searchData(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);
  
  return { searchQuery, isSearching, handleSearch };
};
```

### **Performance Optimizations**
```tsx
// Memoización para evitar re-renders innecesarios
const memoizedData = useMemo(() => data, [data]);
const memoizedActions = useMemo(() => ({
  handleToggleStore,
  handleSearch,
  setCurrentSlideIndex,
  refreshData
}), [handleToggleStore, handleSearch, setCurrentSlideIndex, refreshData]);

// Callbacks estables
const handleToggleStore = useCallback(async () => {
  const newStatus = !isStoreOpen;
  setIsStoreOpen(newStatus);
  
  try {
    await updateStoreStatus(newStatus);
  } catch (error) {
    // Revert en caso de error
    setIsStoreOpen(!newStatus);
    handleError(error);
  }
}, [isStoreOpen]);
```

## 🔌 Integración con Backend

### **API Functions Ready**
```tsx
// Cambiar estas implementaciones por calls a API real:

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};

const updateStoreStatus = async (isOpen: boolean): Promise<void> => {
  const response = await fetch(`${API_BASE}/store/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isOpen })
  });
  if (!response.ok) throw new Error('Failed to update store status');
};

const searchData = async (query: string): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
};
```

### **Real-time Updates**
```tsx
// Preparado para WebSocket connections
const useDashboard = () => {
  useEffect(() => {
    // WebSocket para actualizaciones en tiempo real
    const ws = new WebSocket(`${WS_URL}/dashboard`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.type) {
        case 'NEW_SALE':
          // Actualizar ventas recientes
          setData(prev => ({
            ...prev,
            recentSales: [update.sale, ...prev.recentSales.slice(0, 4)]
          }));
          break;
          
        case 'STATS_UPDATE':
          // Actualizar estadísticas
          setData(prev => ({
            ...prev,
            todayStats: update.stats
          }));
          break;
      }
    };
    
    return () => ws.close();
  }, []);
};
```

## 🚀 Próximas Funcionalidades

### **Hooks Especializados Planeados**
- **useSales**: Hook específico para gestión de ventas
- **useProducts**: Gestión de productos e inventario  
- **useCustomers**: Base de datos de clientes
- **useAnalytics**: Métricas y analytics avanzados
- **useNotifications**: Sistema de notificaciones

### **Mejoras de Performance**
- **React Query**: Caching inteligente de datos
- **Optimistic Updates**: Updates inmediatos con rollback
- **Background Sync**: Sincronización en background
- **Offline Support**: Funcionalidad sin conexión

### **Real-time Features**
- **Live Updates**: Nuevas ventas en tiempo real
- **Collaborative Editing**: Múltiples usuarios
- **Push Notifications**: Notificaciones instantáneas

---

**Los hooks centralizados proporcionan estado predecible y lógica reutilizable** 🎣 