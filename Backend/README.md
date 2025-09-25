# Vendly Checkout Backend API

Backend API para el sistema de checkout de Vendly, construido con Node.js, Express y PostgreSQL usando SQL directo.

## 🚀 Características

- **SQL Directo**: Sin ORM, consultas SQL puras para máximo rendimiento
- **PostgreSQL**: Base de datos robusta y escalable
- **Supabase**: Hosting de base de datos en la nube
- **CRUD Completo**: Operaciones completas para productos, usuarios, órdenes y categorías
- **Validación**: Middleware de validación robusto
- **Documentación**: Swagger/OpenAPI integrado
- **Arquitectura Limpia**: Patrón de capas (Controllers, Services, Routes)

## 📋 Requisitos

- Node.js 18+
- PostgreSQL (Supabase)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
DATABASE_URL=postgresql://username:password@host:port/database
PORT=3000
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
```

4. **Configurar base de datos**
```bash
# Ejecutar el script SQL en Supabase
# Copiar y pegar el contenido de setup_database.sql en el SQL Editor de Supabase
```

5. **Iniciar servidor**
```bash
npm run dev
```

## 🗄️ Base de Datos

### Tablas Principales

- **User**: Usuarios del sistema (ADMIN, CUSTOMER)
- **Product**: Productos con 50+ campos para tienda online
- **ProductCategory**: Categorías de productos
- **Order**: Órdenes de compra
- **OrderItem**: Items dentro de las órdenes

### Scripts SQL

- `setup_database.sql`: Script completo para crear todas las tablas
- `clean_database.js`: Script para limpiar la base de datos
- `test_crud.js`: Script de prueba del CRUD

## 📚 API Endpoints

### Health Check
- `GET /health` - Estado del servidor

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/available` - Productos disponibles
- `GET /api/products/stats` - Estadísticas de productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `PATCH /api/products/:id/stock` - Actualizar stock
- `DELETE /api/products/:id` - Eliminar producto

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `GET /api/users/stats` - Estadísticas de usuarios
- `POST /api/users` - Crear usuario
- `POST /api/users/admin` - Crear administrador
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Órdenes
- `GET /api/orders` - Listar todas las órdenes (admin)
- `GET /api/orders/:id` - Obtener orden por ID
- `GET /api/orders/stats` - Estadísticas de órdenes
- `GET /api/orders/recent` - Órdenes recientes
- `GET /api/orders/user/:userId` - Órdenes de usuario
- `POST /api/orders` - Crear orden simplificada
- `DELETE /api/orders/:id` - Eliminar orden

### Categorías
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría por ID
- `GET /api/categories/stats` - Estadísticas de categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría
- `PATCH /api/categories/update-counts` - Actualizar contadores

## 🔧 Estructura del Proyecto

```
Backend/
├── src/
│   ├── controllers/     # Controladores de rutas
│   ├── services/       # Lógica de negocio
│   ├── routes/         # Definición de rutas
│   ├── middleware/     # Middleware personalizado
│   └── types/          # Constantes y tipos
├── lib/
│   └── database.js     # Cliente PostgreSQL
├── config/
│   └── swagger.js      # Configuración Swagger
├── app.js              # Configuración Express
├── server.js           # Servidor principal
└── package.json
```

## 🧪 Testing

### Probar CRUD básico
```bash
node test_crud.js
```

### Probar endpoints específicos
```bash
# Health check
curl http://localhost:3000/health

# Listar productos
curl http://localhost:3000/api/products

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Test",
    "description": "Descripción del producto",
    "price": 10.50,
    "category": "Test",
    "stock": 100,
    "sku": "TEST-001"
  }'
```

## 📖 Documentación API

La documentación completa está disponible en:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Postman Collection**: `Vendly_Checkout_API.postman_collection.json`

## 🔒 Seguridad

- Validación de entrada en todos los endpoints
- Sanitización de datos SQL (prepared statements)
- Hash de contraseñas con bcrypt
- Validación de UUIDs
- CORS configurado

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com
```

### Comandos de Producción
```bash
npm start
```

## 🐛 Troubleshooting

### Error de conexión a base de datos
1. Verificar `DATABASE_URL` en `.env`
2. Verificar que Supabase esté accesible
3. Ejecutar `node test_crud.js` para probar conexión

### Puerto en uso
```bash
# Encontrar proceso usando puerto 3000
lsof -i :3000

# Terminar proceso
kill -9 <PID>
```

### Limpiar base de datos
```bash
node clean_database.js
```

## 📝 Changelog

### v2.0.0 - SQL Directo
- ✅ Eliminado Prisma ORM
- ✅ Implementado SQL directo con `pg`
- ✅ Mejorado rendimiento de consultas
- ✅ Simplificado manejo de errores
- ✅ Actualizada documentación

### v1.0.0 - Versión Inicial
- ✅ CRUD básico con Prisma
- ✅ Autenticación de usuarios
- ✅ Sistema de órdenes
- ✅ Documentación Swagger

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: support@vendly.com
- Issues: [GitHub Issues](https://github.com/vendly/checkout/issues)

---

**Desarrollado con ❤️ para Vendly**
