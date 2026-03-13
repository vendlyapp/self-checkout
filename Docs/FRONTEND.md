# Frontend — Documentación Técnica

**Framework:** Next.js 15.5.9 (App Router)
**Lenguaje:** TypeScript
**Estilos:** TailwindCSS v4

---

## Rutas del sistema

### Vista del cliente (sin autenticación requerida)

```
/store/[slug]               → Página principal de productos de la tienda
/store/[slug]/cart          → Carrito de compras
/store/[slug]/payment       → Selección de método de pago y confirmación
/store/[slug]/search        → Búsqueda de productos
/store/[slug]/promotion     → Productos en promoción
/store/[slug]/scan          → Escáner QR de productos
```

El cliente llega escaneando el QR code de la tienda. El `slug` identifica la tienda.

### Panel de administración (requiere auth — rol ADMIN)

```
/                           → Landing page
/(auth)/login               → Inicio de sesión
/(auth)/register            → Registro
/(auth)/check-email         → Verificación de email

/(dashboard)/dashboard      → Home del dashboard (métricas rápidas)
/(dashboard)/products       → Gestión de productos
/(dashboard)/store          → Configuración general de la tienda
  /store/settings           → Ajustes (nombre, logo, horario)
  /store/discounts          → Códigos de descuento
  /store/payment-methods    → Métodos de pago aceptados
  /store/customers          → Lista de clientes
  /store/invoice/           → Listado de facturas
  /store/invoice/[id]       → Detalle de factura
  /store/notifications      → Notificaciones
  /store/printer            → Configuración de impresora POS
  /store/profile            → Perfil del administrador
  /store/backups            → Backups
  /store/help               → Ayuda y FAQ
/(dashboard)/sales          → Analytics y ventas
  /sales/orders             → Listado de órdenes
  /sales/orders/[id]        → Detalle de orden
  /sales/invoices           → Listado de facturas (alias)
  /sales/invoices/[id]      → Detalle de factura
  /sales/verkaufe           → Ventas completadas
/(dashboard)/my-qr          → QR code de la tienda para imprimir

/products_list              → Gestión avanzada de productos (vista lista)
/products_list/add_product  → Crear producto nuevo
/products_list/view/[id]    → Ver/editar producto existente
/categories                 → Gestión de categorías
/charge                     → Cobro manual (POS interno del admin)
/charge/cart                → Carrito del POS
/charge/payment             → Pago del POS
```

### Super Admin (rol SUPER_ADMIN)

```
/super-admin/dashboard      → Panel global de la plataforma
/super-admin/users          → Gestión de usuarios
/super-admin/stores         → Gestión de todas las tiendas
/super-admin/products       → Gestión global de productos
/super-admin/analytics      → Analytics de la plataforma
/super-admin/config         → Configuración global
```

---

## Estructura de carpetas

```
Frontend/
├── app/                    → Rutas (Next.js App Router)
├── components/             → Componentes React reutilizables
│   ├── navigation/         → Headers, footers, sidebars
│   │   └── user/           → HeaderUser.tsx, FooterNavUser.tsx
│   ├── user/               → Componentes de la vista del cliente
│   ├── dashboard/          → Componentes del panel admin
│   ├── admin/              → AdminLayout.tsx (layout del admin)
│   ├── ui/                 → Componentes base (Shadcn/ui + custom)
│   └── pwa/                → PWAInstallBanner
├── hooks/                  → Custom hooks
│   ├── queries/            → React Query hooks (GET)
│   ├── mutations/          → React Query mutations (POST/PUT/DELETE)
│   ├── auth/               → Hooks de autenticación
│   └── business/           → Lógica de negocio (promos, etc.)
├── lib/                    → Utilidades y configuración
│   ├── stores/             → Zustand stores (estado global)
│   ├── supabase/           → Clientes Supabase (client + server)
│   ├── services/           → Llamadas a la API del backend
│   ├── auth/               → AuthContext, SessionTimeoutManager
│   ├── guards/             → AuthGuard, StoreOnboardingGuard
│   └── config/             → api.ts (endpoints), brand.ts
└── types/                  → TypeScript types centralizados
```

---

## Estado global

### Zustand (estado persistente en localStorage)

| Store | Propósito |
|-------|-----------|
| `cartStore` | Carrito de compras por tienda (ítems, cantidades, total) |
| `scannedStoreStore` | Tienda actualmente activa (cargada por slug) |
| `storeState` | Estado abierto/cerrado de la tienda |
| `productsAnalyticsStore` | Datos de analytics de productos |
| `superAdminStore` | Estado del panel super admin |

### React Query (server state con caché)

Para todas las operaciones de lectura desde la API:

```typescript
// Queries disponibles
useProducts()           // Lista de productos
useCategories()         // Categorías
useOrders()             // Órdenes
useInvoices()           // Facturas
useDiscountCodes()      // Códigos de descuento
usePaymentMethods()     // Métodos de pago
useProductStats()       // Estadísticas de productos
useOrderStats()         // Estadísticas de órdenes
useStoreData()          // Datos de la tienda por slug

// Mutations disponibles
useProductMutations()   // CRUD productos
useOrderMutations()     // Crear órdenes
useStoreMutations()     // Actualizar tienda
useCategoryMutations()  // CRUD categorías
useInvoiceMutations()   // Crear facturas
```

### Context API

| Contexto | Propósito |
|----------|-----------|
| `AuthContext` | Usuario autenticado actual (Supabase session) |
| `UserContext` | Perfil del usuario (nombre, email, rol) |
| `ThemeContext` | Tema visual |
| `SidebarContext` | Estado del sidebar (abierto/cerrado) |
| `StoreContext` | Estado de la tienda del cliente (búsqueda, filtros, QR) |

---

## Autenticación

- **Proveedor:** Supabase Auth
- **Métodos:** Email + Password, Google OAuth
- **Tokens:** JWT almacenados en cookies (SSR-safe con `@supabase/ssr`)
- **Timeout de sesión:** 15 minutos de inactividad (`SessionTimeoutManager`)
- **Protección de rutas:** `AuthGuard` en rutas del dashboard

---

## Servicios (llamadas al backend)

En `lib/services/` se centralizan todas las llamadas a la API:

```typescript
orderService.ts         // Crear y listar órdenes
productService.ts       // CRUD de productos
categoryService.ts      // CRUD de categorías
analyticsService.ts     // Obtener métricas
invoiceService.ts       // Generar y listar facturas
customerService.ts      // Datos de clientes
discountCodeService.ts  // Gestión de códigos descuento
superAdminService.ts    // Operaciones de super admin
```

La URL base del backend se configura en `lib/config/api.ts` desde `NEXT_PUBLIC_API_URL`.

---

## Layouts por sección

### Cliente — `/store/[slug]/layout.tsx`
```
Contenedor único fixed (bg-background-cream)
├── HeaderUser (logo tienda + logo Vendly) — 80px + safe area
├── [si página principal]
│   ├── StoreInfoHeader (nombre + ciudad + rating)
│   └── StoreFixedHeader (búsqueda + botón scan + filtros categorías)
└── [si sub-página]
    └── HeaderNav (← título de la página)

Main (scroll)
└── Contenido de la ruta

FooterNavUser (fixed bottom)
└── Home | Buscar | [Scan] | Promociones | Carrito
```

### Admin — `components/admin/AdminLayout.tsx`
```
Sidebar (desktop/tablet, siempre visible)
ResponsiveHeader (mobile, logo + acciones)

Contenedor fixed para headers secundarios:
├── [/charge, /products_list] → HeaderNav + Filter_Busqueda
├── [/products_list/add, /view] → HeaderNav
└── [otras rutas admin] → HeaderNav con título de ruta

Main (scroll) → contenido
Footer (mobile only):
├── FooterAddProduct (products_list)
├── FooterContinue (charge/cart)
└── ResponsiveFooterNav (otras rutas)
```

---

## Tecnologías principales

| Librería | Versión | Uso |
|----------|---------|-----|
| Next.js | 15.5.9 | Framework (App Router, SSR, optimizaciones) |
| React | 19.2.3 | UI |
| TypeScript | ^5 | Type safety |
| TailwindCSS | ^4 | Estilos utility-first |
| Zustand | ^5.0.6 | Estado global (client) |
| React Query | ^5.90.12 | Estado del servidor (caché, refetch) |
| React Hook Form | ^7.59.0 | Formularios |
| Zod | ^3.25.67 | Validación de esquemas |
| Supabase SSR | ^0.6.1 | Auth con cookies (SSR-safe) |
| Radix UI | ^1.x | Componentes accesibles |
| Lucide React | ^0.525.0 | Iconos |
| Sonner | ^2.0.5 | Toast notifications |
| html5-qrcode | ^2.3.8 | Escáner QR (cámara) |
| qrcode | ^1.5.4 | Generación de QR |
| ApexCharts | ^5.3.6 | Gráficos (analytics) |
| jsPDF + html2canvas | ^4.0.0 | Generación de PDFs |
| Swiper | ^11.2.10 | Carruseles |

---

## PWA (Progressive Web App)

La aplicación es instalable como PWA en dispositivos móviles:
- `manifest.json` configurado
- `PWAInstallBanner` component para solicitar instalación
- Optimizaciones para iOS (safe area, scroll, touch targets de 44px mínimo)
- `no-scrollbar`, `ios-scroll-fix` utilities en globals.css
