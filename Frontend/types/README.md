# 🏷️ Centralized Types Library

**Tipos centralizados y organizados**
Sistema de tipos unificado para Vendly Self-Checkout.

## 📁 Estructura

```
types/
├── hooks.ts              # Tipos de hooks centralizados
├── index.ts              # Exportaciones principales
└── README.md             # Esta documentación
```

## 🎯 Tipos Centralizados

### **🎣 Hook Types**

Todos los tipos de retorno de hooks están centralizados en `types/hooks.ts`:

#### **UI Hooks**
- `ResponsiveState` - Estado de responsive design
- `ScrollResetReturn` - Retorno del hook de scroll

#### **Business Hooks**
- `PromoLogicReturn` - Lógica de promociones
- `PromoCodeReturn` - Gestión de códigos promocionales

#### **Data Hooks**
- `DashboardData` - Datos del dashboard
- `UseDashboardReturn` - Retorno del hook dashboard
- `UseAnalyticsReturn` - Retorno del hook analytics
- `QuickAccessReturn` - Acceso rápido
- `ProductsAnalyticsData` - Datos de productos
- `UseProductsReturn` - Retorno del hook productos
- `ProductActionsReturn` - Acciones de productos

### **📊 Shared Types**

Tipos compartidos entre diferentes partes del sistema:

- `QuickAccessItem` - Items de acceso rápido
- `Sale` - Datos de venta
- `SearchResult` - Resultados de búsqueda
- `AnalyticsData` - Datos de analytics
- `TimePeriod` - Períodos de tiempo
- `SalesData` - Datos de ventas
- `PaymentMethod` - Métodos de pago
- `CartData` - Datos del carrito
- `ShopActivity` - Actividad de la tienda
- `Customer` - Datos de cliente
- `ProductData` - Datos de productos
- `CategoryData` - Datos de categorías

## 🚀 Uso

### **Importación Centralizada**

```typescript
// Importar tipos desde el índice principal
import {
  UseProductsReturn,
  PromoLogicReturn,
  DashboardData,
  ResponsiveState
} from '@/types';

// O importar específicamente de hooks
import { UseProductsReturn } from '@/types/hooks';
```

### **En Hooks**

```typescript
// hooks/data/useProducts.ts
import { UseProductsReturn, ProductsAnalyticsData } from '@/types';

export const useProducts = (): UseProductsReturn => {
  // Implementación
};
```

### **En Componentes**

```typescript
// components/MyComponent.tsx
import { ResponsiveState, PromoLogicReturn } from '@/types';

interface MyComponentProps {
  responsive: ResponsiveState;
  promo: PromoLogicReturn;
}
```

## ✨ Beneficios

### **🎯 Centralización**
- **Un solo lugar** para todos los tipos
- **Eliminación de duplicaciones**
- **Consistencia** en toda la aplicación

### **🔧 Mantenibilidad**
- **Fácil actualización** de tipos
- **Refactoring simplificado**
- **Menos errores** de tipos

### **📝 Documentación**
- **Tipos bien documentados**
- **Ejemplos de uso**
- **Comentarios descriptivos**

### **🚀 Performance**
- **Imports optimizados**
- **Tree shaking** mejorado
- **Bundle size** reducido

## 🛠️ Desarrollo

### **Agregar Nuevo Tipo**

1. **Definir en `types/hooks.ts`:**
```typescript
export interface NewFeatureReturn {
  data: NewFeatureData;
  loading: boolean;
  error: string | null;
}
```

2. **Exportar en `types/index.ts`:**
```typescript
export { NewFeatureReturn } from './hooks';
```

3. **Usar en hooks:**
```typescript
import { NewFeatureReturn } from '@/types';

export const useNewFeature = (): NewFeatureReturn => {
  // Implementación
};
```

### **Convenciones**

- **Naming**: PascalCase para interfaces (ej: `UseProductsReturn`)
- **Archivos**: `types/hooks.ts` para tipos de hooks
- **Documentación**: JSDoc completo con ejemplos
- **Exports**: Centralizados en `types/index.ts`

## 🔄 Migración Completada

### **✅ Centralizado**
- **22 tipos** movidos a ubicación central
- **7 hooks** actualizados con imports centralizados
- **0 duplicaciones** de tipos

### **✅ Eliminado**
- Tipos duplicados en archivos de hooks
- Interfaces repetidas en componentes
- Definiciones dispersas por el sistema

### **✅ Mejorado**
- Imports más limpios y consistentes
- Mejor organización de tipos
- Documentación completa

---

**Los tipos centralizados proporcionan consistencia y mantenibilidad** 🏷️
