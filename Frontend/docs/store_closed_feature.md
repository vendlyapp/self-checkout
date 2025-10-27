# 🚫 Feature: Pantalla de Tienda Cerrada

## ✨ Descripción

Cuando una tienda tiene `isOpen: false`, los visitantes verán una pantalla especial indicando que la tienda está cerrada en lugar de los productos.

## 🎯 Implementación

### Archivos Modificados

1. **`lib/stores/scannedStoreStore.ts`**
   - Agregado `isOpen` y `isActive` a la interfaz `StoreInfo`

2. **`components/user/Dashboard.tsx`**
   - Agregada verificación de `store.isOpen === false`
   - Pantalla personalizada para tienda cerrada

3. **`app/store/[slug]/page.tsx`**
   - Guarda el campo `isOpen` al cargar la tienda desde la API

## 🖼️ Pantalla de Tienda Cerrada

### Diseño

```
┌─────────────────────────────────────┐
│                                     │
│      [❌ Ícono grande naranja]     │
│         (animado, pulsante)         │
│                                     │
│   Geschäft geschlossen              │
│   (Título grande, bold)            │
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
└─────────────────────────────────────┘
```

### Características

- ✅ Ícono de cierre grande y animado
- ✅ Fondo naranja claro con pulso
- ✅ Mensaje claro en alemán
- ✅ Nombre de la tienda personalizado
- ✅ Mensaje de disculpa
- ✅ Caja informativa con reloj
- ✅ No se muestran productos
- ✅ No se puede añadir al carrito

## 🔄 Flujo Completo

### 1. Usuario visita la tienda

```
http://localhost:3000/store/admin-vendly-s-store
```

### 2. Carga de información

```typescript
// app/store/[slug]/page.tsx
const response = await fetch(`http://localhost:5000/api/store/${slug}`)
const result = await response.json()

// Guarda isOpen en el store
setStore({
  name: result.data.name,
  isOpen: result.data.isOpen, // ✨ NUEVO
  ...
})
```

### 3. Dashboard verifica estado

```typescript
// components/user/Dashboard.tsx

if (!store) {
  // Mostrar "No hay tienda seleccionada"
} else if (store.isOpen === false) {
  // ✨ NUEVO: Mostrar pantalla de tienda cerrada
} else if (products.length === 0) {
  // Mostrar "No hay productos"
} else {
  // Mostrar productos
}
```

## 🎨 Estados de UI

### Casos de Uso

1. **Sin Tienda Seleccionada**
   - Icono: ShoppingBag gris
   - Mensaje: "Kein Geschäft ausgewählt"
   - Botón: "Jetzt scannen"

2. **Tienda Cerrada** ✨ NUEVO
   - Icono: ❌ grande naranja (animado)
   - Mensaje: "Geschäft geschlossen"
   - Info: "Entschuldigung, {nombre} ist zur Zeit geschlossen"
   - No muestra productos
   - No se puede comprar

3. **Tienda Abierta sin Productos**
   - Icono: StoreIcon gris
   - Mensaje: "Keine Produkte verfügbar"
   - Muestra barra de búsqueda

4. **Tienda Abierta con Productos**
   - Lista de productos
   - Barra de búsqueda
   - Botón de escanear QR

## 🧪 Probar la Funcionalidad

### 1. Cerrar una tienda desde el backend

```bash
# Usar el endpoint que creamos
curl -X PATCH http://localhost:5000/api/store/my-store/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": false}'
```

### 2. Abrir una tienda

```bash
curl -X PATCH http://localhost:5000/api/store/my-store/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": true}'
```

### 3. Verificar en la BD

```sql
-- Ver el estado de todas las tiendas
SELECT name, slug, "isOpen", "isActive" FROM "Store";
```

### 4. Visitar la tienda

```
# Tienda cerrada
http://localhost:3000/store/admin-vendly-s-store

# Verás la pantalla de "Geschäft geschlossen"
```

## 📱 Responsive Design

La pantalla de tienda cerrada es completamente responsive:

- ✅ Mobile: diseño vertical, texto centrado
- ✅ Desktop: mismo diseño pero con más espacio
- ✅ Ícono grande y visible
- ✅ Texto legible en todos los tamaños

## 🎯 Beneficios

1. **Mejor UX**: Los clientes saben que la tienda está cerrada
2. **Sin confusión**: No intentan agregar productos al carrito
3. **Profesional**: Mensaje claro y educado
4. **Automático**: Se actualiza basado en el campo `isOpen`
5. **Visual**: Ícono animado que llama la atención

## 🔄 Sincronización

### Estado en Backend

```
Store.isOpen = false
```

### Mostrado en Frontend

```
Pantalla de "Geschäft geschlossen"
```

### Si el admin abre la tienda

```
Store.isOpen = true
→ Se muestran los productos normalmente
```

## 📊 Logs de Debug

Si no funciona, revisa:

```javascript
// En app/store/[slug]/page.tsx
console.log('Store data:', result.data)
console.log('isOpen:', result.data.isOpen)

// En Dashboard.tsx
console.log('Store:', store)
console.log('isOpen:', store.isOpen)
```

## ✅ Checklist

- ✅ Store guarda isOpen
- ✅ Dashboard verifica isOpen
- ✅ Muestra pantalla si isOpen === false
- ✅ No muestra productos si está cerrada
- ✅ Icono animado
- ✅ Mensaje en alemán
- ✅ Responsive
- ✅ Sin errores de linter

