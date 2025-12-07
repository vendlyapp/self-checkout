# Guía de Uso de React Query (TanStack Query)

## 📋 Resumen

Toda la aplicación ahora usa **React Query (TanStack Query)** para todas las peticiones API. Esto proporciona:
- ✅ **Cache automático** - Evita peticiones innecesarias
- ✅ **Manejo de errores** - Gestión robusta de errores y reintentos
- ✅ **Cancelación automática** - Cancela peticiones cuando el componente se desmonta
- ✅ **Estados de carga** - `isLoading`, `isFetching`, `isError` automáticos
- ✅ **Invalidación de cache** - Actualiza datos después de mutaciones

## 🎯 Hooks Disponibles

### Queries (Lectura de datos)

#### Productos
```typescript
import { useProducts, useProductStats, useProductById, useProductByQR, useProductsAnalytics } from '@/hooks/queries';

// Obtener lista de productos
const { data, isLoading, error } = useProducts({ isActive: true });

// Obtener estadísticas de productos
const { data: stats } = useProductStats();

// Obtener producto por ID
const { data: product } = useProductById(productId);

// Obtener producto por QR
const { data: product } = useProductByQR(qrCode);

// Obtener analytics de productos
const { data: analytics } = useProductsAnalytics();
```

#### Órdenes
```typescript
import { useOrderStats, useRecentOrders } from '@/hooks/queries';

// Estadísticas de órdenes del día
const today = new Date().toISOString().split('T')[0];
const { data: stats } = useOrderStats(today);

// Órdenes recientes
const { data: orders } = useRecentOrders(10);
```

### Mutations (Escritura de datos)

#### Productos
```typescript
import { useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateProductStock } from '@/hooks/mutations';

// Crear producto
const createProduct = useCreateProduct();
await createProduct.mutateAsync(productData);

// Actualizar producto
const updateProduct = useUpdateProduct();
await updateProduct.mutateAsync({ id, data: updateData });

// Eliminar producto
const deleteProduct = useDeleteProduct();
await deleteProduct.mutateAsync(productId);

// Actualizar stock
const updateStock = useUpdateProductStock();
await updateStock.mutateAsync({ id, quantity: 10 });
```

#### Órdenes
```typescript
import { useCreateOrder } from '@/hooks/mutations';

// Crear orden
const createOrder = useCreateOrder();
await createOrder.mutateAsync(orderData);
```

## 🔧 Configuración de Cache

Los tiempos de cache están configurados en `lib/providers/QueryProvider.tsx`:

- **Productos**: 5 minutos (cambian poco)
- **Órdenes**: 2 minutos (más dinámicos)
- **Órdenes recientes**: 1 minuto (muy dinámicos)

## ⚠️ Reglas Importantes

### ❌ NO hacer esto:
```typescript
// ❌ MAL - Llamada directa al servicio
const response = await ProductService.getProducts();
```

### ✅ Hacer esto:
```typescript
// ✅ BIEN - Usar hook de React Query
const { data, isLoading } = useProducts();
```

## 🔄 Invalidación de Cache

Las mutations automáticamente invalidan el cache relacionado. Si necesitas invalidar manualmente:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidar productos
queryClient.invalidateQueries({ queryKey: ['products'] });

// Invalidar estadísticas
queryClient.invalidateQueries({ queryKey: ['productStats'] });
```

## 🎨 Estados Disponibles

Todos los hooks de React Query proporcionan:

```typescript
const {
  data,           // Datos de la respuesta
  isLoading,      // Primera carga (no hay datos en cache)
  isFetching,     // Cualquier fetch en progreso (incluye refetch)
  isError,        // Si hay un error
  error,          // Objeto de error
  refetch,        // Función para refetch manual
  isSuccess,      // Si la query fue exitosa
} = useProducts();
```

## 🚫 Manejo de Cancelaciones

React Query automáticamente cancela peticiones cuando:
- El componente se desmonta
- La query cambia de parámetros
- Hay una nueva query con la misma key

Los errores de cancelación se manejan automáticamente y no se muestran al usuario.

## 📝 Ejemplo Completo

```typescript
'use client';

import { useProducts } from '@/hooks/queries';
import { useCreateProduct } from '@/hooks/mutations';

export default function ProductsPage() {
  const { data: products, isLoading, error } = useProducts();
  const createProduct = useCreateProduct();

  const handleCreate = async () => {
    try {
      await createProduct.mutateAsync({
        name: 'Nuevo Producto',
        price: 10.99,
        // ... más datos
      });
      // El cache se invalida automáticamente
      // Los productos se refrescarán automáticamente
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
      <button onClick={handleCreate}>Crear Producto</button>
    </div>
  );
}
```

