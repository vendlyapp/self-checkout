# Scripts de Vendly Checkout Backend

Esta carpeta contiene todos los scripts de utilidad para el backend de Vendly Checkout.

## 📁 Archivos Disponibles

### 🧪 Testing
- **`test_crud.js`** - Pruebas básicas del CRUD de productos
- **`test_all_endpoints.js`** - Suite completa de pruebas de todos los endpoints

### 🗄️ Base de Datos
- **`setup_database.js`** - Configuración inicial de la base de datos
- **`clean_database.js`** - Limpieza de datos y tablas

### 🛠️ Utilidades
- **`utils.js`** - Utilidades generales y estadísticas

## 🚀 Uso desde package.json

Todos los scripts están configurados en `package.json` para fácil acceso:

```bash
# Testing
npm test                    # Pruebas básicas CRUD
npm run test:all           # Pruebas completas de endpoints

# Base de datos
npm run db:setup           # Configurar base de datos
npm run db:clean           # Limpiar base de datos
npm run db:check           # Verificar estado de base de datos

# Utilidades
npm run utils:stats        # Estadísticas completas
npm run utils:recent       # Productos recientes
npm run utils:health       # Salud de la base de datos
```

## 📋 Comandos Detallados

### Testing

#### `npm test` - Pruebas CRUD Básicas
```bash
npm test
```
- Prueba conexión a base de datos
- Crea, lee, actualiza y elimina productos
- Verifica estadísticas y búsqueda
- Limpia datos de prueba al final

#### `npm run test:all` - Pruebas Completas
```bash
npm run test:all
```
- Prueba todos los endpoints de la API
- Incluye productos, categorías, usuarios y órdenes
- Verifica documentación Swagger
- Genera reporte completo de pruebas

### Base de Datos

#### `npm run db:setup` - Configurar Base de Datos
```bash
npm run db:setup
```
- Ejecuta `setup_database.sql`
- Crea todas las tablas y tipos
- Verifica que las tablas se crearon correctamente

#### `npm run db:clean` - Limpiar Base de Datos
```bash
npm run db:clean --data     # Solo limpiar datos
npm run db:clean --tables   # Eliminar tablas
npm run db:clean --all      # Limpieza completa
```

#### `npm run db:check` - Verificar Estado
```bash
npm run db:check
```
- Verifica que todas las tablas existan
- Muestra estado actual de la base de datos

### Utilidades

#### `npm run utils:stats` - Estadísticas Completas
```bash
npm run utils:stats
```
- Estadísticas de usuarios, categorías, productos y órdenes
- Ingresos totales y promedios
- Resumen completo del sistema

#### `npm run utils:recent` - Productos Recientes
```bash
npm run utils:recent
npm run utils:recent --limit=10
```
- Muestra los últimos productos creados
- Opción de limitar cantidad de resultados

#### `npm run utils:health` - Salud de Base de Datos
```bash
npm run utils:health
```
- Verifica conexión a Supabase
- Comprueba existencia de todas las tablas
- Reporte de salud del sistema

## 🔧 Desarrollo

### Agregar Nuevos Scripts

1. Crear archivo en `scripts/`
2. Agregar comando en `package.json`
3. Documentar en este README

### Estructura de Scripts

```javascript
// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función principal
async function main() {
  // Tu código aquí
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };
```

## 🐛 Troubleshooting

### Error de Conexión
```bash
# Verificar variables de entorno
cat .env

# Probar conexión
npm run utils:health
```

### Error de Tablas
```bash
# Verificar estado
npm run db:check

# Recrear tablas
npm run db:clean --all
npm run db:setup
```

### Error de Permisos
```bash
# Verificar permisos de archivos
ls -la scripts/

# Dar permisos de ejecución
chmod +x scripts/*.js
```

## 📝 Notas

- Todos los scripts usan colores para mejor legibilidad
- Los scripts de limpieza incluyen confirmaciones de seguridad
- Los scripts de testing limpian datos de prueba automáticamente
- Los scripts de utilidades son de solo lectura (no modifican datos)
