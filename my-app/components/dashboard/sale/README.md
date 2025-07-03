# 💰 Dashboard Sale Components

**Componentes especializados en gestión de ventas**  
Sección dedicada al seguimiento y análisis de transacciones en Vendly Self-Checkout.

## 📋 Componentes Disponibles

```
sale/
├── RecentSalesSection.tsx       # Lista de ventas recientes
├── SaleCard.tsx                 # Card individual de venta
├── SalesMain.tsx                # Wrapper legacy (deprecated)
└── index.ts                     # Barrel exports
```

## 🎯 Componentes Principales

### **RecentSalesSection**
**Lista de ventas recientes con navegación**

```tsx
// No recibe props - usa hook useDashboard interno
<RecentSalesSection />
```

**Características:**
- ✅ Lista de las últimas 5-10 ventas
- ✅ Header con título y link "Ver todas"
- ✅ Loading states específicos
- ✅ Navegación a página de ventas completa
- ✅ Scroll vertical optimizado para móvil

**Estructura:**
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h3>Letzte Verkäufe</h3>
    <Link href="/sales">Alle anzeigen</Link>
  </div>
  
  <div className="space-y-3">
    {sales.map(sale => (
      <SaleCard key={sale.id} sale={sale} />
    ))}
  </div>
</div>
```

---

### **SaleCard**
**Card individual para mostrar información de venta**

```tsx
interface SaleCardProps {
  sale: {
    id: string;              // ID único de la venta
    customer: string;        // Nombre del cliente o "Anónimo"
    amount: number;          // Monto total en euros
    time: string;           // Hora de la venta
    items: number;          // Número de artículos
    paymentMethod?: string; // Método de pago
    status?: 'completed' | 'pending' | 'failed';
  };
  onClick?: (sale: Sale) => void;  // Acción opcional al hacer click
}

<SaleCard 
  sale={{
    id: "sale_123",
    customer: "Maria González",
    amount: 45.30,
    time: "14:30",
    items: 3,
    paymentMethod: "card",
    status: "completed"
  }}
  onClick={(sale) => router.push(`/sales/${sale.id}`)}
/>
```

**Layout Móvil:**
```tsx
<div className="bg-card rounded-xl p-4 border border-border/50 tap-highlight-transparent">
  <div className="flex items-center justify-between">
    {/* Left side: Customer + items */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="font-medium text-gray-900">{customer}</div>
        <div className="text-sm text-gray-600">{items} Artikel</div>
      </div>
    </div>
    
    {/* Right side: Amount + time */}
    <div className="text-right">
      <div className="font-semibold text-gray-900">€{amount}</div>
      <div className="text-sm text-gray-600">{time}</div>
    </div>
  </div>
</div>
```

**Características:**
- ✅ **Design compacto**: Información esencial en una fila
- ✅ **Touch optimizado**: 44px+ altura mínima
- ✅ **Estados visuales**: Completado, pendiente, fallido
- ✅ **Métodos de pago**: Iconos contextuales
- ✅ **Click interaction**: Navegación a detalle

## 🎨 Estados Visuales

### **Estado de Venta**
```tsx
// Completed (default)
<div className="bg-card rounded-xl border-border/50">

// Pending
<div className="bg-yellow-50 rounded-xl border-yellow-200">

// Failed
<div className="bg-red-50 rounded-xl border-red-200">
```

### **Métodos de Pago**
```tsx
const PaymentIcon = ({ method }: { method: string }) => {
  switch (method) {
    case 'card':
      return <CreditCard className="w-4 h-4 text-blue-500" />;
    case 'cash':
      return <Banknote className="w-4 h-4 text-green-500" />;
    case 'qr':
      return <QrCode className="w-4 h-4 text-purple-500" />;
    default:
      return <Wallet className="w-4 h-4 text-gray-500" />;
  }
};
```

## 📱 Optimizaciones Mobile

### **Touch Interactions**
```css
/* Cards responsivos al touch */
.sale-card {
  @apply tap-highlight-transparent;
  @apply transition-fast;
  @apply active:scale-[0.98];
  @apply hover:bg-gray-50;
}
```

### **Layout Responsive**
- **Máximo 3-4 ventas** visibles sin scroll
- **Scroll suave** para lista completa
- **Pull-to-refresh** para actualizar datos
- **Skeleton loaders** mientras carga

### **Información Priorizada**
1. **Cliente**: Nombre o "Anónimo"
2. **Monto**: Cantidad en €
3. **Hora**: Timestamp legible
4. **Items**: Número de productos
5. **Método**: Icono de pago

## 🔧 Integración con Hooks

### **Uso con useDashboard**
```tsx
import { useDashboard } from '@/components/dashboard/hooks';

const RecentSalesSection: React.FC = () => {
  const { data, loading } = useDashboard();
  
  if (loading) return <RecentSalesSkeletonLoader />;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Letzte Verkäufe</h3>
        <Link 
          href="/dashboard/sales" 
          className="text-primary text-sm font-medium"
        >
          Alle anzeigen
        </Link>
      </div>
      
      <div className="space-y-3">
        {data?.recentSales?.map(sale => (
          <SaleCard 
            key={sale.id} 
            sale={sale}
            onClick={(sale) => console.log('Ver venta:', sale.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### **Mock Data Structure**
```typescript
interface Sale {
  id: string;
  customer: string;
  amount: number;
  time: string;
  items: number;
  paymentMethod: 'card' | 'cash' | 'qr' | 'other';
  status: 'completed' | 'pending' | 'failed';
  products?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const mockSales: Sale[] = [
  {
    id: "sale_001",
    customer: "Maria González",
    amount: 45.30,
    time: "14:30",
    items: 3,
    paymentMethod: "card",
    status: "completed"
  },
  // ...
];
```

## 💀 Skeleton Loaders

### **RecentSalesSkeletonLoader**
```tsx
// Ubicado en: skeletons/sale/index.tsx
<RecentSalesSkeletonLoader />
```

**Estructura del skeleton:**
- Header con título y link simulados
- 3-4 cards con estructura idéntica a SaleCard
- Animación pulse sincronizada

```tsx
export const RecentSalesSkeletonLoader: React.FC = () => (
  <SkeletonBase className="space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="h-5 bg-muted rounded w-32"></div>
      <div className="h-4 bg-muted rounded w-16"></div>
    </div>
    
    {/* Sales list */}
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <SaleCardSkeletonLoader key={idx} />
      ))}
    </div>
  </SkeletonBase>
);
```

## 🚀 Próximas Funcionalidades

### **Componentes Planeados**
- **SaleDetailModal**: Modal con detalle completo
- **SaleFilters**: Filtros por fecha, método, monto
- **SaleSearchBar**: Búsqueda por cliente/ID
- **SaleExport**: Exportar ventas a CSV/PDF

### **Mejoras UX**
- **Infinite scroll**: Carga progresiva
- **Real-time updates**: Nuevas ventas en tiempo real
- **Batch actions**: Selección múltiple
- **Quick actions**: Reembolso, reenvío recibo

### **Analytics Integration**
- **Revenue trends**: Tendencias de ingresos
- **Popular products**: Productos más vendidos
- **Customer insights**: Insights de clientes
- **Performance metrics**: KPIs de ventas

### **Estado Legacy**

#### **SalesMain (Deprecated)**
```tsx
// Este componente es un wrapper legacy que redirige a AnalyticsDashboard
// Mantiene compatibilidad hacia atrás pero debería evitarse en nuevo código

import AnalyticsDashboard from '../analytics/AnalyticsDashboard';

const Sales: React.FC = () => {
  return <AnalyticsDashboard />;
};
```

**Recomendación**: Usar directamente `AnalyticsDashboard` para vista completa de ventas.

---

**Los componentes sale proporcionan gestión eficiente de transacciones mobile-first** 💰 