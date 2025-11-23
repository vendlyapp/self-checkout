# 🚀 Guía de Despliegue en Fly.io

## 🎯 Dos Opciones de Despliegue

### Opción 1: Despliegue Automático desde GitHub (⭐ Recomendado)

Fly.io puede conectarse directamente a tu repositorio y desplegar automáticamente en cada push.

#### Pasos:

1. **Crear la app en Fly.io Dashboard:**
   - Ve a [fly.io/dashboard](https://fly.io/dashboard)
   - Click en "Create New App"
   - Nombre: `vendly-checkout-backend`
   - Selecciona tu organización
   - **NO** selecciones "Deploy now" todavía

2. **Conectar el Repositorio:**
   - En la página de la app, ve a "Settings" → "Source"
   - Click en "Connect to GitHub"
   - Autoriza Fly.io a acceder a tu repositorio
   - Selecciona: `Vendly/Checkout` (o tu nombre de repo)
   - Selecciona la rama: `development` (o `main`/`master`)
   - **Directorio:** `Backend` (importante: especifica el subdirectorio)
   - Guarda

3. **Configurar Variables de Entorno (Secrets):**
   - Ve a "Secrets" en el dashboard de la app
   - Agrega cada variable una por una:
     - `DATABASE_URL` = `postgresql://postgres.dkkvxzigqqvolbyeybgr:BmvKhmXieYSKcu9F@aws-1-eu-central-2.pooler.supabase.com:6543/postgres`
     - `DIRECT_URL` = `postgresql://postgres.dkkvxzigqqvolbyeybgr:BmvKhmXieYSKcu9F@aws-1-eu-central-2.pooler.supabase.com:5432/postgres`
     - `NODE_ENV` = `production`
     - `PORT` = `3000`
     - `SUPABASE_URL` = `https://dkkvxzigqqvolbyeybgr.supabase.co`
     - `SUPABASE_ANON_KEY` = `sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv`
     - `FRONTEND_URL` = `https://self-checkout-kappa.vercel.app`
     - `CORS_ORIGIN` = `https://self-checkout-kappa.vercel.app`
     - `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` = `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`
     - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRra3Z4emlncXF2b2xieWV5YmdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ4NjcyMiwiZXhwIjoyMDc0MDYyNzIyfQ.fC0kC7or1a1BF6VDr_KwBlymZN7rN5RBu-VJxwUg7Hg`
     - `SUPER_ADMIN_EMAIL` = `admin@vendly.co`
     - `SUPER_ADMIN_PASSWORD` = `SuperAdmin123!`

4. **Primer Despliegue:**
   - Ve a "Deployments" → "Deploy now"
   - O simplemente haz push a tu rama conectada

5. **Despliegues Automáticos:**
   - Cada vez que hagas push a la rama conectada, Fly.io desplegará automáticamente
   - Puedes ver el progreso en "Deployments"
   - Recibirás notificaciones de éxito/fallo

#### Ventajas:
- ✅ Despliegue automático en cada push
- ✅ Historial de despliegues en el dashboard
- ✅ Rollback fácil desde la interfaz
- ✅ No necesitas flyctl instalado localmente
- ✅ Build logs visibles en el dashboard
- ✅ Notificaciones de estado de despliegue

#### Notas Importantes:
- El Dockerfile debe estar en el directorio `Backend/`
- El `fly.toml` debe estar en el directorio `Backend/`
- Las variables de entorno se configuran como "Secrets" (encriptadas)
- Puedes configurar diferentes ramas para staging/producción

---

### Opción 2: Despliegue Manual con CLI

Si prefieres control total desde la terminal:

#### 0. Crear la App (si no existe)

```bash
cd Backend
flyctl apps create vendly-checkout-backend
```

#### 1. Configurar Variables de Entorno

Ejecuta el script automatizado (creará la app si no existe):

```bash
bash scripts/setup_fly_secrets.sh
```

O manualmente:

```bash
flyctl secrets set \
  DATABASE_URL="postgresql://..." \
  DIRECT_URL="postgresql://..." \
  NODE_ENV="production" \
  PORT="3000" \
  SUPABASE_URL="https://..." \
  SUPABASE_ANON_KEY="..." \
  FRONTEND_URL="https://..." \
  CORS_ORIGIN="https://..." \
  SUPABASE_SERVICE_ROLE_KEY="..." \
  SUPER_ADMIN_EMAIL="admin@vendly.co" \
  SUPER_ADMIN_PASSWORD="..."
```

#### 2. Desplegar

```bash
flyctl deploy
```

#### 3. Verificar

```bash
flyctl status
flyctl logs
```

---

## Variables Configuradas

- ✅ `DATABASE_URL` - Conexión PostgreSQL (pooler)
- ✅ `DIRECT_URL` - Conexión PostgreSQL (directa)
- ✅ `NODE_ENV=production`
- ✅ `PORT=3000`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `FRONTEND_URL`
- ✅ `CORS_ORIGIN`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPER_ADMIN_EMAIL`
- ✅ `SUPER_ADMIN_PASSWORD`

## Comandos Útiles

```bash
# Ver secrets configurados
flyctl secrets list

# Ver logs en tiempo real
flyctl logs

# Abrir consola SSH
flyctl ssh console

# Ver estado de la app
flyctl status

# Escalar máquinas
flyctl scale count 2

# Ver despliegues recientes
flyctl releases
```

## Troubleshooting

### El despliegue falla
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs: `flyctl logs` o en el dashboard
- Verifica que el Dockerfile esté en el directorio correcto

### La app no inicia
- Verifica la conexión a la base de datos
- Revisa que `PORT=3000` esté configurado
- Verifica el health check: `curl https://tu-app.fly.dev/health`

### Variables de entorno no funcionan
- Asegúrate de configurarlas como "Secrets" en el dashboard
- Verifica que no tengan espacios extra
- Usa comillas si el valor contiene caracteres especiales
