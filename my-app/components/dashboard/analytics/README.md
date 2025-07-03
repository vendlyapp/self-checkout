# Analytics Dashboard Components

Esta carpeta contiene todos los componentes relacionados con el dashboard de analytics, organizados de manera profesional y modular.

## 📁 Estructura de Archivos

```
analytics/
├── 📄 index.ts                    # Barrel exports principales
├── 📄 types.ts                    # Definiciones TypeScript
├── 📄 AnalyticsDashboard.tsx      # Componente principal
├── 📄 ActiveCustomers.tsx         # Clientes activos en tienda
├── 📄 SalesChart.tsx              # Gráfico de ventas
├── 📄 QuickAccessGrid.tsx         # Grid de acceso rápido
├── 📄 PaymentMethods.tsx          # Métodos de pago
├── 📄 CartGauge.tsx               # Gauge del carrito promedio
├── 📁 data/
│   ├── 📄 index.ts                # Barrel exports para datos
│   └── 📄 mockData.ts             # Datos mock (listos para backend)
├── 📁 hooks/
│   ├── 📄 index.ts                # Barrel exports para hooks
│   └── 📄 useAnalytics.ts         # Hook personalizado
└── 📄 README.md                   # Esta documentación
```

## 🚀 Uso Básico

### Importar el Dashboard Completo

```tsx
import { AnalyticsDashboard } from '@/components/dashboard/analytics';

export default function DashboardPage() {
  return <AnalyticsDashboard />;
}
```

### Importar Componentes Individuales

```tsx
import { 
  ActiveCustomers, 
  SalesChart, 
  useAnalytics 
} from '@/components/dashboard/analytics';

export default function CustomDashboard() {
  const { data, loading } = useAnalytics();
  
  return (
    <div className="space-y-5">
      <ActiveCustomers data={data?.shopActivity} loading={loading} />
      <SalesChart 
        data={data?.salesData || []}
        totalSales={12934}
        salesGrowth={8}
        period="woche"
        onPeriodChange={(period) => console.log(period)}
      />
    </div>
  );
}
```

## 🎯 Características Principales

### ✅ Optimizaciones Implementadas

- **🎨 Estilos**: Usa las clases CSS de `globals.css` para consistencia
- **♿ Accesibilidad**: Implementa ARIA labels, navegación por teclado
- **📱 Mobile-First**: Diseño responsive optimizado para móviles
- **⚡ Performance**: Estados de loading, transiciones suaves
- **🔄 Estado**: Hook personalizado `useAnalytics` para manejo centralizado
- **🎭 Animaciones**: Usa las clases de transición del sistema de diseño

### 🔧 Funcionalidades Técnicas

- **TypeScript**: Tipado completo con interfaces claras
- **Recharts**: Gráficos profesionales y responsivos
- **Estados de Loading**: Skeleton loaders consistentes
- **Error Handling**: Manejo robusto de errores
- **Memoización**: Optimización de renders con `useCallback`

## 📊 Componentes Disponibles

### `AnalyticsDashboard`
Componente principal que integra todos los subcomponentes.

**Props:**
- `className?: string` - Clases CSS adicionales

### `ActiveCustomers`
Muestra clientes activos en la tienda en tiempo real.

**Props:**
- `data: ShopActivity` - Datos de actividad de la tienda
- `loading?: boolean` - Estado de carga

### `SalesChart`
Gráfico de líneas con comparación de períodos.

**Props:**
- `data: SalesData[]` - Datos de ventas
- `totalSales: number` - Total de ventas
- `salesGrowth: number` - Crecimiento porcentual
- `period: TimePeriod` - Período actual
- `onPeriodChange: (period: TimePeriod) => void` - Callback cambio período
- `loading?: boolean` - Estado de carga

### `QuickAccessGrid`
Grid de acciones rápidas con iconos y callbacks.

**Props:**
- `onSalesAction: () => void` - Acción ver ventas
- `onCancelAction: () => void` - Acción cancelar venta
- `onReceiptsAction: () => void` - Acción ver recibos
- `onCartAction: () => void` - Acción ver carrito
- `loading?: boolean` - Estado de carga

### `PaymentMethods`
Gráfico de barras con métodos de pago.

**Props:**
- `data: PaymentMethod[]` - Datos de métodos de pago
- `period: TimePeriod` - Período actual
- `onPeriodChange: (period: TimePeriod) => void` - Callback cambio período
- `loading?: boolean` - Estado de carga

### `CartGauge`
Gauge radial para carrito promedio.

**Props:**
- `data: CartData` - Datos del carrito
- `period: TimePeriod` - Período actual
- `onPeriodChange: (period: TimePeriod) => void` - Callback cambio período
- `loading?: boolean` - Estado de carga

## 🎣 Hook Personalizado: `useAnalytics`

Hook centralizado para manejo de estado y datos de analytics.

```tsx
const {
  data,           // AnalyticsData | null
  loading,        // boolean
  error,          // string | null
  salesPeriod,    // TimePeriod
  paymentPeriod,  // TimePeriod
  cartPeriod,     // TimePeriod
  setSalesPeriod, // (period: TimePeriod) => void
  setPaymentPeriod, // (period: TimePeriod) => void
  setCartPeriod,  // (period: TimePeriod) => void
  refreshData,    // () => Promise<void>
  totalSales,     // number
  salesGrowth     // number
} = useAnalytics();
```

## 🔌 Integración con Backend

### Datos Mock Preparados

Los datos mock están estructurados para facilitar la migración a un backend real:

```tsx
// En data/mockData.ts
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAnalyticsData;
};

// Para integrar con API real, simplemente reemplaza:
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  const response = await fetch('/api/analytics');
  return response.json();
};
```

### Funciones API Preparadas

- `fetchAnalyticsData()` - Obtener todos los datos
- `fetchSalesData(period)` - Obtener datos de ventas
- `fetchPaymentMethods(period)` - Obtener métodos de pago

## 🎨 Estilos Aplicados de globals.css

### Clases Utilizadas:
- `transition-fast` - Transiciones rápidas (150ms)
- `transition-normal` - Transiciones normales (200ms)
- `tap-highlight-transparent` - Sin highlight en móvil
- Colores del sistema: `primary`, `muted`, `background`, etc.
- Estados responsive automáticos

### Ejemplo de Styling:

```tsx
<button className="group bg-card border border-border/50 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 tap-highlight-transparent">
```

## 🚀 Próximos Pasos

1. **Backend Integration**: Reemplazar funciones mock con APIs reales
2. **Websockets**: Agregar actualizaciones en tiempo real
3. **Filtros Avanzados**: Implementar filtros por fecha, tienda, etc.
4. **Exportación**: Agregar funcionalidad de exportar datos
5. **Notificaciones**: Sistema de alertas para métricas importantes

## 🔍 Testing

```bash
# Instalar dependencias necesarias
npm install recharts

# El dashboard debe funcionar inmediatamente:
# 1. Importar AnalyticsDashboard
# 2. Los datos mock se cargan automáticamente
# 3. Todas las interacciones funcionan
```

## 📝 Notas de Migración

- El componente anterior `TIenda.tsx` ahora es un wrapper deprecado
- Todos los tipos están definidos en `types.ts`
- Los datos mock están listos para backend real
- Accesibilidad implementada según estándares WCAG
- Mobile-first design siguiendo el sistema existente 