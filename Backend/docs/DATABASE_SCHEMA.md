# Database Schema Documentation

Este documento describe la estructura completa de la base de datos de Vendly Checkout.

## Tablas Principales

### 1. User (Usuarios)
- `id` (text, NOT NULL, DEFAULT: gen_random_uuid()) - ID único del usuario
- `email` (text, NOT NULL) - Email del usuario
- `password` (text, NOT NULL) - Contraseña hasheada
- `name` (text, NOT NULL) - Nombre del usuario
- `role` (USER-DEFINED, NOT NULL, DEFAULT: 'CUSTOMER') - Rol del usuario (CUSTOMER, ADMIN, SUPER_ADMIN)
- `createdAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

### 2. Store (Tiendas)
- `id` (text, NOT NULL, DEFAULT: gen_random_uuid()) - ID único de la tienda
- `ownerId` (text, NOT NULL) - ID del propietario (FK a User)
- `name` (text, NOT NULL) - Nombre de la tienda
- `slug` (text, NOT NULL) - Slug único de la tienda (para URLs)
- `logo` (text) - URL del logo de la tienda
- `qrCode` (text) - Código QR de la tienda
- `isActive` (boolean, DEFAULT: true) - Estado activo/inactivo
- `isOpen` (boolean, DEFAULT: true) - Tienda abierta/cerrada
- `address` (text) - Dirección de la tienda
- `phone` (text) - Teléfono de la tienda
- `email` (text) - Email de la tienda
- `description` (text) - Descripción de la tienda
- `createdAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

### 3. Product (Productos)
- `id` (text, NOT NULL, DEFAULT: gen_random_uuid()) - ID único del producto
- `name` (text, NOT NULL) - Nombre del producto
- `description` (text, NOT NULL) - Descripción del producto
- `price` (numeric, NOT NULL) - Precio del producto
- `originalPrice` (numeric) - Precio original (si hay promoción)
- `category` (text, NOT NULL) - Nombre de la categoría
- `categoryId` (text) - ID de la categoría (FK a ProductCategory)
- `stock` (integer, NOT NULL, DEFAULT: 0) - Stock disponible
- `initialStock` (integer) - Stock inicial
- `barcode` (text) - Código de barras
- `sku` (text, NOT NULL) - SKU del producto
- `qrCode` (text) - Código QR del producto
- `tags` (ARRAY) - Array de tags
- `isNew` (boolean, DEFAULT: false) - Producto nuevo
- `isPopular` (boolean, DEFAULT: false) - Producto popular
- `isOnSale` (boolean, DEFAULT: false) - Producto en oferta
- `isActive` (boolean, DEFAULT: true) - Estado activo/inactivo
- `rating` (numeric) - Calificación del producto
- `reviews` (integer, DEFAULT: 0) - Número de reseñas
- `weight` (numeric) - Peso del producto
- `hasWeight` (boolean, DEFAULT: false) - Indica si tiene peso
- `dimensions` (jsonb) - Dimensiones del producto (JSON)
- `discountPercentage` (integer) - Porcentaje de descuento
- `image` (text) - URL de la imagen principal
- `images` (ARRAY) - Array de URLs de imágenes
- `currency` (text, DEFAULT: 'CHF') - Moneda
- `promotionTitle` (text) - Título de la promoción
- `promotionType` (text) - Tipo de promoción
- `promotionStartAt` (timestamp without time zone) - Inicio de promoción
- `promotionEndAt` (timestamp without time zone) - Fin de promoción
- `promotionBadge` (text) - Badge de promoción
- `promotionActionLabel` (text) - Label de acción de promoción
- `promotionPriority` (integer) - Prioridad de promoción
- `supplier` (text) - Proveedor
- `costPrice` (numeric) - Precio de costo
- `margin` (numeric) - Margen de ganancia
- `taxRate` (numeric) - Tasa de impuesto
- `expiryDate` (timestamp without time zone) - Fecha de expiración
- `location` (text) - Ubicación del producto
- `notes` (text) - Notas adicionales
- `ownerId` (text) - ID del propietario (FK a User)
- `barcodeImage` (text) - Imagen del código de barras
- `parentId` (text) - ID del producto padre (para variantes)
- `createdAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

### 4. ProductCategory (Categorías de Productos)
- `id` (text, NOT NULL, DEFAULT: gen_random_uuid()) - ID único de la categoría
- `name` (text, NOT NULL) - Nombre de la categoría
- `icon` (text) - Icono de la categoría
- `count` (integer, DEFAULT: 0) - Contador de productos
- `color` (text) - Color de la categoría
- `isActive` (boolean, NOT NULL, DEFAULT: true) - Estado activo/inactivo
- `createdAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

### 5. Order (Órdenes)
- `id` (text, NOT NULL, DEFAULT: gen_random_uuid()) - ID único de la orden
- `userId` (text, NOT NULL) - ID del usuario (FK a User)
- `total` (numeric, NOT NULL) - Total de la orden
- `createdAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

**Nota:** La tabla Order NO tiene columna `status`. Todas las órdenes se consideran como "completed" o "pending" según el contexto.

### 6. OrderItem (Items de Orden)
- `id` (text, NOT NULL, DEFAULT: gen_random_uuid()) - ID único del item
- `orderId` (text, NOT NULL) - ID de la orden (FK a Order)
- `productId` (text, NOT NULL) - ID del producto (FK a Product)
- `quantity` (integer, NOT NULL) - Cantidad
- `price` (numeric, NOT NULL) - Precio unitario
- `createdAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updatedAt` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

### 7. DiscountCode (Códigos de Descuento)
- `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - ID único del código
- `code` (character varying, NOT NULL) - Código de descuento
- `discount_type` (character varying, NOT NULL) - Tipo de descuento
- `discount_value` (numeric, NOT NULL) - Valor del descuento
- `max_redemptions` (integer, NOT NULL, DEFAULT: 100) - Máximo de redenciones
- `current_redemptions` (integer, NOT NULL, DEFAULT: 0) - Redenciones actuales
- `valid_from` (timestamp without time zone, NOT NULL) - Fecha de inicio
- `valid_until` (timestamp without time zone) - Fecha de fin
- `is_active` (boolean, NOT NULL, DEFAULT: true) - Estado activo/inactivo
- `owner_id` (uuid, NOT NULL) - ID del propietario (FK a User)
- `archived` (boolean, NOT NULL, DEFAULT: false) - Si está archivado
- `created_at` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (timestamp without time zone, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)

### 8. ActiveSession (Sesiones Activas)
- `id` (bigint, NOT NULL, DEFAULT: nextval) - ID único de la sesión
- `userId` (uuid) - ID del usuario
- `storeId` (uuid) - ID de la tienda
- `sessionId` (text) - ID de la sesión
- `role` (character varying, NOT NULL) - Rol del usuario
- `ip` (text) - Dirección IP
- `userAgent` (text) - User agent
- `lastSeen` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Última vez visto
- `createdAt` (timestamp with time zone, NOT NULL, DEFAULT: now())
- `updatedAt` (timestamp with time zone, NOT NULL, DEFAULT: now())

### 9. MigrationLog (Log de Migraciones)
- Tabla interna para rastrear migraciones de base de datos

## Relaciones

1. **Store → User**: Una tienda pertenece a un usuario (ownerId → User.id)
2. **Product → User**: Un producto pertenece a un usuario (ownerId → User.id)
3. **Product → ProductCategory**: Un producto pertenece a una categoría (categoryId → ProductCategory.id)
4. **Product → Product**: Un producto puede tener un padre (parentId → Product.id) para variantes
5. **Order → User**: Una orden pertenece a un usuario (userId → User.id)
6. **OrderItem → Order**: Un item pertenece a una orden (orderId → Order.id)
7. **OrderItem → Product**: Un item referencia un producto (productId → Product.id)
8. **DiscountCode → User**: Un código de descuento pertenece a un usuario (owner_id → User.id)

## Notas Importantes

1. **Productos con Variantes**: Los productos pueden tener variantes usando el campo `parentId`. El producto padre tiene `parentId = null`, y las variantes tienen `parentId` apuntando al ID del producto padre.

2. **Órdenes sin Status**: La tabla `Order` no tiene columna `status`. En las consultas, se debe usar un valor por defecto o lógica de negocio para determinar el estado.

3. **Naming Conventions**: 
   - Las tablas usan PascalCase con comillas dobles: `"Product"`, `"Order"`, etc.
   - Los campos usan camelCase con comillas dobles: `"ownerId"`, `"createdAt"`, etc.
   - Algunas tablas antiguas (DiscountCode) usan snake_case: `owner_id`, `created_at`, etc.

4. **Timestamps**: 
   - La mayoría de las tablas usan `timestamp without time zone`
   - ActiveSession usa `timestamp with time zone`

5. **IDs**: 
   - La mayoría de las tablas usan `text` con `gen_random_uuid()`
   - DiscountCode usa `uuid` directamente
   - ActiveSession usa `bigint` con secuencia

