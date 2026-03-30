# Backend — Documentación Técnica

**Framework:** Express.js 4.x
**Runtime:** Node.js >= 18
**Lenguaje:** JavaScript
**Base de datos:** PostgreSQL (via Supabase)

URL base: `http://localhost:5000` | Producción: Fly.io

---

## Arquitectura en capas

```
Request
  → Route (/api/products)
  → Middleware (auth, validación)
  → Controller (maneja req/res)
  → Service (lógica de negocio)
  → Database (pg — SQL directo)
  → Response
```

---

## Middlewares globales (app.js)

| Middleware | Propósito |
|-----------|-----------|
| `helmet` | Headers de seguridad HTTP (HSTS, CSP, X-Frame-Options, etc.) |
| `compression` | Gzip en todas las respuestas (60-80% menos datos) |
| `express-rate-limit` | 500 requests/minuto por IP (global) |
| `morgan` | Logging de requests HTTP |
| `cors` | Permite origen del frontend (`FRONTEND_URL`) |
| `authMiddleware` | Verifica JWT de Supabase en rutas protegidas |
| `errorHandler` | Captura global de errores (último en la cadena) |

### `authMiddleware` (src/middleware/authMiddleware.js)

```
1. Extrae token del header: Authorization: Bearer <token>
2. Verifica token con Supabase Admin Client
3. Consulta caché en memoria (TTL 60s) — evita queries repetidas
4. Si usuario no existe en BD → lo crea automáticamente
5. Si es ADMIN sin tienda → crea tienda automática con slug único
6. Agrega req.user = { id, email, role, storeId, storeName, ... }
```

---

## Endpoints de la API

### Auth — `/api/auth`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | No | Registro de usuario nuevo |
| POST | `/api/auth/signin` | No | Inicio de sesión |
| GET | `/api/auth/profile` | Sí | Perfil del usuario autenticado |

### Productos — `/api/products`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/products` | Sí | Listar productos del usuario |
| GET | `/api/products/:id` | Sí | Detalle de un producto |
| POST | `/api/products` | Sí | Crear producto (genera QR + barcode automáticamente) |
| PUT | `/api/products/:id` | Sí | Actualizar producto |
| DELETE | `/api/products/:id` | Sí | Eliminar producto |
| GET | `/api/products/qr/:qrCode` | No | Obtener producto por código QR (vista cliente) |

### Categorías — `/api/categories`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/categories` | Sí | Listar categorías |
| POST | `/api/categories` | Sí | Crear categoría |
| PUT | `/api/categories/:id` | Sí | Actualizar categoría |
| DELETE | `/api/categories/:id` | Sí | Eliminar categoría |

### Tienda — `/api/store`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/store/my-store` | Sí | Obtener tienda del usuario autenticado |
| GET | `/api/store/:slug` | No | Tienda pública por slug (vista cliente) |
| PUT | `/api/store/:id` | Sí | Actualizar datos de la tienda |

### Órdenes — `/api/orders`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/orders` | Sí* | Crear orden (valida stock, aplica descuentos) |
| GET | `/api/orders` | Sí | Listar órdenes del usuario |
| GET | `/api/orders/:id` | Sí | Detalle de una orden |
| GET | `/api/orders/stats` | Sí | Estadísticas de órdenes |

*Los clientes también pueden crear órdenes con autenticación de cliente.

### Facturas — `/api/invoices`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/invoices` | Sí | Generar factura para una orden |
| GET | `/api/invoices` | Sí | Listar facturas |
| GET | `/api/invoices/:id` | Sí | Detalle de factura |

### Descuentos — `/api/discount-codes`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/discount-codes` | Sí | Listar códigos de descuento |
| POST | `/api/discount-codes` | Sí | Crear código de descuento |
| PUT | `/api/discount-codes/:id` | Sí | Actualizar código |
| DELETE | `/api/discount-codes/:id` | Sí | Eliminar código |
| POST | `/api/discount-codes/validate` | No | Validar un código de descuento |

### Métodos de pago — `/api/payment-methods`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/payment-methods` | Sí | Listar métodos de pago de la tienda |
| PUT | `/api/payment-methods` | Sí | Actualizar métodos de pago |

### Clientes — `/api/customers`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/customers` | Sí | Listar clientes de la tienda |
| GET | `/api/customers/:id` | Sí | Detalle de cliente |

### Analytics — (via AnalyticsController)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/analytics` | Sí | Métricas generales de la tienda |

### Super Admin — `/api/super-admin`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/super-admin/users` | SUPER_ADMIN | Listar todos los usuarios |
| GET | `/api/super-admin/stores` | SUPER_ADMIN | Listar todas las tiendas |
| GET | `/api/super-admin/analytics` | SUPER_ADMIN | Analytics de la plataforma |
| ... | ... | SUPER_ADMIN | Gestión completa de la plataforma |

---

## Base de datos — Esquema

### Tabla `users`

```sql
id          UUID PRIMARY KEY
email       TEXT UNIQUE NOT NULL
name        TEXT
role        ENUM('ADMIN', 'CUSTOMER', 'SUPER_ADMIN') DEFAULT 'CUSTOMER'
password    TEXT  -- hash bcrypt o 'oauth' para Google
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP
```

### Tabla `stores`

```sql
id          UUID PRIMARY KEY
owner_id    UUID REFERENCES users(id)
name        TEXT NOT NULL
slug        TEXT UNIQUE NOT NULL  -- identificador público de la tienda
logo        TEXT  -- URL del logo
is_open     BOOLEAN DEFAULT true
address     TEXT
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP
```

### Tabla `products`

```sql
id                  UUID PRIMARY KEY
owner_id            UUID REFERENCES users(id)
name                TEXT NOT NULL
description         TEXT
price               DECIMAL(10,2)
original_price      DECIMAL(10,2)  -- precio antes de descuento
category            TEXT
category_id         UUID REFERENCES categories(id)
stock               INTEGER DEFAULT 0
initial_stock       INTEGER
barcode             TEXT
sku                 TEXT
qr_code             TEXT  -- URL o código QR generado
barcode_image       TEXT  -- URL imagen del barcode
images              TEXT[]  -- array de URLs
tags                TEXT[]
is_active           BOOLEAN DEFAULT true
is_new              BOOLEAN DEFAULT false
is_popular          BOOLEAN DEFAULT false
is_on_sale          BOOLEAN DEFAULT false
promotion_title     TEXT
discount_percentage DECIMAL(5,2)
dimensions          JSONB  -- { width, height, depth, weight }
supplier            TEXT
cost_price          DECIMAL(10,2)
margin              DECIMAL(5,2)
tax_rate            DECIMAL(5,2)
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP
```

### Tabla `categories`

```sql
id          UUID PRIMARY KEY
owner_id    UUID REFERENCES users(id)
name        TEXT NOT NULL
description TEXT
icon        TEXT  -- nombre del icono (Lucide)
color       TEXT  -- hex color
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP DEFAULT NOW()
updated_at  TIMESTAMP
```

### Tabla `orders`

```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
store_id        UUID REFERENCES stores(id)
total           DECIMAL(10,2)  -- total final con descuentos
status          ENUM('pending','processing','completed','cancelled')
payment_method  TEXT  -- 'twint', 'bargeld', 'kreditkarte', etc.
metadata        JSONB  -- { promoApplied, discountAmount, promoCode, totalWithVAT, ... }
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP
```

### Tabla `order_items`

```sql
id          UUID PRIMARY KEY
order_id    UUID REFERENCES orders(id)
product_id  UUID REFERENCES products(id)
quantity    INTEGER NOT NULL
price       DECIMAL(10,2)  -- precio al momento de la venta (snapshot)
created_at  TIMESTAMP DEFAULT NOW()
```

### Tabla `invoices`

```sql
id              UUID PRIMARY KEY
order_id        UUID REFERENCES orders(id)
invoice_number  TEXT UNIQUE  -- ej: INV-2026-001
status          TEXT DEFAULT 'generated'
tax_amount      DECIMAL(10,2)
total_with_tax  DECIMAL(10,2)
customer_data   JSONB  -- nombre, email, dirección del cliente
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP
```

### Relaciones

```
users 1──N stores        (un usuario puede tener 1 tienda como ADMIN)
users 1──N products      (productos pertenecen al owner)
users 1──N orders        (órdenes del usuario)
stores 1──N products     (productos de la tienda)
orders 1──N order_items  (ítems de cada orden)
products 1──N order_items
orders 1──1 invoices
```

---

## Flujo de creación de una orden

```
1. Cliente en /store/[slug]/cart → presiona "Bezahlen"
2. Frontend → POST /api/orders con:
   {
     items: [{ productId, quantity, price }],
     paymentMethod: 'twint',
     storeId: '...',
     promoCode: 'VERANO10'  // opcional
   }
3. OrderService:
   a. Valida que todos los productos existen y están activos
   b. Verifica stock suficiente para cada ítem
   c. Si hay promoCode → valida con DiscountCodeService
   d. Calcula total con descuento
   e. BEGIN TRANSACTION
   f. INSERT INTO orders
   g. INSERT INTO order_items (para cada ítem)
   h. UPDATE products SET stock = stock - quantity (para cada ítem)
   i. COMMIT
4. Backend → { success: true, data: { order, items } }
5. Frontend → navega a confirmación → limpia carrito
```

---

## Estructura de carpetas

```
Backend/
├── src/
│   ├── routes/         → Definición de endpoints (12 archivos)
│   ├── controllers/    → Manejo de req/res (13 archivos)
│   ├── services/       → Lógica de negocio (13 archivos)
│   ├── middleware/     → auth, errorHandler, validation
│   ├── schemas/        → Zod schemas de validación
│   └── utils/          → barcodeGenerator, qrCodeGenerator, rateLimiter
├── lib/
│   └── database.js     → Cliente PostgreSQL (pool de conexiones)
├── config/
│   └── swagger.js      → Configuración OpenAPI
├── scripts/            → Scripts de setup y seed
├── app.js              → Configuración de Express + middlewares
└── server.js           → Punto de entrada (listen)
```

---

## Servicios más importantes

| Servicio | Tamaño | Responsabilidades clave |
|---------|--------|------------------------|
| `OrderService.js` | ~41KB | Crear órdenes, validar stock, aplicar descuentos, transacciones |
| `SuperAdminService.js` | ~28KB | Gestión completa de la plataforma multi-tenant |
| `InvoiceService.js` | ~20KB | Generación de facturas, numeración, PDF |
| `DiscountCodeService.js` | ~16KB | Validación, aplicación y gestión de códigos de descuento |
| `ProductService.js` | variable | CRUD + generación automática de QR y barcode |

---

## Respuesta estándar de la API

```javascript
// Éxito
{ success: true, data: { ... } }

// Error
{ success: false, error: "Mensaje descriptivo" }

// Error de validación
{ success: false, error: "Validation error", details: [...] }
```

---

## Documentación Swagger

Disponible en `http://localhost:5000/api-docs` cuando el backend está corriendo.
