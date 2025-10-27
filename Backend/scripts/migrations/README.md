# Migraciones de Base de Datos

Este directorio contiene las migraciones SQL para actualizar la estructura de la base de datos.

## Ejecutar Migraciones

Para ejecutar todas las migraciones pendientes:

```bash
node scripts/run_migration.js
```

Para ejecutar una migración específica:

```bash
node -e "const { runMigration } = require('./scripts/run_migration.js'); runMigration('./scripts/migrations/NOMBRE_MIGRACION.sql')"
```

## Migraciones Disponibles

### 01_optimize_product_table.sql
- Agrega índices y optimizaciones a la tabla de productos
- Mejora el rendimiento de consultas

### 02_add_multi_tenant.sql
- Agrega la tabla `Store` para sistema multi-tenant
- Relaciona productos con sus dueños
- Sistema de slugs únicos para tiendas

### 03_add_store_isopen.sql
- Agrega campo `isOpen` a la tabla `Store`
- Permite controlar si una tienda está abierta o cerrada
- Indica si la tienda puede recibir pedidos

## Orden de Ejecución

Las migraciones deben ejecutarse en orden numérico:
1. Primero ejecuta `01_optimize_product_table.sql`
2. Luego `02_add_multi_tenant.sql`
3. Finalmente `03_add_store_isopen.sql`

El script `run_migration.js` automáticamente ejecuta las migraciones en orden.

## Notas

- Todas las migraciones son idempotentes (pueden ejecutarse múltiples veces sin errores)
- Usan `IF NOT EXISTS` y `IF EXISTS` donde es apropiado
- No afectan datos existentes

