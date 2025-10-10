# 🛠️ Scripts de Vendly Checkout

Scripts para gestión completa de base de datos y utilidades.

## ⚡ Quick Start

```bash
# 1. Primera instalación
npm run db:setup      # Crear tablas
npm run db:seed       # Cargar 20 productos con QR
npm test              # Verificar funcionamiento

# 2. Si ya existe la BD
npm run db:migrate    # Aplicar optimizaciones
npm run db:seed       # Recargar productos

# 3. Desarrollo diario
npm run utils:stats   # Ver estadísticas
npm test              # Probar CRUD
```

## 📋 Comandos Disponibles

### Base de Datos

| Comando | Descripción |
|---------|-------------|
| `npm run db:setup` | Crear todas las tablas y configuración inicial |
| `npm run db:migrate` | Aplicar migraciones (actualizaciones de schema) |
| `npm run db:seed` | Cargar 20 productos realistas con QR codes |
| `npm run db:check` | Verificar que todas las tablas existan |
| `npm run db:clean` | Limpiar datos (interactivo con confirmación) |
| `npm run db:clean-all` | Limpiar todo sin confirmación ⚠️ |

### Testing

| Comando | Descripción |
|---------|-------------|
| `npm test` | Test completo del CRUD + QR generation |

### Utilidades

| Comando | Descripción |
|---------|-------------|
| `npm run utils:stats` | Estadísticas completas de la BD |
| `npm run utils:recent` | Últimos productos creados |
| `npm run utils:categories` | Información de categorías |
| `npm run utils:health` | Estado de salud del sistema |

## 🗂️ Estructura

```
scripts/
├── migrations/
│   └── 01_optimize_product_table.sql  # Optimización QR/SKU/Stock
├── setup_database.sql                 # Schema completo optimizado
├── setup_database.js                  # Ejecutor de setup
├── run_migration.js                   # Ejecutor de migraciones
├── seed_realistic_products.js         # Seed 20 productos + QR
├── clean_database.js                  # Limpieza de datos
├── test_crud.js                       # Tests CRUD completos
├── utils.js                           # Estadísticas y utilidades
└── README.md                          # Esta documentación
```

**Total: 8 scripts esenciales**

## 🔧 Configuración de Productos

### Auto-generación al Crear
- ✅ **SKU**: `SKU-{timestamp}-{index}` si no se proporciona
- ✅ **Stock**: 999 (ilimitado) por defecto
- ✅ **QR Code**: Siempre auto-generado con ID del producto
- ✅ **ID**: UUID automático

### Datos del Seed (20 productos)

El comando `npm run db:seed` crea:
- 🥖 **4 Brot**: Vollkornbrot, Baguette, Zopf, Brötchen
- 🥕 **5 Obst & Gemüse**: Äpfel, Tomaten, Bananen, Karotten, Salat
- 🥛 **4 Milchprodukte**: Emmentaler, Jogurt, Milch, Mozzarella
- 🥐 **4 Gebäck**: Croissant, Schokoladecroissant, Apfelstrudel
- 🥤 **3 Getränke**: Mineralwasser, Orangensaft, Eistee

Características:
- ✅ Nombres en alemán
- ✅ Precios CHF realistas
- ✅ Stock 999 (todos)
- ✅ QR único por producto
- ✅ Algunos con descuentos
- ✅ Tags: isNew, isPopular, isOnSale

### Schema de Tabla Product

```sql
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),        -- Para descuentos
    "category" TEXT NOT NULL,
    "categoryId" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 999,  -- ← Ilimitado
    "sku" TEXT,                            -- ← Opcional, auto-gen
    "qrCode" TEXT,                         -- ← Auto-generado
    "barcode" TEXT,                        -- ← Opcional
    "isActive" BOOLEAN DEFAULT true,
    "isNew" BOOLEAN DEFAULT false,
    "isPopular" BOOLEAN DEFAULT false,
    "isOnSale" BOOLEAN DEFAULT false,
    "rating" DECIMAL(3,2),
    "reviews" INTEGER DEFAULT 0,
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- ... más campos de promoción y gestión
);
```

### Migraciones Aplicadas

**`01_optimize_product_table.sql`:**
1. ✅ Removido UNIQUE de `qrCode` (Data URL muy grande para índice btree)
2. ✅ SKU ahora opcional (NOT NULL removido)
3. ✅ Stock default cambiado de 0 → 999
4. ✅ Removido UNIQUE de `barcode`

### Generación de QR Code

**Librería:** `qrcode` npm package  
**Ubicación:** `src/utils/qrCodeGenerator.js`  
**Contenido:** ID del producto (UUID)  
**Formato:** Data URL PNG base64  
**Tamaño:** 256x256px  
**Error Correction:** L (baja, más pequeño)

**Proceso:**
1. Producto se crea en BD
2. QR se genera con `qrCodeGenerator.generateQRCode(id, name)`
3. QR se actualiza en columna `qrCode`
4. Producto completo retorna al frontend

## 🎯 Flujo Completo de Producto

```
Frontend: Crear Producto
    ↓
Backend: Validar datos
    ↓
Backend: INSERT en tabla Product
    ↓
Backend: Generar QR Code (256x256 PNG)
    ↓
Backend: UPDATE qrCode en Product
    ↓
Frontend: Recibe producto con QR
    ↓
Frontend: Puede visualizar y descargar QR
```

## 🆘 Troubleshooting

### Error: "index row size exceeds btree maximum"
✅ **Solucionado** con migración `01_optimize_product_table.sql`

### Error: "SKU es requerido"
✅ **Solucionado**: SKU ahora es opcional y auto-generado

### Error: "cannot connect to database"
- Verifica `.env` tiene `DATABASE_URL`
- Verifica conexión a Supabase

### Productos sin QR
- Ejecuta `npm run db:seed` para regenerar
- Nuevos productos siempre incluyen QR

## 📝 Notas

- ✅ Migraciones no pierden datos
- ✅ Seed reemplaza productos existentes
- ✅ Tests no afectan datos reales
- ✅ QR se genera en cada creación
- ⚠️ `db:clean-all` elimina TODO

---

**Vendly Checkout Backend v2.0**  
Última actualización: 10/10/2025
