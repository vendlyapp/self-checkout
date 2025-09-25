# 🎣 Centralized Hooks Library

**Hooks centralizados y organizados por categorías**
Sistema de hooks modular y bien documentado para Vendly Self-Checkout.

## 📁 Estructura Organizada

```
hooks/
├── core/                    # Hooks esenciales y utilidades básicas
├── ui/                      # Hooks de interfaz de usuario
│   ├── useResponsive.ts     # Responsive design y breakpoints
│   ├── useScrollReset.ts    # Gestión de scroll para PWA
│   └── index.ts
├── business/                # Hooks de lógica de negocio
│   ├── usePromoLogic.ts     # Lógica de códigos promocionales
│   ├── usePromoCode.ts      # Gestión avanzada de promociones
│   └── index.ts
├── data/                    # Hooks de gestión de datos
│   ├── useDashboard.ts      # Dashboard principal
│   ├── useAnalytics.ts      # Analytics y métricas
│   ├── useProducts.ts       # Gestión de productos
│   └── index.ts
├── index.ts                 # Exportaciones centralizadas
└── README.md               # Esta documentación
```

## 🚀 Uso

### **Importación Centralizada**
```typescript
// Importar desde el índice principal
import {
  useResponsive,
  usePromoLogic,
  useDashboard,
  useAnalytics
} from '@/hooks';

// O importar por categoría
import { useResponsive } from '@/hooks/ui';
import { usePromoLogic } from '@/hooks/business';
import { useDashboard } from '@/hooks/data';
```

## 🎯 Categorías de Hooks

### **🔧 Core Hooks**
Hooks esenciales y utilidades básicas del sistema.

### **🎨 UI Hooks**
Hooks relacionados con interfaz de usuario y experiencia.

#### **useResponsive**
```typescript
const { isMobile, isTablet, isDesktop, screenWidth, isCollapsed, setIsCollapsed } = useResponsive();
```

#### **useScrollReset**
```typescript
const { scrollContainerRef, resetScroll } = useScrollReset();
const useScrollToTop = (dependency?: string) => void;
```

### **💼 Business Hooks**
Hooks de lógica de negocio y funcionalidades específicas.

#### **usePromoLogic**
```typescript
const {
  promoApplied,
  discountAmount,
  promoError,
  localPromoCode,
  setLocalPromoCode,
  handleApplyPromo,
  handleRemovePromo,
} = usePromoLogic();
```

#### **usePromoCode**
```typescript
const {
  promoCode,
  setPromoCode,
  promoApplied,
  discountAmount,
  promoError,
  subtotal,
  total,
  handleApplyPromo,
  handleRemovePromo,
} = usePromoCode();
```

### **📊 Data Hooks**
Hooks de gestión de datos, dashboard y analytics.

#### **useDashboard**
```typescript
const {
  data,
  loading,
  error,
  isStoreOpen,
  searchQuery,
  searchResults,
  handleSearch,
  handleToggleStore,
  refreshData,
} = useDashboard();
```

#### **useAnalytics**
```typescript
const {
  data,
  loading,
  error,
  salesPeriod,
  totalSales,
  salesGrowth,
  refreshData,
} = useAnalytics();
```

#### **useProducts**
```typescript
const { data, loading, error, refresh } = useProducts();
const { loading, handleNewProduct, handleProductList, handleCategories } = useProductActions();
```

## ✨ Características

### **📝 Documentación Completa**
- JSDoc en todos los hooks
- Ejemplos de uso incluidos
- Tipos TypeScript bien definidos

### **🎯 Organización Lógica**
- Categorización por responsabilidad
- Imports centralizados
- Estructura escalable

### **🔒 Type Safety**
- Interfaces bien definidas
- Tipos exportados
- Validación de TypeScript

### **🚀 Performance**
- Hooks optimizados
- Memoización cuando es necesario
- Cleanup automático

## 🛠️ Desarrollo

### **Agregar Nuevo Hook**

1. **Crear archivo en categoría apropiada:**
```typescript
// hooks/business/useNewFeature.ts
export const useNewFeature = () => {
  // Implementación
};
```

2. **Exportar en índice de categoría:**
```typescript
// hooks/business/index.ts
export { useNewFeature } from './useNewFeature';
```

3. **Documentar con JSDoc:**
```typescript
/**
 * Hook para nueva funcionalidad
 *
 * @returns NewFeatureReturn - Estado de la nueva funcionalidad
 *
 * @example
 * ```tsx
 * const { data, loading } = useNewFeature();
 * ```
 */
```

### **Convenciones**

- **Naming**: `use` + PascalCase (ej: `useResponsive`)
- **Archivos**: PascalCase con extensión `.ts`
- **Tipos**: `HookNameReturn` para interfaces de retorno
- **Documentación**: JSDoc completo con ejemplos

## 🔄 Migración Completada

### **✅ Eliminado**
- `lib/hooks/` - Hooks antiguos dispersos
- `components/dashboard/hooks/` - Hooks específicos del dashboard
- `components/dashboard/analytics/hooks/` - Hooks de analytics
- `components/dashboard/products/hooks/` - Hooks de productos

### **✅ Centralizado**
- Todos los hooks en `/hooks/`
- Imports actualizados en toda la aplicación
- Documentación completa
- Tipos bien definidos

---

**Los hooks centralizados proporcionan estado predecible y lógica reutilizable** 🎣
