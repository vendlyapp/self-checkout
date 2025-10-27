# 🚫 Experiencia de Usuario: Tienda Cerrada

## ✨ Lo Implementado

Cuando una tienda tiene `isOpen: false`, la experiencia de usuario cambia completamente para indicar que la tienda está cerrada.

## 🎯 Cambios Implementados

### 1. Layout de Usuario (`app/user/layout.tsx`)

**Comportamiento:**
- ❌ **NO muestra el Header** si la tienda está cerrada
- ❌ **NO muestra el Footer** si la tienda está cerrada
- ✅ **Pantalla completa** sin navbars
- ✅ **Sin padding** superior/inferior

```typescript
const isStoreClosed = store?.isOpen === false;

// Header condicional
{!isStoreClosed && <HeaderUser />}

// Footer condicional  
{!isStoreClosed && <FooterNavUser />}

// Sin padding cuando está cerrada
className={isStoreClosed ? 'pt-0 pb-0' : 'pt-[calc(85px+...)]'}
```

### 2. Dashboard de Usuario (`components/user/Dashboard.tsx`)

**Comportamiento:**
- ❌ **NO muestra barra de búsqueda** si está cerrada
- ❌ **NO muestra botón de Scan** si está cerrada
- ❌ **NO muestra header de productos** si está cerrada
- ✅ **Solo muestra pantalla de "Geschäft geschlossen"**

```typescript
// Barra de búsqueda condicional
{store && store.isOpen !== false && (
  <SearchInput />
)}

// Pantalla de tienda cerrada
{store.isOpen === false && (
  <ClosedStoreScreen />
)}
```

### 3. Página de Tienda (`app/store/[slug]/page.tsx`)

**Comportamiento:**
- ✅ Carga la información completa de la tienda
- ✅ Guarda el campo `isOpen` en el store
- ✅ El layout y dashboard se adaptan automáticamente

## 📱 Experiencia Visual

### Tienda Cerrada: Vista Completa

```
┌─────────────────────────────────────┐
│  (SIN HEADER - Navbar oculto)      │
│                                     │
│                                     │
│      [❌ Ícono grande naranja]     │
│         (animado, pulsante)         │
│                                     │
│   Geschäft geschlossen              │
│   (Título grande, bold)             │
│                                     │
│   Entschuldigung, {NombreTienda}   │
│   ist zur Zeit geschlossen          │
│                                     │
│   Bitte versuchen Sie es später    │
│   erneut. Vielen Dank für Ihr      │
│   Verständnis.                      │
│                                     │
│   ┌─────────────────────────────┐ │
│   │ ⏰ Wir sind derzeit          │ │
│   │    nicht verfügbar           │ │
│   └─────────────────────────────┘ │
│                                     │
│  (SIN FOOTER - Navbar oculto)      │
└─────────────────────────────────────┘
```

### Tienda Abierta: Vista Normal

```
┌─────────────────────────────────────┐
│ [Header con navegación]             │
│                                     │
│ [Logo] Nombre Tienda                │
│ [Barra de búsqueda] [Botón Scan]    │
│                                     │
│ ┌───────┐ ┌───────┐ ┌───────┐     │
│ │Prod. 1│ │Prod. 2│ │Prod. 3│     │
│ └───────┘ └───────┘ └───────┘     │
│                                     │
│ [Footer con navegación]            │
└─────────────────────────────────────┘
```

## 🔒 Funcionalidad Bloqueada

### Cuando `isOpen: false`, NO se puede:

- ❌ Ver productos
- ❌ Buscar productos
- ❌ Escanear QR codes
- ❌ Agregar al carrito
- ❌ Ver carrito
- ❌ Navegar (header oculto)
- ❌ Ir a otras secciones (footer oculto)

### Solo se puede:

- ✅ Ver mensaje de "Geschäft geschlossen"
- ✅ Ver nombre de la tienda
- ✅ Entender que la tienda está cerrada
- ✅ Cerrar la app o página

## 🎨 Detalles de UI

### Pantalla de Tienda Cerrada

**Visual:**
- Ícono grande (128px) con fondo naranja
- Animación de pulso en el ícono
- Mensaje en alemán
- Nombre personalizado de la tienda
- Caja informativa con reloj

**Layout:**
- Sin header (invisible)
- Sin footer (invisible)
- Sin padding superior/inferior
- Pantalla full-screen
- Centro vertical y horizontal

### Responsive

- ✅ Mobile: Diseño completo
- ✅ Desktop: Mismo diseño
- ✅ Tablet: Adaptado
- ✅ Fondo crema (background-cream)

## 🔄 Flujo Completo

### 1. Usuario visita tienda cerrada

```
URL: http://localhost:3000/store/admin-vendly-s-store
```

### 2. Carga de datos

```typescript
// app/store/[slug]/page.tsx
const response = await fetch(`/api/store/${slug}`)
const result = await response.json()

// Guarda isOpen en el store
setStore({
  isOpen: result.data.isOpen, // false
  ...
})
```

### 3. Layout verifica estado

```typescript
// app/user/layout.tsx
const isStoreClosed = store?.isOpen === false

// NO renderiza header
{!isStoreClosed && <HeaderUser />}  // No se muestra

// NO renderiza footer
{!isStoreClosed && <FooterNavUser />}  // No se muestra
```

### 4. Dashboard muestra pantalla cerrada

```typescript
// components/user/Dashboard.tsx
if (store.isOpen === false) {
  return <ClosedStoreScreen />  // Pantalla de "Geschäft geschlossen"
}
```

## 🧪 Probar la Funcionalidad

### 1. Cerrar tienda desde el dashboard

```bash
# En el dashboard del admin
# Hacer click en el toggle para cerrar
# Cambiar de isOpen: true → isOpen: false
```

### 2. Visitar la tienda cerrada

```
http://localhost:3000/store/admin-vendly-s-store
```

### 3. Verificar

✅ No hay header
✅ No hay footer
✅ Solo pantalla de "Geschäft geschlossen"
✅ No se puede navegar
✅ No se puede buscar
✅ No se pueden ver productos

### 4. Abrir la tienda de nuevo

```bash
# Desde el dashboard admin
# Cambiar toggle de isOpen: false → isOpen: true
```

### 5. Visitar la tienda abierta

```
http://localhost:3000/store/admin-vendly-s-store
```

✅ Aparece header
✅ Aparece footer
✅ Muestra productos
✅ Puede buscar, scanear, comprar

## 🎯 Beneficios

1. **UX Clara:** El usuario sabe que la tienda está cerrada
2. **Sin Confusión:** No puede intentar comprar
3. **Profesional:** Mensaje educado y claro
4. **Inmersion Total:** Sin distracciones de navegación
5. **Visual:** Ícono animado que capta la atención

## 🐛 Debug

### Si el navbar se muestra cuando no debería:

```typescript
// Verificar en console
console.log('Store:', store)
console.log('isOpen:', store?.isOpen)

// Verificar en layout
console.log('isStoreClosed:', isStoreClosed)
```

### Si los elementos no se ocultan:

1. Verificar que `store?.isOpen === false`
2. Verificar que la condición `{!isStoreClosed && <Component />}` funciona
3. Verificar el renderizado en DevTools

## ✅ Checklist

- ✅ Header oculto cuando tienda cerrada
- ✅ Footer oculto cuando tienda cerrada
- ✅ Sin padding cuando tienda cerrada
- ✅ Barra de búsqueda oculta
- ✅ Botón Scan oculto
- ✅ Solo pantalla de "Geschäft geschlossen"
- ✅ No se puede navegar
- ✅ No se pueden ver productos
- ✅ Pantalla full-screen

