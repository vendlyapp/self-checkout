# 🚀 Guía Completa de Despliegue en Fly.io

Guía paso a paso para desplegar el backend de Vendly Checkout en Fly.io para producción.

---

## 📋 Prerrequisitos

- ✅ Cuenta de Fly.io ([fly.io](https://fly.io))
- ✅ Cuenta de Supabase con proyecto creado
- ✅ Repositorio Git (GitHub, GitLab, o Bitbucket)
- ✅ Variables de entorno configuradas localmente
- ✅ `flyctl` instalado (herramienta CLI de Fly.io)

---

## 🛠️ Paso 1: Instalar flyctl

### macOS
```bash
brew install flyctl
```

### Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows
```bash
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

O descarga desde: https://fly.io/docs/getting-started/installing-flyctl/

---

## 🔐 Paso 2: Autenticación en Fly.io

### 2.1 Iniciar sesión
```bash
flyctl auth login
```

Si no tienes cuenta:
```bash
flyctl auth signup
```

---

## 🚀 Paso 3: Preparar el Proyecto

### 3.1 Verificar archivos necesarios

Asegúrate de tener estos archivos en la raíz del proyecto:

- ✅ `Dockerfile` - Configuración de Docker
- ✅ `fly.toml` - Configuración de Fly.io
- ✅ `.dockerignore` - Archivos a excluir del build
- ✅ `package.json` - Con script `start` definido

### 3.2 Verificar que todo esté commiteado
```bash
git status
git add .
git commit -m "Preparar para despliegue en Fly.io"
git push
```

---

## 🎯 Paso 4: Inicializar la Aplicación en Fly.io

### 4.1 Lanzar la aplicación (sin desplegar aún)
```bash
cd Backend
flyctl launch --no-deploy
```

Este comando:
- Detectará tu aplicación Node.js
- Creará/actualizará el archivo `fly.toml`
- Te pedirá un nombre para la app (o usa el existente)
- Te pedirá seleccionar una región

**Nota:** Si ya tienes un `fly.toml`, puedes omitir este paso o usar `flyctl launch --copy-config` para actualizar.

### 4.2 Personalizar la región (opcional)

Edita `fly.toml` y cambia `primary_region`:
```toml
primary_region = "iad"  # Opciones: iad, ord, dfw, lax, etc.
```

Regiones disponibles:
- `iad` - Washington, D.C. (US)
- `ord` - Chicago (US)
- `dfw` - Dallas (US)
- `lax` - Los Angeles (US)
- `sjc` - San Jose (US)
- `gru` - São Paulo (BR)
- `lhr` - London (UK)
- `fra` - Frankfurt (DE)
- `nrt` - Tokyo (JP)

---

## 🔧 Paso 5: Configurar Variables de Entorno

### 5.1 Configurar variables secretas

```bash
# Supabase Database
flyctl secrets set DATABASE_URL="postgresql://postgres.xxxxx:password@aws-1-eu-central-2.pooler.supabase.com:6543/postgres"
flyctl secrets set DIRECT_URL="postgresql://postgres.xxxxx:password@aws-1-eu-central-2.pooler.supabase.com:5432/postgres"

# Supabase Auth
flyctl secrets set SUPABASE_URL="https://xxxxx.supabase.co"
flyctl secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Server
flyctl secrets set PORT="3000"
flyctl secrets set NODE_ENV="production"

# Frontend (ajusta según tu dominio)
flyctl secrets set FRONTEND_URL="https://tu-frontend.com"
flyctl secrets set CORS_ORIGIN="https://tu-frontend.com"
```

### 5.2 Verificar variables configuradas
```bash
flyctl secrets list
```

### 5.3 Nota sobre variables públicas

Si necesitas variables que no sean secretas, puedes agregarlas en `fly.toml`:
```toml
[env]
  NODE_ENV = "production"
  PORT = "3000"
  # Otras variables públicas
```

---

## 🐳 Paso 6: Desplegar la Aplicación

### 6.1 Desplegar
```bash
flyctl deploy
```

Este comando:
- Construirá la imagen Docker
- Subirá la aplicación a Fly.io
- Desplegará la aplicación

### 6.2 Verificar el despliegue
```bash
flyctl status
```

### 6.3 Ver logs en tiempo real
```bash
flyctl logs
```

---

## ✅ Paso 7: Verificar el Despliegue

### 7.1 Abrir la aplicación
```bash
flyctl open
```

O visita: `https://vendly-checkout-backend.fly.dev`

### 7.2 Verificar endpoints

```bash
# Health check
curl https://vendly-checkout-backend.fly.dev/health

# API Docs
curl https://vendly-checkout-backend.fly.dev/api-docs
```

### 7.3 Verificar estado
```bash
flyctl status
flyctl info
```

---

## 🔄 Paso 8: Gestión Post-Despliegue

### 8.1 Ver logs
```bash
# Logs en tiempo real
flyctl logs

# Últimos 100 logs
flyctl logs --limit 100

# Logs de una máquina específica
flyctl logs --instance <instance-id>
```

### 8.2 Escalar la aplicación
```bash
# Ver configuración actual
flyctl scale show

# Escalar CPU
flyctl scale count 2  # 2 instancias

# Escalar memoria
flyctl scale memory 1024  # 1GB RAM

# Escalar CPU
flyctl scale vm shared-cpu-2x  # 2 CPUs compartidos
```

### 8.3 Actualizar variables de entorno
```bash
# Agregar nueva variable
flyctl secrets set NEW_VAR="value"

# Eliminar variable
flyctl secrets unset OLD_VAR

# Ver todas las variables
flyctl secrets list
```

### 8.4 Redesplegar
```bash
# Desplegar última versión
flyctl deploy

# Desplegar desde un commit específico
flyctl deploy --image <image-hash>

# Desplegar con build local
flyctl deploy --local-only
```

### 8.5 Reiniciar la aplicación
```bash
flyctl apps restart vendly-checkout-backend
```

---

## 🐛 Solución de Problemas

### Problema: La aplicación no inicia

1. **Verificar logs:**
   ```bash
   flyctl logs
   ```

2. **Verificar variables de entorno:**
   ```bash
   flyctl secrets list
   ```

3. **Verificar conexión a base de datos:**
   - Asegúrate de que `DATABASE_URL` esté correctamente configurada
   - Verifica que Supabase permita conexiones desde la IP de Fly.io

### Problema: Error de conexión a base de datos

1. **Verificar configuración de Supabase:**
   - Ve a Supabase Dashboard → Settings → Database
   - Verifica que las conexiones estén permitidas
   - Revisa las IPs permitidas

2. **Verificar variables:**
   ```bash
   flyctl secrets list | grep DATABASE
   ```

### Problema: La aplicación se detiene automáticamente

Esto es normal con `auto_stop_machines = true`. La aplicación se iniciará automáticamente cuando reciba tráfico.

Para mantenerla siempre activa:
```toml
[http_service]
  auto_stop_machines = false
  min_machines_running = 1
```

### Problema: Build falla

1. **Verificar Dockerfile:**
   ```bash
   docker build -t test-build .
   ```

2. **Verificar .dockerignore:**
   - Asegúrate de que no esté excluyendo archivos necesarios

3. **Ver logs de build:**
   ```bash
   flyctl logs --build
   ```

---

## 📊 Monitoreo y Métricas

### Ver métricas
```bash
flyctl metrics
```

### Ver información de la app
```bash
flyctl info
```

### Ver máquinas activas
```bash
flyctl status
```

---

## 🔒 Seguridad

### Mejores prácticas

1. **Variables secretas:**
   - Usa `flyctl secrets set` para todas las variables sensibles
   - Nunca commitees `.env` o variables secretas

2. **HTTPS:**
   - Fly.io fuerza HTTPS automáticamente con `force_https = true`

3. **Health checks:**
   - La aplicación incluye endpoint `/health` para monitoreo

---

## 💰 Costos

Fly.io ofrece:
- **Plan gratuito:** 3 máquinas compartidas con 256MB RAM cada una
- **Planes pagos:** Desde $1.94/mes por máquina

Para más información: https://fly.io/docs/about/pricing/

---

## 📚 Recursos Adicionales

- [Documentación de Fly.io](https://fly.io/docs/)
- [Guía de Node.js en Fly.io](https://fly.io/docs/languages-and-frameworks/node/)
- [Referencia de fly.toml](https://fly.io/docs/reference/configuration/)
- [Comunidad de Fly.io](https://community.fly.io/)

---

## ✅ Checklist de Despliegue

- [ ] `flyctl` instalado
- [ ] Autenticado en Fly.io (`flyctl auth login`)
- [ ] Archivos `Dockerfile`, `fly.toml`, `.dockerignore` creados
- [ ] Variables de entorno configuradas (`flyctl secrets set`)
- [ ] Aplicación desplegada (`flyctl deploy`)
- [ ] Health check funcionando (`/health`)
- [ ] API accesible
- [ ] Logs verificados (`flyctl logs`)
- [ ] CORS configurado correctamente
- [ ] Base de datos conectada

---

## 🎉 ¡Despliegue Completado!

Tu aplicación debería estar disponible en:
`https://vendly-checkout-backend.fly.dev`

Para verificar:
```bash
curl https://vendly-checkout-backend.fly.dev/health
```

¡Feliz despliegue! 🚀

