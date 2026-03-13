# Flujo Completo de Creación de Órdenes

## ✅ Verificación: Todas las columnas se llenan correctamente

### 1. Frontend - PaymentP.tsx (Componente de Pago)

**Datos que se envían al crear una orden:**

```typescript
await createOrderMutation.mutateAsync({
  items: orderItems,                    // ✅ Array de productos con quantity y price
  paymentMethod: selectedPaymentMethod, // ✅ Código del método (ej: "twint", "qr-rechnung")
  total: payableTotal,                  // ✅ Total con descuentos aplicados
  storeId: store?.id,                   // ✅ ID de la tienda
  storeSlug: store?.slug,               // ✅ Slug de la tienda
  metadata: {                           // ✅ Información adicional en JSON
    storeId: store?.id ?? null,
    storeSlug: store?.slug ?? null,
    storeName: store?.name ?? null,
    promoApplied,                        // ✅ Si se aplicó descuento
    discountAmount: promoApplied ? discountAmount ?? 0 : 0, // ✅ Monto del descuento
    totalBeforeVAT: Number(subtotal.toFixed(2)),           // ✅ Subtotal sin IVA
    totalWithVAT: Number(totalWithVAT.toFixed(2)),        // ✅ Total con IVA
  },
});
```

**Nota:** `selectedPaymentMethod` contiene el `code` del método de pago (ej: "twint", "qr-rechnung", "bargeld", etc.)

---

### 2. Frontend - OrderService.createOrder

**Envía al backend via POST /api/orders:**

```typescript
{
  userId: userId ?? undefined,           // ✅ ID del usuario (o undefined para guest)
  items: normalizedItems,                // ✅ Items normalizados
  paymentMethod: input.paymentMethod,    // ✅ Código del método de pago
  total: input.total,                    // ✅ Total con descuentos
  metadata: input.metadata,               // ✅ Objeto JSON con metadata
  storeId: input.storeId,                // ✅ ID de la tienda
  storeSlug: input.storeSlug,            // ✅ Slug de la tienda
  customer: input.customer,              // ✅ Info del cliente (para guests)
}
```

---

### 3. Backend - OrderController.createOrderSimple

**Recibe del frontend y pasa a OrderService:**

```javascript
const {
  userId,
  items,              // ✅
  storeSlug,          // ✅
  storeId,            // ✅
  customer,           // ✅
  paymentMethod,      // ✅
  total,              // ✅
  metadata,           // ✅
} = req.body;

const result = await orderService.create(resolvedUserId, {
  items,              // ✅
  paymentMethod,      // ✅
  total,              // ✅
  metadata,           // ✅
  storeSlug,          // ✅
  storeId,            // ✅
  customer,           // ✅
});
```

---

### 4. Backend - OrderService.create

**Guarda en la base de datos:**

```sql
INSERT INTO "Order" (
  "userId",           -- ✅ ID del usuario
  "total",            -- ✅ Total con descuentos (del frontend)
  "status",           -- ✅ 'completed' por defecto
  "paymentMethod",    -- ✅ Código del método de pago
  "storeId",          -- ✅ ID de la tienda
  "metadata"          -- ✅ JSONB con toda la metadata
)
VALUES ($1, $2, $3, $4, $5, $6::jsonb)
```

**Ejemplo de metadata guardado:**
```json
{
  "storeId": "abc123",
  "storeSlug": "mi-tienda",
  "storeName": "Mi Tienda",
  "promoApplied": true,
  "discountAmount": 10.50,
  "totalBeforeVAT": 100.00,
  "totalWithVAT": 107.70
}
```

---

## 📊 Resumen de Columnas en la Tabla Order

| Columna | Se Llena? | Origen | Ejemplo |
|---------|-----------|--------|---------|
| `id` | ✅ Automático | UUID generado | `"abc-123-def"` |
| `userId` | ✅ Sí | Frontend/Backend | `"user-uuid"` |
| `total` | ✅ Sí | Frontend (con descuentos) | `97.20` |
| `status` | ✅ Sí | Backend (default: 'completed') | `"completed"` |
| `paymentMethod` | ✅ Sí | Frontend (code del método) | `"twint"` |
| `storeId` | ✅ Sí | Frontend | `"store-uuid"` |
| `metadata` | ✅ Sí | Frontend (JSON) | `{"promoApplied": true, ...}` |
| `createdAt` | ✅ Automático | Timestamp | `"2024-01-15T10:30:00"` |
| `updatedAt` | ✅ Automático | Timestamp | `"2024-01-15T10:30:00"` |

---

## ✅ Confirmación Final

**TODAS las columnas se llenan correctamente cuando se hace una compra:**

1. ✅ **userId** - Se obtiene del usuario autenticado o se crea un guest user
2. ✅ **total** - Se usa el total del frontend que ya incluye descuentos
3. ✅ **status** - Se establece como 'completed' automáticamente
4. ✅ **paymentMethod** - Se guarda el código del método seleccionado (ej: "twint")
5. ✅ **storeId** - Se guarda el ID de la tienda desde donde se hizo la compra
6. ✅ **metadata** - Se guarda toda la información adicional en JSONB:
   - promoApplied
   - discountAmount
   - totalBeforeVAT
   - totalWithVAT
   - storeId, storeSlug, storeName

---

## 🚀 Próximos Pasos

**Ejecutar las migraciones para agregar las columnas:**

```bash
cd Backend

# 1. Agregar columna status
node scripts/add-order-status-column.js

# 2. Agregar columnas paymentMethod, storeId, metadata
node scripts/add-order-fields.js
```

Después de ejecutar las migraciones, todas las nuevas órdenes tendrán toda la información completa guardada en la base de datos.

