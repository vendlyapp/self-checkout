# Feature: Control de Estado de Tienda (isOpen)

## Descripción

Esta feature permite a los administradores de tiendas controlar si su tienda está abierta o cerrada para recibir pedidos. Es independiente del estado `isActive` que controla si la tienda está activa en el sistema.

## Cambios Implementados

### 1. Base de Datos

**Archivo:** `scripts/migrations/03_add_store_isopen.sql`

- Agrega columna `isOpen` BOOLEAN a la tabla `Store`
- Valor por defecto: `true` (tienda abierta)
- Crea índice para búsquedas rápidas

### 2. Service Layer

**Archivo:** `src/services/StoreService.js`

#### Nuevas funciones:

1. **`updateStoreStatus(ownerId, isOpen)`**
   - Actualiza solo el estado de apertura de la tienda
   - Recibe: `ownerId` (string), `isOpen` (boolean)
   - Retorna: Objeto con datos actualizados de la tienda

2. **`isStoreOpen(slug)`**
   - Verifica si una tienda está abierta por su slug
   - Útil para validar antes de permitir pedidos

#### Funciones modificadas:

- **`create()`**: Ahora acepta el campo `isOpen` al crear una tienda
- **`update()`**: Permite actualizar el campo `isOpen` junto con otros campos

### 3. Controller Layer

**Archivo:** `src/controllers/StoreController.js`

#### Nuevo método:

```javascript
async updateStoreStatus(req, res)
```

- Endpoint: `PATCH /api/store/my-store/status`
- Requiere autenticación
- Body: `{ "isOpen": true/false }`
- Validación: Verifica que `isOpen` sea boolean
- Retorna: Tienda actualizada con mensaje

#### Métodos modificados:

- **`updateMyStore()`**: Documentación actualizada para incluir `isOpen`

### 4. Routes

**Archivo:** `src/routes/storeRoutes.js`

#### Nueva ruta:

```
PATCH /api/store/my-store/status
```

- Autenticación: Requerida (bearerAuth)
- Documentación Swagger incluida
- Validación de tipo boolean para `isOpen`

## Ejecutar Migración

Para aplicar los cambios a la base de datos:

```bash
cd Backend
node scripts/run_migration.js
```

Esto ejecutará todas las migraciones pendientes, incluyendo la nueva migración `03_add_store_isopen.sql`.

## Uso de la API

### 1. Abrir Tienda

```bash
curl -X PATCH http://localhost:5000/api/store/my-store/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": true}'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "ownerId": "...",
    "name": "...",
    "isOpen": true,
    ...
  },
  "message": "Tienda abierta"
}
```

### 2. Cerrar Tienda

```bash
curl -X PATCH http://localhost:5000/api/store/my-store/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isOpen": false}'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "ownerId": "...",
    "name": "...",
    "isOpen": false,
    ...
  },
  "message": "Tienda cerrada"
}
```

### 3. Actualizar con Otros Campos

También puedes actualizar `isOpen` junto con otros campos usando:

```bash
curl -X PUT http://localhost:5000/api/store/my-store \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Tienda",
    "logo": "https://...",
    "isOpen": true
  }'
```

## Validaciones

- El campo `isOpen` debe ser tipo `boolean` (true/false)
- Solo el dueño de la tienda puede cambiar su estado
- Requiere autenticación válida
- La tienda debe existir

## Casos de Uso

### 1. Control de Horario
Un administrador puede cerrar su tienda cuando no está atendiendo y reabrirla cuando vuelve.

### 2. Pausa de Pedidos
Durante mantenimiento o eventos especiales, se puede cerrar temporalmente la tienda.

### 3. Integración con Frontend
El frontend puede mostrar un indicador visual cuando la tienda está cerrada y deshabilitar la funcionalidad de agregar al carrito.

## Consideraciones

- El campo `isOpen` es independiente de `isActive`
- `isActive=false`: Tienda desactivada del sistema (no visible)
- `isOpen=false`: Tienda visible pero cerrada (no acepta pedidos)
- Los pedidos existentes no se ven afectados por cambios en `isOpen`
- Se actualiza automáticamente el campo `updatedAt` al cambiar el estado

## Próximos Pasos (Opcionales)

1. Agregar horarios automáticos de apertura/cierre
2. Validar pedidos antes de procesarlos (verificar si tienda está abierta)
3. Notificaciones a clientes cuando intentan comprar en tienda cerrada
4. Historial de cambios de estado
5. Integración con Frontend para mostrar estado de la tienda

