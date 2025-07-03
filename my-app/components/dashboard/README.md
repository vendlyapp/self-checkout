# 📊 Dashboard Components - Arquitectura Modular

**Sistema de componentes dashboard organizado por responsabilidades**  
Estructura profesional mobile-first para aplicaciones Self-Checkout.

## 🏗️ Arquitectura Modular

```
components/dashboard/
├── 📁 home/                          # 🏠 Dashboard Principal
│   ├── GreetingSection.tsx          # Saludo + toggle tienda  
│   ├── MainActionCards.tsx          # Kassieren + Produkte
│   ├── ActionCard.tsx               # Card de acción reutilizable
│   ├── TodayStatsCard.tsx           # Estadísticas del día
│   ├── DailyGoalCard.tsx            # Objetivo diario
│   ├── QuickAccessSlider.tsx        # Slider acceso rápido
│   ├── StatCard.tsx                 # Card estadística reutilizable
│   ├── SearchResultsSection.tsx     # Resultados de búsqueda
│   └── index.ts                     # Barrel exports
├── 📁 sale/                          # 💰 Ventas
│   ├── RecentSalesSection.tsx       # Sección ventas recientes
│   ├── SaleCard.tsx                 # Card individual de venta
│   ├── SalesMain.tsx                # Wrapper legacy
│   └── index.ts                     # Barrel exports
├── 📁 analytics/                     # 📈 Analytics (Sistema completo)
│   ├── AnalyticsDashboard.tsx       # Dashboard analytics principal
│   ├── SalesChart.tsx               # Gráficos con Recharts
│   ├── PaymentMethods.tsx           # Métodos de pago
│   ├── ActiveCustomers.tsx          # Clientes activos
│   ├── CartGauge.tsx                # Gauge carrito promedio
│   ├── QuickAccessGrid.tsx          # Grid acceso rápido
│   ├── types.ts                     # Tipos TypeScript
│   ├── 📁 data/                     # Mock data para desarrollo
│   ├── 📁 hooks/                    # Hooks especializados
│   └── index.ts                     # Barrel exports
├── 📁 skeletons/                     # 💀 Loading States
│   ├── 📁 common/                   # Componentes base
│   ├── 📁 home/                     # Skeletons dashboard home
│   ├── 📁 sale/                     # Skeletons ventas
│   ├── 📁 analytics/                # Skeletons analytics
│   └── index.tsx                    # Barrel exports
├── 📁 hooks/                         # 🎣 Hooks Centralizados
│   ├── useDashboard.tsx             # Hook principal dashboard
│   └── index.ts                     # Barrel exports
├── index.ts                         # Exports principales
├── types.ts                         # Tipos centralizados
└── README.md                        # Esta documentación
```

## 🎯 Beneficios de la Arquitectura

### **🔧 Organización por Responsabilidad**
- **`home/`**: Todo lo relacionado con dashboard principal
- **`sale/`**: Componentes específicos de ventas
- **`analytics/`**: Sistema completo de analytics y métricas
- **`skeletons/`**: Estados de carga organizados por sección
- **`hooks/`**: Lógica de estado centralizada

### **📱 Mobile-First Optimizado**
- ✅ **Touch targets**: Mínimo 44px para accesibilidad
- ✅ **Gestures**: Swipe horizontal, tap feedback
- ✅ **Responsive**: Layout 2 columnas adaptativo
- ✅ **Performance**: Lazy loading, minimal re-renders

### **🚀 Mantenibilidad**
- ✅ **Separación clara** de responsabilidades
- ✅ **Imports específicos** evitando conflictos
- ✅ **Barrel exports** para facilitar importaciones
- ✅ **Estructura escalable** para nuevas secciones

## 📦 Cómo Usar los Componentes

### **Importaciones por Sección**
```tsx
// Dashboard Home components
import { 
  GreetingSection, 
  MainActionCards, 
  DailyGoalCard,
  QuickAccessSlider
} from '@/components/dashboard/home';

// Sales components
import { 
  RecentSalesSection, 
  SaleCard 
} from '@/components/dashboard/sale';

// Analytics components
import { 
  AnalyticsDashboard, 
  SalesChart,
  PaymentMethods
} from '@/components/dashboard/analytics';

// Skeleton loaders por sección
import { 
  HomeDashboardSkeletonLoader,
  RecentSalesSkeletonLoader,
  AnalyticsSkeletonLoader
} from '@/components/dashboard/skeletons';

// Hooks centralizados
import { useDashboard } from '@/components/dashboard/hooks';
```

### **Importaciones Legacy (Compatibilidad)**
```tsx
// Todas estas importaciones SIGUEN funcionando:
import { 
  GreetingSection,
  MainActionCards,
  RecentSalesSection,
  AnalyticsDashboard,
  DashboardSkeletonLoader,
  useDashboard
} from '@/components/dashboard';
```

## 🏠 Sección Home - Dashboard Principal

### **Componentes Principales**

#### `GreetingSection`
```tsx
interface GreetingProps {
  isStoreOpen: boolean;
  onToggleStore: () => void;
}
```
- Saludo personalizado con fecha/hora
- Toggle animado de estado de tienda
- Información contextual (online/offline)

#### `MainActionCards`
```tsx
// No recibe props - usa hook interno
```
- Card primario: "Kassieren" (Self-checkout)
- Card secundario: "Produkte" (Gestión productos)
- Animaciones touch, navegación interna

#### `DailyGoalCard`
```tsx
interface DailyGoalProps {
  currentAmount: number;
  goalAmount: number;
  percentage: number;
}
```
- Gráfico circular SVG animado
- Progreso hacia objetivo diario
- Cálculo automático de porcentajes

#### `QuickAccessSlider`
```tsx
interface QuickAccessProps {
  items: QuickAccessItem[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}
```
- Swipe horizontal nativo
- Indicadores de página
- Touch gestures optimizados

### **Componentes Reutilizables**

#### `ActionCard`
```tsx
interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  isPrimary?: boolean;
  onClick: () => void;
}
```

#### `StatCard`
```tsx
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  amount: string;
  count: string;
  trend?: 'up' | 'down';
  isDark?: boolean;
}
```

## 💰 Sección Sale - Ventas

### **Componentes de Ventas**

#### `RecentSalesSection`
- Lista de ventas recientes
- Navegación a detalle de venta
- Estados de carga específicos

#### `SaleCard`
```tsx
interface SaleCardProps {
  sale: {
    id: string;
    customer: string;
    amount: number;
    time: string;
    items: number;
  };
}
```
- Card individual de venta
- Información resumida
- Click para expandir detalles

## 📈 Sección Analytics

**[Ver documentación completa](./analytics/README.md)**

Sistema completo de analytics con:
- Dashboard especializado
- Gráficos con Recharts
- Métricas en tiempo real
- Hooks personalizados
- Datos mock preparados para backend

## 💀 Sistema de Skeleton Loaders

### **Por Sección**
```tsx
// Home dashboard loading
<HomeDashboardSkeletonLoader />

// Sales section loading  
<SalesSectionSkeletonLoader />

// Analytics loading
<AnalyticsSkeletonLoader />

// Complete dashboard loading
<DashboardSkeletonLoader />
```

### **Estados de Error**
```tsx
<DashboardErrorState 
  error="Error al cargar datos"
  onRetry={() => window.location.reload()}
/>
```

### **Características**
- ✅ **Estructura idéntica** al contenido real
- ✅ **Animaciones suaves** con `animate-pulse`
- ✅ **Responsive** para diferentes tamaños
- ✅ **Accesible** con ARIA labels

## 🎣 Hooks Centralizados

### **useDashboard Hook**
```tsx
const {
  // Data & Loading
  data,                    // DashboardData | null
  loading,                 // boolean
  error,                   // string | null
  
  // Store State
  isStoreOpen,            // boolean
  handleToggleStore,      // () => void
  
  // Search
  searchQuery,            // string
  searchResults,          // any[]
  isSearching,            // boolean
  setSearchQuery,         // (query: string) => void
  handleSearch,           // (query: string) => Promise<void>
  
  // Slider
  currentSlideIndex,      // number
  setCurrentSlideIndex,   // (index: number) => void
  
  // Actions
  refreshData             // () => Promise<void>
} = useDashboard();
```

### **Uso en Páginas**
```tsx
export default function DashboardPage() {
  const { data, loading, error, refreshData } = useDashboard();
  
  if (error) {
    return <DashboardErrorState error={error} onRetry={refreshData} />;
  }
  
  if (loading || !data) {
    return <DashboardSkeletonLoader />;
  }
  
  return (
    <div className="px-4 pt-2 pb-4 min-h-screen bg-background">
      <GreetingSection 
        isStoreOpen={data.isStoreOpen}
        onToggleStore={handleToggleStore}
      />
      <MainActionCards />
      <DailyGoalCard {...data.dailyGoal} />
      {/* ... resto de componentes */}
    </div>
  );
}
```

## 🎨 Sistema de Diseño

### **Estilos de globals.css**
```css
/* Clases principales utilizadas */
.transition-fast        /* 150ms ease-out */
.tap-highlight-transparent  /* Sin highlight en móvil */
.animate-pulse         /* Animación skeleton */
.bg-background-cream   /* Fondo personalizado */
.border-border/50      /* Bordes semitransparentes */
```

### **Paleta de Colores Dashboard**
```css
/* Colores específicos */
--primary: #22C55F;           /* Verde principal */
--background: #F2EDE8;        /* Crema dashboard */
--card: #FFFFFF;              /* Fondo cards */
--muted: #E5E7EB;            /* Skeletons */
--border: #D1D5DB;           /* Bordes sutiles */
```

### **Espaciado Mobile**
```css
mb-6     /* 24px - Entre secciones principales */
gap-3    /* 12px - Entre elementos grid */
p-4      /* 16px - Padding estándar */
p-5      /* 20px - Padding cards importantes */
```

## 🚀 Próximos Pasos

### **Nuevas Secciones Sugeridas**
```
dashboard/
├── products/          # Gestión de productos
├── customers/         # Base de clientes
├── settings/          # Configuración tienda
├── reports/           # Reportes avanzados
└── notifications/     # Centro de notificaciones
```

### **Mejoras de Performance**
- Code splitting por sección
- Lazy loading de componentes grandes
- Memoización inteligente
- Service Workers para caching

### **Testing & Quality**
- Unit tests por componente
- Integration tests por sección
- Storybook para documentación visual
- E2E tests con Playwright

## ✅ Estado Actual

### **Funcionalidad Completa**
- ✅ **Compilación exitosa** (`npm run build`)
- ✅ **Estructura modular** implementada
- ✅ **Skeleton loaders** funcionando
- ✅ **Hooks centralizados** operativos
- ✅ **Compatibilidad** hacia atrás mantenida

### **Performance**
- ✅ **Mobile-first** optimizado
- ✅ **Loading states** profesionales
- ✅ **Error handling** robusto
- ✅ **Touch interactions** implementadas

---

**La arquitectura modular del dashboard está lista para escalar y mantener** 🚀 