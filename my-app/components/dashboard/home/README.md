# 🏠 Dashboard Home Components

**Componentes del dashboard principal optimizados para móvil**  
Sección central de la experiencia del comerciante en Vendly Self-Checkout.

## 📋 Componentes Disponibles

```
home/
├── GreetingSection.tsx          # Saludo personalizado + toggle tienda
├── MainActionCards.tsx          # Acciones principales (Kassieren + Produkte)
├── ActionCard.tsx               # Card de acción reutilizable
├── TodayStatsCard.tsx           # Estadísticas del día
├── DailyGoalCard.tsx            # Objetivo diario con progreso
├── QuickAccessSlider.tsx        # Slider de acceso rápido
├── StatCard.tsx                 # Card de estadística reutilizable
├── SearchResultsSection.tsx     # Resultados de búsqueda
└── index.ts                     # Barrel exports
```

## 🎯 Componentes Principales

### **GreetingSection**
**Saludo personalizado con control de tienda**

```tsx
interface GreetingProps {
  isStoreOpen: boolean;
  onToggleStore: () => void;
}

<GreetingSection 
  isStoreOpen={true}
  onToggleStore={() => setStoreOpen(!storeOpen)}
/>
```

**Características:**
- ✅ Saludo personalizado por hora del día
- ✅ Toggle animado online/offline de tienda
- ✅ Información contextual (fecha, clima)
- ✅ Indicador visual de estado

---

### **MainActionCards**
**Acciones principales del dashboard**

```tsx
// No recibe props - usa estado interno
<MainActionCards />
```

**Acciones incluidas:**
- **Kassieren** (Primary): Ir a self-checkout
- **Produkte** (Secondary): Gestión de productos

**Características:**
- ✅ Diseño 2 columnas mobile-optimizado
- ✅ Animaciones touch con feedback
- ✅ Navegación automática a rutas
- ✅ Iconos contextuales

---

### **DailyGoalCard**
**Progreso hacia objetivo diario**

```tsx
interface DailyGoalProps {
  currentAmount: number;    // Monto actual (ej: 1580)
  goalAmount: number;       // Meta (ej: 2000)
  percentage: number;       // Porcentaje calculado (ej: 79)
}

<DailyGoalCard 
  currentAmount={1580}
  goalAmount={2000}
  percentage={79}
/>
```

**Características:**
- ✅ Gráfico circular SVG animado
- ✅ Cálculo automático de progreso
- ✅ Formato de moneda europeo (€)
- ✅ Animación de entrada suave

---

### **QuickAccessSlider**
**Slider horizontal con gestures**

```tsx
interface QuickAccessProps {
  items: QuickAccessItem[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

const quickItems = [
  { id: '1', icon: '📊', label: 'Analytics', action: () => {} },
  { id: '2', icon: '👥', label: 'Kunden', action: () => {} },
  // ...
];

<QuickAccessSlider 
  items={quickItems}
  currentSlide={0}
  onSlideChange={setCurrentSlide}
/>
```

**Características:**
- ✅ Swipe horizontal nativo
- ✅ Indicadores de página
- ✅ Touch targets optimizados (44px+)
- ✅ Auto-paginación inteligente

---

### **TodayStatsCard**
**Estadísticas del día actual**

```tsx
// No recibe props - usa hook useDashboard
<TodayStatsCard />
```

**Métricas mostradas:**
- **Verkäufe**: Número de ventas + trend
- **Kunden**: Clientes únicos + cambio

**Características:**
- ✅ Layout 2 columnas responsive
- ✅ Iconos contextuales
- ✅ Indicadores de tendencia
- ✅ Datos del hook centralizado

## 🧩 Componentes Reutilizables

### **ActionCard**
**Card genérico para acciones**

```tsx
interface ActionCardProps {
  icon: React.ReactNode;      // Icono del card
  title: string;              // Título principal
  subtitle: string;           // Descripción
  isPrimary?: boolean;        // Estilo primario/secundario
  onClick: () => void;        // Acción al hacer click
}

<ActionCard 
  icon={<CreditCard className="w-8 h-8" />}
  title="Kassieren"
  subtitle="Self-Checkout starten"
  isPrimary={true}
  onClick={() => router.push('/checkout')}
/>
```

**Variantes:**
- **Primary**: Fondo verde, destacado
- **Secondary**: Fondo blanco, estándar

---

### **StatCard**
**Card de estadística reutilizable**

```tsx
interface StatCardProps {
  icon: React.ReactNode;      // Icono de la métrica
  label: string;              // Etiqueta (ej: "Verkäufe")
  amount: string;             // Valor principal (ej: "€1,580")
  count: string;              // Contador (ej: "23 heute")
  trend?: 'up' | 'down';     // Tendencia opcional
  isDark?: boolean;           // Variante oscura
}

<StatCard 
  icon={<TrendingUp className="w-5 h-5" />}
  label="Verkäufe"
  amount="€1,580"
  count="23 heute"
  trend="up"
  isDark={false}
/>
```

**Características:**
- ✅ Variantes clara/oscura
- ✅ Indicadores de tendencia
- ✅ Formato consistente
- ✅ Responsive design

## 📱 Optimizaciones Mobile

### **Touch Interactions**
```css
/* Todos los componentes incluyen: */
tap-highlight-transparent    /* Sin highlight azul */
transition-fast             /* Animaciones 150ms */
min-height: 44px            /* Touch targets mínimos */
```

### **Responsive Design**
```css
/* Layout principal */
grid-cols-2                 /* 2 columnas en mobile */
gap-3                       /* 12px entre elementos */
px-4                        /* 16px padding horizontal */
```

### **Animaciones**
- **Scale on touch**: Feedback inmediato
- **Smooth transitions**: Entre estados
- **Loading states**: Skeleton loaders específicos

## 🎨 Sistema de Estilos

### **Colores Específicos**
```css
/* Home section colors */
bg-primary/10              /* Fondo card primario */
bg-card                    /* Fondo cards secundarios */
text-gray-900              /* Texto principal */
text-gray-600              /* Texto secundario */
border-border/50           /* Bordes sutiles */
```

### **Espaciado Consistente**
```css
mb-6                       /* 24px entre secciones */
p-5                        /* 20px padding cards principales */
p-4                        /* 16px padding cards secundarios */
gap-3                      /* 12px entre elementos grid */
```

## 🔧 Uso en Páginas

### **Dashboard Principal**
```tsx
import { 
  GreetingSection,
  MainActionCards,
  DailyGoalCard,
  QuickAccessSlider,
  TodayStatsCard
} from '@/components/dashboard/home';

export default function DashboardPage() {
  const { data, isStoreOpen, handleToggleStore } = useDashboard();
  
  return (
    <div className="px-4 pt-2 pb-4">
      <GreetingSection 
        isStoreOpen={isStoreOpen}
        onToggleStore={handleToggleStore}
      />
      <MainActionCards />
      <TodayStatsCard />
      <DailyGoalCard {...data.dailyGoal} />
      <QuickAccessSlider {...data.quickAccess} />
    </div>
  );
}
```

### **Skeleton Loading**
```tsx
import { HomeDashboardSkeletonLoader } from '@/components/dashboard/skeletons';

if (loading) return <HomeDashboardSkeletonLoader />;
```

## 🚀 Próximas Funcionalidades

### **Componentes Planeados**
- **WeatherWidget**: Información del clima
- **NotificationBell**: Centro de notificaciones
- **StoreHoursCard**: Gestión de horarios
- **PromotionsBanner**: Promociones activas

### **Mejoras UX**
- **Haptic feedback**: Vibraciones contextuales
- **Voice commands**: Comandos de voz
- **Gesture shortcuts**: Gestos avanzados
- **Offline support**: Funcionalidad sin internet

### **Analytics Integration**
- **Heat maps**: Zonas más tocadas
- **Usage patterns**: Patrones de uso
- **Performance metrics**: Métricas de rendimiento

---

**Los componentes home están optimizados para la experiencia diaria del comerciante** 🏪 