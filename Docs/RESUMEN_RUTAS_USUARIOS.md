# 🎯 Resumen: Rutas y Componentes de Usuario

## 📍 ¿Qué Ruta Está Usando el Usuario Realmente?

### ✅ RUTA PRINCIPAL: `/store/[slug]`

**Esta es la ruta que realmente se usa.** Todas las vistas del usuario terminan aquí.

```
/store/[slug]              → DashboardUser (productos)
/store/[slug]/cart         → Carrito
/store/[slug]/payment      → Pago
/store/[slug]/promotion    → Promociones
/store/[slug]/search       → Búsqueda
```

### ⚠️ RUTA LEGACY: `/user`

**Solo redirige a `/store/[slug]`** (excepto scan):

```
/user                     → Redirige a /store/[slug]
/user/cart                → Redirige a /store/[slug]/cart
/user/payment             → Redirige a /store/[slug]/payment
/user/promotion           → Usado por /store/[slug]/promotion
/user/search              → Redirige a /store/[slug]/search
/user/scan                → ✅ ESCÁNER QR (única que no redirige)
```

---

## 🔄 Flujo Completo del Usuario

```
┌─────────────────────────────────────────┐
│  1. Usuario escanea QR en /user/scan     │
└───────────────┬───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  2. Se guarda tienda en scannedStore   │
└───────────────┬───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  3. Usuario navega a /user o /user/*    │
└───────────────┬───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  4. Layout detecta tienda y REDIRIGE   │
│     automáticamente a /store/[slug]/*  │
└───────────────┬───────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│  5. Usuario ve DashboardUser con       │
│     productos de la tienda              │
└─────────────────────────────────────────┘
```

---

## 🧩 Componentes Clave

### Navegación
- **HeaderUser** - Logo tienda + Vendly
- **FooterNavUser** - 5 botones (Home, Search, Scan, Promotions, Cart)

### Contenido
- **DashboardUser** - Vista principal de productos
- **ProductsList** - Lista de productos
- **ProductCard** - Card de producto
- **PaymentP** - Pago
- **SearchUser** - Búsqueda
- **SnanerDash** - Escáner QR

### Estado (Stores)
- **scannedStoreStore** - Tienda actual escaneada
- **cartStore** - Carritos por tienda (múltiples)

---

## 🎯 Respuesta Directa a tus Preguntas

### ¿Qué páginas y componentes estoy usando realmente?

**Páginas activas:**
- `/store/[slug]` - Principal
- `/store/[slug]/cart` - Carrito
- `/store/[slug]/payment` - Pago
- `/store/[slug]/promotion` - Promociones
- `/store/[slug]/search` - Búsqueda
- `/user/scan` - Escáner QR

**Componentes principales:**
- `DashboardUser` - Vista principal
- `HeaderUser` + `FooterNavUser` - Navegación
- `ProductsList` - Productos
- `PaymentP` - Pago

### ¿Qué vista está viendo el usuario al entrar en la tienda?

**Vista:** `DashboardUser` en `/store/[slug]`

**Contiene:**
- Header con nombre y dirección de la tienda
- Barra de búsqueda
- Botón de escaneo QR
- Filtros por categoría
- Lista de productos de la tienda

### ¿Cómo lo podemos saber?

**Indicadores:**
1. El layout de `/user` tiene lógica de redirección automática
2. Todas las páginas en `/store/[slug]` cargan datos de la tienda
3. `scannedStoreStore` guarda la tienda actual
4. `FooterNavUser` detecta automáticamente la ruta base

---

## ⚠️ Problemas a Resolver

1. **Código duplicado** entre `/user/cart` y `/store/[slug]/cart`
2. **Rutas legacy** que solo redirigen
3. **Inconsistencias** en cómo se carga la tienda
4. **Lógica de redirección** compleja en el layout

---

## ✅ Recomendación

**Unificar todo en `/store/[slug]` y mantener solo `/user/scan`**

1. Crear hooks compartidos para lógica común
2. Eliminar páginas duplicadas en `/user`
3. Simplificar redirecciones
4. Estandarizar carga de datos

