# Setup — Cómo correr el proyecto

## Requisitos

- Node.js >= 18
- npm o yarn
- Cuenta en Supabase (base de datos + auth)
- Git

---

## 1. Backend

```bash
cd Backend
npm install
```

### Variables de entorno — `/Backend/.env`

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Base de datos directa
DATABASE_URL=postgresql://user:password@host:5432/database

# Servidor
PORT=5000
NODE_ENV=development

# Frontend (para CORS)
FRONTEND_URL=http://localhost:3000

# Super Admin (para seed inicial)
SUPER_ADMIN_EMAIL=admin@vendly.co
SUPER_ADMIN_PASSWORD=SuperAdmin123!
```

### Iniciar backend

```bash
npm run dev      # desarrollo (nodemon)
npm start        # producción
```

El backend corre en `http://localhost:5000`.
Swagger disponible en `http://localhost:5000/api-docs`.

---

## 2. Frontend

```bash
cd Frontend
npm install
```

### Variables de entorno — `/Frontend/.env.local`

```env
# Supabase (cliente)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Iniciar frontend

```bash
npm run dev      # desarrollo
npm run build    # compilar producción
npm start        # servir compilado
```

El frontend corre en `http://localhost:3000`.

---

## 3. Base de datos

El esquema de base de datos está en Supabase. Para inicializar:

```bash
cd Backend
node scripts/setup_database.js     # crea tablas
node scripts/seed_realistic_products.js  # datos de prueba (opcional)
```

---

## Deploy

- **Backend:** Fly.io — configuración en `Backend/fly.toml` e instrucciones en `Backend/DEPLOY.md`
- **Frontend:** Vercel o cualquier plataforma que soporte Next.js
