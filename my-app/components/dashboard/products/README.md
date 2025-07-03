# Products Dashboard

Dashboard modular para gestión de productos, organizado en componentes reutilizables.

## 📁 Estructura

```
components/dashboard/products/
├── BaseDashboard.tsx         # Componente principal del dashboard
├── StatCard.tsx             # Tarjeta de estadísticas con gráfico
├── StatCardWithBars.tsx     # Versión alternativa con barras
├── ActionButton.tsx         # Botón de acción principal
├── NavigationItem.tsx       # Elemento de navegación
├── CustomTooltip.tsx        # Tooltip personalizado para gráficos
├── types.ts                 # Definiciones de tipos TypeScript
├── index.ts                 # Exportaciones principales
├── data/
│   ├── mockData.ts         # Datos mock y funciones API
│   └── index.ts            # Exportaciones de datos
├── hooks/
│   ├── useProducts.ts      # Hook principal para productos
│   └── index.ts            # Exportaciones de hooks
└── README.md               # Esta documentación
```

## 🚀 Uso

### Componente Principal

```tsx
import { BaseDashboard } from '@/components/dashboard/products';

function ProductsPage() {
  return <BaseDashboard />;
}
```

### Componentes Individuales

```tsx
import { 
  StatCard, 
  ActionButton, 
  NavigationItem 
} from '@/components/dashboard/products';

function CustomDashboard() {
  return (
    <div className="space-y-4">
      <StatCard
        icon={<Package className="w-5 h-5" />}
        title="Productos"
        value={224}
        subtitle="Total productos"
        trend="up"
        badge="8 Nuevos"
      />
      
      <ActionButton
        icon={<Plus className="w-5 h-5" />}
        title="Nuevo Producto"
        subtitle="Crear artículo"
        onClick={() => console.log('Crear')}
        variant="primary"
      />
    </div>
  );
}
```

### Hooks

```tsx
import { useProducts, useProductActions } from '@/components/dashboard/products';

function MyComponent() {
  const { data, loading, error, refresh } = useProducts();
  const { handleNewProduct, handleProductList } = useProductActions();
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Productos: {data.products.total}</p>
      <button onClick={handleNewProduct}>Nuevo Producto</button>
    </div>
  );
}
```

## 🎨 Componentes

### StatCard
Tarjeta de estadísticas con mini gráfico de tendencia usando Recharts.

**Props:**
- `icon` - Icono a mostrar
- `title` - Título principal  
- `value` - Valor numérico o string
- `subtitle` - Subtítulo descriptivo
- `trend` - Tendencia: 'up' | 'down' | 'neutral'
- `trendData` - Array de números para el gráfico
- `badge` - Badge opcional

### ActionButton
Botón de acción principal con estilos primarios o secundarios.

**Props:**
- `icon` - Icono del botón
- `title` - Título del botón
- `subtitle` - Descripción del botón
- `onClick` - Handler del click
- `variant` - 'primary' | 'secondary'

### NavigationItem
Elemento de navegación con badge opcional.

**Props:**
- `icon` - Icono del elemento
- `title` - Título principal
- `subtitle` - Subtítulo
- `badge` - Badge opcional
- `badgeVariant` - 'success' | 'default'
- `onClick` - Handler del click

## 📊 Datos

### Mock Data
Los datos mock están listos para desarrollo y testing:

```tsx
import { mockProductsAnalyticsData } from '@/components/dashboard/products';
```

### API Ready
La estructura está preparada para conexión backend:

```tsx
// Endpoints futuros definidos en mockData.ts
POST /api/products          // Crear producto
GET /api/products           // Listar productos
PUT /api/products/:id       // Actualizar producto
DELETE /api/products/:id    // Eliminar producto
GET /api/analytics/products // Analytics de productos
```

## 🎯 Estados

### Loading
El dashboard maneja estados de carga con skeletons animados.

### Error
Manejo de errores con mensajes informativos.

### Data
Datos reactivos desde el hook `useProducts`.

## 🔧 Customización

### Estilos
Los componentes usan clases de Tailwind alineadas con `globals.css`:
- Variables CSS personalizadas
- Transiciones suaves
- Animaciones de hover y active
- Dark mode ready

### Themes
Compatible con el sistema de temas del proyecto:
- Colores de marca (`--brand-*`)
- Colores neutrales (`--gray-*`)
- Variables CSS dinámicas

## ⚡ Performance

- **Lazy Loading**: Componentes preparados para carga lazy
- **Memoization**: Hooks optimizados con `useCallback`
- **Minimal Re-renders**: Estado optimizado
- **Bundle Size**: Componentes modulares para tree-shaking

## 🔮 Futuro

### Backend Integration
```tsx
// Reemplazar en useProducts.ts
const result = await fetch('/api/products/analytics');
const data = await result.json();
```

### Real-time Updates
```tsx
// WebSocket integration ready
useEffect(() => {
  const ws = new WebSocket('/ws/products');
  ws.onmessage = (event) => {
    const updatedData = JSON.parse(event.data);
    setData(updatedData);
  };
}, []);
```

### Advanced Features
- Filtros y búsqueda
- Paginación
- Exportación de datos
- Notificaciones en tiempo real
- Gestión de inventario

---

Este dashboard está completamente preparado para producción con una arquitectura escalable y mantenible. 