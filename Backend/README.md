# 🛒 Vendly Checkout Backend API

Backend API para el sistema de checkout de Vendly, construido con Node.js, Express, PostgreSQL y Supabase Auth.

## 🚀 Características

- ✅ **Autenticación con Supabase Auth**: Sistema completo de login/register con JWT
- ✅ **SQL Directo**: Sin ORM, consultas SQL puras para máximo rendimiento
- ✅ **PostgreSQL + Supabase**: Base de datos robusta en la nube
- ✅ **CRUD Completo**: Productos, Usuarios, Órdenes y Categorías
- ✅ **Middleware de Protección**: Rutas protegidas con JWT
- ✅ **Sistema de Roles**: ADMIN y CUSTOMER
- ✅ **Validación**: Middleware de validación robusto
- ✅ **Documentación**: Swagger/OpenAPI integrado
- ✅ **Arquitectura Limpia**: Patrón de capas (Controllers, Services, Routes)

---

## 📋 Requisitos

- Node.js 18+
- Cuenta de Supabase
- npm o yarn

---

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd Backend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz:

```env
# Supabase Database
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-1-eu-central-2.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xxxxx:password@aws-1-eu-central-2.pooler.supabase.com:5432/postgres

# Supabase Auth
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Obtener credenciales:**
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Settings** → **API**:
   - Copia **Project URL** → `SUPABASE_URL`
   - Copia **anon public** key → `SUPABASE_ANON_KEY`
4. **Settings** → **Database**:
   - Copia **Connection String** → `DATABASE_URL`

### 3. Configurar base de datos

```bash
# Opción 1: Usar el script automatizado
node scripts/setup_database.js

# Opción 2: Ejecutar SQL manualmente
# Copia el contenido de scripts/setup_database.sql
# Pégalo en Supabase SQL Editor y ejecuta
```

### 4. Validar configuración

```bash
node scripts/validate_auth.js
```

**Resultado esperado:**
```
✅ Pruebas exitosas: 20/20
📊 Porcentaje: 100%
🎉 ¡VALIDACIÓN COMPLETA!
```

### 5. Iniciar servidor

```bash
npm start
```

Deberías ver:
```
✅ Conexión a Supabase establecida
✅ Base de datos conectada exitosamente!
🚀 Servidor corriendo en http://localhost:5000
📚 Documentación API: http://localhost:5000/api-docs
```

---

## 🔐 Sistema de Autenticación

### Endpoints Disponibles

| Endpoint | Método | Descripción | Protegido |
|----------|--------|-------------|-----------|
| `/api/auth/register` | POST | Registrar usuario | ❌ |
| `/api/auth/login` | POST | Iniciar sesión | ❌ |
| `/api/auth/verify` | GET | Verificar token | ❌ |
| `/api/auth/profile` | GET | Obtener perfil | ✅ |
| `/api/auth/change-password` | PUT | Cambiar contraseña | ✅ |
| `/api/auth/logout` | POST | Cerrar sesión | ✅ |
| `/api/auth/forgot-password` | POST | Reset password | ❌ |

### Ejemplo de Uso

**Registrar usuario:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendly.ch",
    "password": "123456",
    "name": "Admin Vendly",
    "role": "ADMIN"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendly.ch",
    "password": "123456"
  }'
```

**Usar el token en rutas protegidas:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Cómo funciona

1. **Usuario se registra** → Supabase Auth crea usuario y genera token JWT
2. **Usuario hace login** → Supabase verifica credenciales y devuelve token
3. **Token se envía en cada request** → Header: `Authorization: Bearer <token>`
4. **Backend verifica token** → authMiddleware valida con Supabase Auth
5. **Si válido** → Request procesado con `req.user` disponible
6. **Si inválido** → Error 401 Unauthorized

---

## 📍 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token
- `GET /api/auth/profile` - Obtener perfil (protegido)
- `PUT /api/auth/change-password` - Cambiar password (protegido)
- `POST /api/auth/logout` - Logout (protegido)
- `POST /api/auth/forgot-password` - Reset password

### Usuarios
- `GET /api/users` - Listar usuarios (protegido)
- `GET /api/users/:id` - Obtener usuario (protegido)
- `POST /api/users` - Crear usuario (protegido)
- `PUT /api/users/:id` - Actualizar usuario (protegido)
- `DELETE /api/users/:id` - Eliminar usuario (protegido)

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (protegido)
- `PUT /api/products/:id` - Actualizar producto (protegido)
- `DELETE /api/products/:id` - Eliminar producto (protegido)
- `GET /api/products/available` - Productos disponibles (público)
- `GET /api/products/search?q=` - Buscar productos

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría (protegido)
- `PUT /api/categories/:id` - Actualizar categoría (protegido)

### Órdenes
- `GET /api/orders` - Listar órdenes (protegido)
- `GET /api/orders/:id` - Obtener orden (protegido)
- `POST /api/orders` - Crear orden (protegido)
- `PUT /api/orders/:id` - Actualizar orden (protegido)
- `DELETE /api/orders/:id` - Eliminar orden (protegido)

---

## 🗄️ Base de Datos

### Estructura de Tablas

```sql
User            - Usuarios del sistema (id, email, name, role)
Product         - Productos del catálogo
ProductCategory - Categorías de productos
Order           - Órdenes de compra
OrderItem       - Items de cada orden
```

### Scripts Disponibles

```bash
# Configurar base de datos
node scripts/setup_database.js

# Limpiar datos
node scripts/clean_database.js --data

# Seed de productos realistas
node scripts/seed_realistic_products.js

# Probar CRUD
node scripts/test_crud.js

# Validar autenticación
node scripts/validate_auth.js
```

---

## 🔒 Seguridad

- ✅ **Passwords hasheados** por Supabase (bcrypt)
- ✅ **JWT tokens** con expiración automática (1 hora)
- ✅ **Refresh tokens** para renovar sesión (7 días)
- ✅ **Middleware de autenticación** en rutas protegidas
- ✅ **Sistema de roles** (ADMIN/CUSTOMER)
- ✅ **Validación de datos** en todos los endpoints
- ✅ **CORS configurado** para seguridad
- ✅ **Rate limiting** de Supabase

---

## 📚 Documentación API

Una vez iniciado el servidor, accede a:

```
http://localhost:5000/api-docs
```

Documentación interactiva con Swagger UI.

---

## 🧪 Testing

### Probar autenticación

```bash
# 1. Validar sistema
node scripts/validate_auth.js

# 2. Registrar usuario
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vendly.ch","password":"123456","name":"Test","role":"ADMIN"}'

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@vendly.ch","password":"123456"}'

# 4. Guardar el access_token y usar en rutas protegidas
export TOKEN="eyJhbG..."

# 5. Obtener perfil
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Probar CRUD de productos

```bash
node scripts/test_crud.js
```

---

## 📂 Estructura del Proyecto

```
Backend/
├── lib/
│   ├── database.js        # Cliente PostgreSQL
│   └── supabase.js        # Cliente Supabase Auth
├── src/
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── ProductController.js
│   │   ├── UserController.js
│   │   ├── OrderController.js
│   │   └── CategoryController.js
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── ProductService.js
│   │   ├── UserService.js
│   │   ├── OrderService.js
│   │   └── CategoryService.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── userRoutes.js
│   │   ├── orderRoutes.js
│   │   └── categoryRoutes.js
│   └── types/
│       └── index.js
├── scripts/
│   ├── setup_database.js
│   ├── validate_auth.js
│   └── ...
├── config/
│   └── swagger.js
├── app.js                 # Configuración de Express
├── server.js              # Punto de entrada
└── package.json
```

---

## 🔧 Scripts NPM

```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar con nodemon (desarrollo)
npm test               # Ejecutar tests
```

---

## 🌐 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://...` |
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Key pública de Supabase | `eyJhbG...` |
| `PORT` | Puerto del servidor | `5000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3000` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

---

## 🛡️ Middleware de Autenticación

### Proteger una ruta

```javascript
const { authMiddleware, requireRole } = require('./src/middleware/authMiddleware');

// Solo usuarios autenticados
router.get('/profile', authMiddleware, controller.getProfile);

// Solo ADMIN
router.post('/products', authMiddleware, requireRole('ADMIN'), controller.create);

// ADMIN o CUSTOMER
router.get('/orders', authMiddleware, requireRole('ADMIN', 'CUSTOMER'), controller.list);
```

### El objeto req.user

Después del middleware, tienes acceso a:

```javascript
req.user = {
  userId: "uuid...",
  email: "admin@vendly.ch",
  name: "Admin Vendly",
  role: "ADMIN",
  emailConfirmed: true
}
```

---

## 📊 Arquitectura del Sistema

```
Cliente → Express API → authMiddleware → Controller → Service → Supabase
                              ↓
                        Verifica token
                              ↓
                        Agrega req.user
```

### Flujo de Autenticación:

1. **Register/Login** → Supabase Auth genera JWT token
2. **Cliente guarda token** → localStorage o cookies
3. **Cada request** → Cliente envía token en header
4. **Backend verifica** → authMiddleware valida con Supabase
5. **Si válido** → Request procesado con info del usuario
6. **Si inválido** → Error 401 Unauthorized

---

## 🔄 Próximos Pasos

### Backend ✅ Completado:
- [x] Sistema de autenticación con Supabase
- [x] CRUD de productos funcionando
- [x] Sistema de órdenes
- [x] Middleware de protección
- [x] Validación automática

### Frontend 🔄 Por implementar:
- [ ] AuthContext con Supabase Client
- [ ] Páginas de Login y Register
- [ ] Protección de rutas
- [ ] Integración con backend

---

## 📚 Documentación Adicional

- **Swagger UI**: http://localhost:5000/api-docs
- **Scripts disponibles**: Ver carpeta `scripts/`
- **Postman Collection**: `Vendly_Checkout_API.postman_collection.json`

---

## ❓ Troubleshooting

### Puerto en uso
```bash
# Cambiar PORT en .env o matar proceso
lsof -ti:5000 | xargs kill -9
```

### Error de conexión a base de datos
```bash
# Verificar DATABASE_URL en .env
# Verificar que Supabase está accesible
```

### Token inválido
```bash
# El token expira en 1 hora
# Hacer login nuevamente para obtener nuevo token
```

### "User already registered"
```bash
# El email ya existe
# Usar otro email o eliminar usuario desde Supabase Dashboard
```

---

## 🎯 Resumen

**Estado actual:**
- ✅ Backend 100% funcional
- ✅ Autenticación con Supabase Auth
- ✅ 7 endpoints de auth + CRUD completo
- ✅ Sistema de roles implementado
- ✅ Middleware de protección
- ✅ Validado y probado

**Listo para:** Implementar frontend y conectar todo el sistema.

---

**Fecha:** Octubre 2025  
**Versión:** 2.0.0  
**Stack:** Node.js + Express + PostgreSQL + Supabase Auth
