# 💀 Dashboard Skeleton Loaders

**Sistema de loading states profesionales organizados por sección**  
Estados de carga que mejoran la UX durante la obtención de datos en Vendly Self-Checkout.

## 🏗️ Arquitectura por Secciones

```
skeletons/
├── 📁 common/                       # 🔧 Componentes base
│   └── SkeletonBase.tsx            # Componente base reutilizable
├── 📁 home/                         # 🏠 Skeletons dashboard home
│   └── index.tsx                   # Todos los skeletons de home
├── 📁 sale/                         # 💰 Skeletons ventas
│   └── index.tsx                   # Skeletons de componentes sale
├── 📁 analytics/                    # 📊 Skeletons analytics
│   └── index.tsx                   # Skeletons avanzados analytics
└── index.tsx                       # Barrel exports organizados
```

## 🎯 Filosofía de Diseño

### **Principios Fundamentales**
- ✅ **Estructura idéntica** al contenido real
- ✅ **Animaciones suaves** con `animate-pulse`
- ✅ **Responsive design** que se adapta a mobile
- ✅ **Performance optimizada** con minimal DOM
- ✅ **Accesibilidad** con ARIA labels apropiados

### **Mobile-First Approach**
- **Touch targets**: Skeletons de mínimo 44px
- **Spacing consistente**: Mismo `gap-3`, `mb-6`, `p-4`
- **Bordes redondeados**: `rounded-xl`, `rounded-2xl`
- **Colores optimizados**: `bg-muted` con `animate-pulse`

## 🔧 Componente Base

### **SkeletonBase**
**Componente base reutilizable para todos los skeletons**

```tsx
// Ubicación: skeletons/common/SkeletonBase.tsx

interface SkeletonBaseProps {
  className?: string;
  children?: React.ReactNode;
}

const SkeletonBase: React.FC<SkeletonBaseProps> = ({ 
  className = "", 
  children 
}) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
);
```

**Uso:**
```tsx
<SkeletonBase className="mb-6">
  <div className="h-4 bg-muted rounded w-32"></div>
  <div className="h-6 bg-muted rounded w-48 mt-2"></div>
</SkeletonBase>
```

**Características:**
- ✅ **Animación consistente** con `animate-pulse`
- ✅ **Composición flexible** con children
- ✅ **Clases personalizables** via props
- ✅ **Performance optimizada** con minimal re-renders

## 🏠 Home Dashboard Skeletons

### **Skeletons Disponibles**
```tsx
// Importación desde skeletons/home/
import { 
  GreetingSkeletonLoader,
  MainActionCardsSkeletonLoader,
  SearchSkeletonLoader,
  TodayStatsSkeletonLoader,
  DailyGoalSkeletonLoader,
  QuickAccessSkeletonLoader,
  HomeDashboardSkeletonLoader,  // Skeleton completo
  DashboardErrorState           // Estado de error
} from '@/components/dashboard/skeletons/home';
```

### **Ejemplo: GreetingSkeletonLoader**
```tsx
export const GreetingSkeletonLoader: React.FC = () => (
  <SkeletonBase className="mb-6">
    <div className="bg-card rounded-2xl p-5 border border-border/50">
      {/* Header con saludo */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded-lg w-32"></div>  {/* "Guten Tag" */}
          <div className="h-4 bg-muted rounded w-24"></div>     {/* Fecha */}
        </div>
        <div className="w-16 h-8 bg-muted rounded-full"></div> {/* Toggle */}
      </div>
      
      {/* Status info */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-muted rounded-full"></div>  {/* Indicator */}
        <div className="h-4 bg-muted rounded w-20"></div>      {/* Status text */}
        <div className="h-4 bg-muted rounded w-16"></div>      {/* Time */}
      </div>
    </div>
  </SkeletonBase>
);
```

### **Skeleton Completo del Home**
```tsx
export const HomeDashboardSkeletonLoader: React.FC = () => (
  <div className="px-4 pt-2 pb-4 min-h-screen bg-background">
    <GreetingSkeletonLoader />
    <MainActionCardsSkeletonLoader />
    <SearchSkeletonLoader />
    <TodayStatsSkeletonLoader />
    <DailyGoalSkeletonLoader />
    <QuickAccessSkeletonLoader />
  </div>
);
```

## 💰 Sale Component Skeletons

### **Skeletons de Ventas**
```tsx
// Importación desde skeletons/sale/
import { 
  RecentSalesSkeletonLoader,
  SaleCardSkeletonLoader,
  SalesSectionSkeletonLoader
} from '@/components/dashboard/skeletons/sale';
```

### **Ejemplo: SaleCardSkeletonLoader**
```tsx
export const SaleCardSkeletonLoader: React.FC = () => (
  <div className="bg-card rounded-xl p-4 border border-border/50">
    <div className="flex items-center justify-between">
      {/* Left side: Avatar + info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-muted rounded-full"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24"></div>  {/* Customer name */}
          <div className="h-3 bg-muted rounded w-20"></div>  {/* Items count */}
        </div>
      </div>
      
      {/* Right side: Amount + time */}
      <div className="text-right space-y-2">
        <div className="h-4 bg-muted rounded w-16"></div>    {/* Amount */}
        <div className="h-3 bg-muted rounded w-12"></div>    {/* Time */}
      </div>
    </div>
  </div>
);
```

## 📊 Analytics Skeletons

### **Skeletons Avanzados**
Los skeletons de analytics ya están implementados en el sistema anterior. Incluyen:

- **AnalyticsSkeletonLoader**: Dashboard completo de analytics
- **SalesChartSkeletonLoader**: Gráficos de Recharts
- **PaymentMethodsSkeletonLoader**: Métodos de pago
- **ActiveCustomersSkeletonLoader**: Clientes activos

## 🎨 Sistema de Estilos

### **Colores de Skeleton**
```css
/* Colores base para skeletons */
bg-muted             /* #E5E7EB - Color principal skeleton */
bg-card              /* #FFFFFF - Fondo de containers */
border-border/50     /* Bordes semitransparentes */
```

### **Animaciones**
```css
/* Animación principal */
animate-pulse        /* Animación de Tailwind optimizada */

/* Para elementos específicos */
.skeleton-shimmer {
  background: linear-gradient(
    90deg, 
    transparent, 
    rgba(255,255,255,0.4), 
    transparent
  );
  animation: shimmer 1.5s infinite;
}
```

### **Espaciado Consistente**
```css
/* Mismo spacing que componentes reales */
mb-6                 /* 24px entre secciones */
p-4, p-5             /* Padding de cards */
gap-3                /* 12px entre elementos */
space-y-2, space-y-3 /* Espaciado vertical */
```

## 🔧 Uso en Páginas

### **Implementación Básica**
```tsx
import { 
  HomeDashboardSkeletonLoader,
  DashboardErrorState 
} from '@/components/dashboard/skeletons';

export default function DashboardPage() {
  const { data, loading, error, refreshData } = useDashboard();
  
  // Estado de error con retry
  if (error) {
    return (
      <DashboardErrorState 
        error={error} 
        onRetry={refreshData} 
      />
    );
  }
  
  // Estado de loading
  if (loading || !data) {
    return <HomeDashboardSkeletonLoader />;
  }
  
  // Contenido real
  return (
    <div className="px-4 pt-2 pb-4">
      {/* Componentes reales */}
    </div>
  );
}
```

### **Skeleton por Sección**
```tsx
// Loading granular por sección
const DashboardPage = () => {
  const { salesData, statsData, goalData, loading } = useDashboard();
  
  return (
    <div className="px-4 pt-2 pb-4">
      <GreetingSection />
      
      {loading.stats ? (
        <TodayStatsSkeletonLoader />
      ) : (
        <TodayStatsCard data={statsData} />
      )}
      
      {loading.sales ? (
        <RecentSalesSkeletonLoader />
      ) : (
        <RecentSalesSection data={salesData} />
      )}
    </div>
  );
};
```

## ❌ Estado de Error

### **DashboardErrorState**
**Componente para manejar errores con retry**

```tsx
interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

<DashboardErrorState 
  error="No se pudieron cargar los datos"
  onRetry={() => window.location.reload()}
/>
```

**Características:**
- ✅ **Icono de error** descriptivo
- ✅ **Mensaje claro** en alemán/español
- ✅ **Botón de reintento** prominente
- ✅ **Design consistente** con el sistema

**Estructura:**
```tsx
<div className="px-4 pt-8 pb-4 min-h-screen bg-background">
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {/* Error icon */}
    <div className="w-16 h-16 bg-red-100 rounded-full mb-4">
      <AlertTriangle className="w-8 h-8 text-red-500" />
    </div>
    
    {/* Error message */}
    <div className="text-destructive text-lg font-semibold mb-2">
      Fehler beim Laden
    </div>
    <p className="text-muted-foreground mb-6 max-w-sm">
      {error}
    </p>
    
    {/* Retry button */}
    <button 
      onClick={onRetry}
      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-fast tap-highlight-transparent font-medium"
    >
      Erneut versuchen
    </button>
  </div>
</div>
```

## 📋 Exports Organizados

### **Imports por Sección**
```tsx
// Por sección específica
import { HomeDashboardSkeletonLoader } from '@/components/dashboard/skeletons/home';
import { RecentSalesSkeletonLoader } from '@/components/dashboard/skeletons/sale';
import { AnalyticsSkeletonLoader } from '@/components/dashboard/skeletons/analytics';

// Desde el index principal (recomendado)
import { 
  HomeDashboardSkeletonLoader,
  RecentSalesSkeletonLoader,
  DashboardErrorState
} from '@/components/dashboard/skeletons';

// Compatibilidad legacy
import { DashboardSkeletonLoader } from '@/components/dashboard/skeletons';
// Nota: DashboardSkeletonLoader = HomeDashboardSkeletonLoader
```

## 🚀 Mejores Prácticas

### **Timing de Skeleton**
```tsx
// Mostrar skeleton inmediatamente
const [showSkeleton, setShowSkeleton] = useState(true);
const [data, setData] = useState(null);

useEffect(() => {
  fetchData().then(result => {
    setData(result);
    setShowSkeleton(false);
  });
}, []);

// Evitar flashes, mínimo 300ms de skeleton
const minSkeletonTime = 300;
```

### **Performance**
- ✅ **Minimal DOM**: Solo elementos necesarios
- ✅ **CSS animations**: Preferir CSS sobre JS
- ✅ **Memoization**: React.memo para skeletons estáticos
- ✅ **Lazy loading**: No cargar skeletons no visibles

### **Accesibilidad**
```tsx
// ARIA labels para lectores de pantalla
<div 
  role="status" 
  aria-label="Cargando datos del dashboard"
  className="animate-pulse"
>
  {/* Skeleton content */}
</div>
```

---

**Los skeleton loaders mejoran significativamente la percepción de velocidad en mobile** ⚡ 