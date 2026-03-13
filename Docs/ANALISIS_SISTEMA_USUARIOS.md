# 📊 Análisis del Sistema de Usuarios - Vendly Checkout

## 🎯 Resumen Ejecutivo

Tu aplicación tiene **dos rutas principales** para usuarios, pero actualmente **solo una está en uso activo**:

1. **`/app/store/[slug]`** - ✅ **RUTA PRINCIPAL ACTIVA** (la que realmente se usa)
2. **`/app/user`** - ⚠️ **RUTA LEGACY** (redirige automáticamente a `/store/[slug]`)

---

## 🔍 ¿Qué Vista Ve el Usuario al Entrar a una Tienda?

### Flujo Completo del Usuario:

```
1. Usuario escanea QR → /user/scan
   ↓
2. Se guarda tienda en scannedStoreStore
   ↓
3. Usuario navega a /user o /user/*
   ↓
4. Layout de /user detecta tienda y REDIRIGE automáticamente a /store/[slug]/*
   ↓
5. Usuario ve la vista de la tienda en /store/[slug]
```

### Vista Principal que Ve el Usuario:

**Ruta:** `/store/[slug]` → Renderiza `DashboardUser`

**Componentes que se muestran:**
- **HeaderUser** - Logo de la tienda + logo de Vendly
- **DashboardUser** - Lista de productos con:
  - Información de la tienda (nombre, dirección)
  - Barra de búsqueda
  - Botón de escaneo QR
  - Filtros por categoría
  - Lista de productos
- **FooterNavUser** - Navegación inferior con:
  - Home
  - Search
  - Scan (botón central)
  - Promotions
  - Cart

---

## 📁 Estructura de Rutas y Componentes

### ✅ RUTA ACTIVA: `/app/store/[slug]`

#### Páginas:
- **`page.tsx`** → Carga tienda y renderiza `DashboardUser`
- **`cart/page.tsx`** → Carrito de compras (usa `ProductCard`, `usePromoLogic`)
- **`payment/page.tsx`** → Pago (usa `PaymentP`)
- **`promotion/page.tsx`** → Promociones (usa `PromotionPage`)
- **`search/page.tsx`** → Búsqueda (usa `SearchUser`)

#### Layout:
- **`layout.tsx`** → Wrapper con `HeaderUser` y `FooterNavUser`

### ⚠️ RUTA LEGACY: `/app/user`

#### Páginas:
- **`page.tsx`** → Renderiza `DashboardUser` (pero redirige a `/store/[slug]`)
- **`cart/page.tsx`** → Versión legacy (redirige a `/store/[slug]/cart`)
- **`payment/page.tsx`** → Solo redirige a `/store/[slug]/payment`
- **`promotion/page.tsx`** → Usado por `/store/[slug]/promotion`
- **`search/page.tsx`** → Renderiza `SearchUser` (pero redirige)
- **`scan/page.tsx`** → ✅ **ÚNICA PÁGINA QUE NO REDIRIGE** (escáner QR)

#### Layout:
- **`layout.tsx`** → Tiene lógica de redirección automática:
  ```typescript
  // Mapea rutas de /user/* a /store/[slug]/*
  const routeMap = {
    '/user': `/store/${store.slug}`,
    '/user/cart': `/store/${store.slug}/cart`,
    '/user/payment': `/store/${store.slug}/payment`,
    '/user/promotion': `/store/${store.slug}/promotion`,
    '/user/search': `/store/${store.slug}/search`,
  };
  ```

---

## 🧩 Componentes Principales Usados

### Componentes de Navegación:
1. **`HeaderUser`** (`components/navigation/user/HeaderUser.tsx`)
   - Muestra logo de la tienda (desde `scannedStoreStore`)
   - Logo de Vendly
   - Se oculta si la tienda está cerrada

2. **`FooterNavUser`** (`components/navigation/user/FooterNavUser.tsx`)
   - Navegación inferior con 5 botones
   - Detecta automáticamente si está en `/store/[slug]` o `/user`
   - Muestra resumen de carrito
   - Botón central de escaneo siempre va a `/user/scan`

### Componentes de Contenido:
1. **`DashboardUser`** (`components/user/Dashboard.tsx`)
   - Vista principal de productos
   - Carga productos desde `/api/store/${slug}/products`
   - Maneja búsqueda, filtros, categorías
   - Estados: sin tienda, tienda cerrada, sin productos, productos

2. **`ProductsList`** (`components/dashboard/charge/ProductsList.tsx`)
   - Lista de productos con cards
   - Usado en Dashboard, Cart, Promotion

3. **`ProductCard`** (`components/dashboard/charge/ProductCard.tsx`)
   - Card individual de producto
   - Usado en Cart

4. **`PaymentP`** (`components/user/PaymentP.tsx`)
   - Componente de pago completo

5. **`SearchUser`** (`components/user/SearchUser.tsx`)
   - Búsqueda avanzada

6. **`PromotionPage`** (`app/user/promotion/page.tsx`)
   - Lista de productos en promoción

7. **`SnanerDash`** (`components/user/SnanerDash.tsx`)
   - Escáner QR completo
   - Escanea códigos de tienda y productos
   - Guarda tienda en `scannedStoreStore`

---

## 🗄️ Gestión de Estado (Stores)

### 1. `scannedStoreStore` (`lib/stores/scannedStoreStore.ts`)
```typescript
interface StoreInfo {
  id: string
  name: string
  slug: string
  logo: string | null
  address?: string | null
  isOpen?: boolean
  isActive?: boolean
}
```
- **Persistente** (localStorage)
- Guarda la tienda actual escaneada
- Usado en: HeaderUser, DashboardUser, todas las páginas

### 2. `cartStore` (`lib/stores/cartStore.ts`)
```typescript
interface CartState {
  currentStoreSlug: string | null
  cartsByStore: Record<string, CartData>  // Múltiples carritos por tienda
  cartItems: CartItem[]
  // ...
}
```
- **Persistente** (localStorage)
- Soporta múltiples carritos (uno por tienda)
- Cambia automáticamente cuando cambias de tienda

---

## 🔄 Flujo de Navegación Detallado

### Escenario 1: Usuario Escanea QR de Tienda
```
1. Usuario va a /user/scan
2. Escanea QR de tienda → SnanerDash detecta código
3. SnanerDash hace fetch a /api/store/${slug}
4. Guarda tienda en scannedStoreStore
5. Redirige a /store/${slug} (o /user que redirige)
```

### Escenario 2: Usuario Navega con Tienda Ya Seleccionada
```
1. Usuario intenta ir a /user/*
2. Layout de /user detecta store?.slug
3. Redirige automáticamente a /store/${slug}/*
4. Usuario ve contenido de la tienda
```

### Escenario 3: Usuario Cambia de Tienda
```
1. Usuario está en /store/tienda1
2. Usuario hace clic en Scan → /user/scan
3. Escanea QR de otra tienda
4. scannedStoreStore se actualiza
5. cartStore cambia a carrito de nueva tienda
6. Redirige a /store/tienda2
```

---

## ⚠️ Problemas Identificados

### 1. **Duplicación de Código**
- Hay dos versiones de algunas páginas (`cart`, `payment`)
- `/user/cart` vs `/store/[slug]/cart` tienen código similar pero diferente
- `/user/payment` solo redirige, pero `/store/[slug]/payment` tiene lógica completa

### 2. **Rutas Legacy Innecesarias**
- `/user/*` (excepto `/user/scan`) solo redirigen
- Mantener estas rutas puede causar confusión
- Código duplicado que necesita mantenimiento

### 3. **Inconsistencias**
- `/store/[slug]/cart` carga tienda en useEffect
- `/user/cart` no carga tienda (asume que ya está)
- Algunas páginas usan `slug` de params, otras usan `store.slug` del store

### 4. **Lógica de Redirección Compleja**
- El layout de `/user` tiene lógica de redirección que puede ser confusa
- Usa `useLayoutEffect` para evitar flashes, pero puede causar problemas

---

## ✅ Recomendaciones para Unificar y Mejorar

### Opción 1: Eliminar Rutas `/user/*` (Excepto `/user/scan`)
**Ventajas:**
- Código más limpio
- Una sola fuente de verdad
- Menos confusión

**Pasos:**
1. Mover `/user/scan` a `/scan` o mantenerlo como está
2. Eliminar todas las páginas `/user/*` excepto `scan`
3. Actualizar todos los links para usar `/store/[slug]/*`
4. Simplificar `FooterNavUser` para siempre usar `/store/[slug]/*`

### Opción 2: Mantener `/user` como Alias (Recomendado)
**Ventajas:**
- URLs más limpias para usuarios
- Fácil de mantener
- Mejor UX

**Pasos:**
1. Mantener `/user/scan` como está
2. Hacer que `/user/*` sean solo wrappers que redirigen
3. Unificar lógica de carga de tienda en un hook compartido
4. Crear componentes compartidos para evitar duplicación

### Opción 3: Unificar Lógica en Hooks
**Crear hooks compartidos:**
- `useStoreData(slug)` - Carga tienda y maneja estado
- `useStoreNavigation()` - Maneja navegación entre rutas
- `useStoreCart(slug)` - Maneja carrito específico de tienda

---

## 📋 Plan de Acción Sugerido

### Fase 1: Análisis y Limpieza
- [ ] Documentar todas las rutas usadas
- [ ] Identificar código duplicado
- [ ] Listar todos los componentes compartidos

### Fase 2: Unificación
- [ ] Crear hooks compartidos para lógica común
- [ ] Unificar lógica de carga de tienda
- [ ] Estandarizar manejo de estados (loading, error, empty)

### Fase 3: Optimización
- [ ] Eliminar código duplicado
- [ ] Simplificar redirecciones
- [ ] Mejorar manejo de errores

### Fase 4: Testing
- [ ] Probar flujo completo de usuario
- [ ] Verificar cambio de tiendas
- [ ] Validar persistencia de carritos

---

## 🎯 Conclusión

**Tu sistema actual funciona así:**

1. **Ruta principal:** `/store/[slug]` - Esta es la que realmente se usa
2. **Ruta de escaneo:** `/user/scan` - Única página de `/user` que no redirige
3. **Rutas legacy:** `/user/*` - Solo redirigen a `/store/[slug]/*`

**El usuario ve:**
- Al escanear QR → Se guarda tienda → Redirige a `/store/[slug]`
- Vista principal: `DashboardUser` con productos de la tienda
- Navegación: `FooterNavUser` que siempre apunta a `/store/[slug]/*`

**Para unificar:**
- Crear hooks compartidos
- Eliminar duplicación
- Mantener `/user/scan` pero simplificar el resto

