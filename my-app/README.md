# 🛒 Vendly Self-Checkout

**Self-Checkout móvil inteligente para pequeños comercios**  
Una aplicación web mobile-first desarrollada con Next.js 15, TypeScript y TailwindCSS.

## 🎯 Descripción del Proyecto

Vendly es una solución de Self-Checkout diseñada específicamente para pequeños comercios (tiendas de barrio, cafeterías, etc.). Permite a los clientes escanear productos y pagar de forma autónoma mientras el dueño mantiene control total desde un dashboard administrativo.

### 🏗️ **Arquitectura del Sistema**

```
my-app/
├── 📱 app/                           # App Router (Next.js 15)
│   ├── (auth)/                      # Autenticación
│   │   ├── login/                   # Login de comerciantes
│   │   └── register/                # Registro de tiendas
│   ├── (dashboard)/                 # Panel administrativo  
│   │   ├── dashboard/               # Dashboard principal
│   │   ├── products/                # Gestión de productos
│   │   ├── sales/                   # Historial de ventas
│   │   └── store/                   # Configuración de tienda
│   └── (shop)/                      # Experiencia del cliente
│       └── [storeId]/               # Tienda específica + checkout
├── 🧩 components/                    # Componentes modulares
│   ├── dashboard/                   # Componentes del dashboard
│   ├── navigation/                  # Navegación móvil
│   ├── shop/                        # Componentes del shop
│   └── ui/                          # UI Kit (Shadcn/ui)
├── 🎨 globals.css                   # Estilos globales optimizados móvil
├── 🔧 lib/                          # Utilidades y configuración
│   ├── stores/                      # Estado global (Zustand)
│   ├── supabase/                    # Cliente de Supabase
│   └── utils.ts                     # Utilidades (cn, etc.)
└── 📦 public/                       # Assets estáticos
```

## 🚀 Tecnologías Principales

### **Frontend**
- **Next.js 15** - App Router, RSC, Server Actions
- **TypeScript** - Tipado estático completo
- **TailwindCSS** - Mobile-first styling
- **Shadcn/ui** - Componentes accesibles
- **Radix UI** - Primitivos de UI

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos relacional
- **Row Level Security** - Seguridad granular

### **Mobile Optimization**
- **PWA Ready** - Progressive Web App
- **Touch Gestures** - Swipe, tap, hold
- **Responsive Design** - 320px - 430px optimizado
- **Performance** - Lazy loading, code splitting

## 📱 Experiencias de Usuario

### 🏪 **Dashboard del Comerciante**
- **Dashboard Principal**: Estadísticas, ventas del día, objetivos
- **Gestión de Productos**: CRUD completo con códigos de barras
- **Control de Ventas**: Historial, filtros, exportación
- **Configuración**: Horarios, métodos de pago, políticas

### 🛒 **Self-Checkout del Cliente**
- **Escaneo de Productos**: Cámara + códigos de barras
- **Carrito Inteligente**: Cálculo automático, promociones
- **Métodos de Pago**: Tarjeta, efectivo, QR payments
- **Recibo Digital**: Email, SMS, descarga PDF

## 🎨 Sistema de Diseño

### **Paleta de Colores**
```css
/* Colores principales */
--primary: #22C55F;           /* Verde principal */  
--background: #F2EDE8;        /* Crema de fondo */
--card: #FFFFFF;              /* Fondo de cards */
--muted: #E5E7EB;            /* Elementos deshabilitados */
--border: #D1D5DB;           /* Bordes sutiles */

/* Colores de estado */
--success: #10B981;           /* Éxito */
--warning: #F59E0B;           /* Advertencia */
--destructive: #EF4444;       /* Error */
```

### **Espaciado & Layout**
```css
/* Espaciado mobile-optimizado */
mb-6     /* 24px - Entre secciones principales */
gap-3    /* 12px - Entre elementos de grid */
p-4      /* 16px - Padding estándar */
p-5      /* 20px - Padding de cards */

/* Bordes redondeados */
rounded-2xl  /* 16px - Cards principales */
rounded-xl   /* 12px - Elementos secundarios */
```

### **Tipografía**
- **Geist Font** - Font principal optimizada
- **Font weights**: 400 (normal), 500 (medium), 600 (semibold)
- **Tamaños móviles**: text-sm, text-base, text-lg, text-xl

## 🧩 Arquitectura de Componentes

### **📊 Dashboard Components** ([Ver documentación](./components/dashboard/README.md))
```typescript
// Estructura modular por responsabilidad
import { 
  GreetingSection,      // home/
  DailyGoalCard,        // home/
  RecentSalesSection,   // sale/
  AnalyticsDashboard,   // analytics/
  DashboardSkeletonLoader // skeletons/
} from '@/components/dashboard';
```

### **🛒 Shop Components**
```typescript
// Experiencia del cliente
import {
  ProductScanner,       // Escáner de códigos de barras
  ShoppingCart,         // Carrito con cálculos
  PaymentFlow,          // Flujo de pago
  Receipt               // Recibo digital
} from '@/components/shop';
```

### **🧱 UI Components** (Shadcn/ui)
```typescript
// Kit de componentes base
import {
  Button, Input, Card,  // Elementos básicos
  Dialog, Sheet,        // Modales móviles
  Badge, Skeleton       // Estados y feedback
} from '@/components/ui';
```

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint + TypeScript check

# Base de datos (Supabase)
npm run db:reset     # Reset completo de DB
npm run db:seed      # Poblar con datos de prueba
npm run types:gen    # Generar tipos de Supabase
```

## 🔧 Configuración de Desarrollo

### **1. Clonar e Instalar**
```bash
git clone <repository>
cd Vendly/Checkout/my-app
npm install
```

### **2. Variables de Entorno**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **3. Configurar Base de Datos**
```bash
# Configurar Supabase
npm run db:reset
npm run db:seed
npm run types:gen
```

### **4. Ejecutar en Desarrollo**
```bash
npm run dev
```

## 📱 Características Mobile-First

### **Touch Interactions**
- ✅ **Tap targets**: Mínimo 44px para accesibilidad
- ✅ **Swipe gestures**: Navegación horizontal
- ✅ **Pull to refresh**: Actualización de datos
- ✅ **Haptic feedback**: Vibraciones contextuales

### **Performance Móvil**
- ✅ **Lazy loading**: Componentes e imágenes
- ✅ **Code splitting**: Por rutas y características
- ✅ **Service Worker**: Caching offline
- ✅ **Image optimization**: Next.js Image component

### **UX Patterns**
- ✅ **Bottom navigation**: Navegación principal
- ✅ **Floating Action Button**: Acciones primarias
- ✅ **Skeleton loaders**: Estados de carga profesionales
- ✅ **Error boundaries**: Manejo robusto de errores

## 🔐 Seguridad

### **Autenticación**
- **Row Level Security** (RLS) en Supabase
- **JWT tokens** con refresh automático
- **Roles granulares**: owner, employee, customer

### **Pagos Seguros**
- **Tokenización** de tarjetas
- **PCI DSS compliance** via proveedores
- **Webhooks** para confirmación

## 📈 Roadmap

### **🚀 Versión 1.0** (Actual)
- ✅ Dashboard básico funcional
- ✅ Gestión de productos simple
- ✅ Self-checkout MVP
- ✅ Pagos básicos

### **📊 Versión 1.1** (Próxima)
- 📊 Analytics avanzados
- 🔔 Notificaciones push
- 👥 Gestión de empleados
- 📦 Inventario automatizado

### **🌟 Versión 2.0** (Futuro)
- 🤖 IA para recomendaciones
- 🏷️ Promociones dinámicas
- 📲 App nativa
- 🌐 Multi-tienda

## 🤝 Guías de Desarrollo

### **Estructura de Commits**
```bash
feat: nueva característica
fix: corrección de bug
docs: actualización de documentación  
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
```

### **Convenciones de Naming**
```typescript
// Componentes: PascalCase
const DashboardCard = () => {};

// Hooks: camelCase con 'use' prefix
const useDashboard = () => {};

// Constantes: SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {};

// Variables: camelCase
const userName = '';
```

### **Estructura de Archivos**
```
ComponentName/
├── index.ts           # Barrel export
├── ComponentName.tsx  # Componente principal
├── types.ts          # Tipos específicos
├── hooks/            # Hooks relacionados
└── __tests__/        # Tests del componente
```

## 📚 Documentación Adicional

- **[Dashboard Components](./components/dashboard/README.md)** - Arquitectura del dashboard
- **[Analytics System](./components/dashboard/analytics/README.md)** - Sistema de analytics
- **[UI Components](./components/ui/README.md)** - Kit de componentes
- **[Shop Experience](./components/shop/README.md)** - Experiencia del cliente

## 📞 Soporte

Para preguntas sobre el desarrollo:
1. Revisa la documentación específica del componente
2. Consulta los ejemplos en cada README
3. Verifica los tipos en TypeScript
4. Usa los skeleton loaders para nuevas funcionalidades

---

**Desarrollado con ❤️ para pequeños comercios**  
*Vendly - Self-Checkout inteligente y accesible*
