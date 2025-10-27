# Configuración para Producción

## 🔐 Problema de OAuth con Google

Cuando despliegues en producción, el login con Google redirige a `localhost:3000` por defecto, causando errores de autenticación.

## ✅ Solución

### 1. Configurar Variable de Entorno en Vercel

En el panel de Vercel, ve a tu proyecto → **Settings** → **Environment Variables** y agrega:

```
Variable: NEXT_PUBLIC_SITE_URL
Value: https://self-checkout-kappa.vercel.app
Environments: Production, Preview, Development
```

**Importante:** 
- Esta variable debe estar configurada en Vercel para que funcione en producción
- Después de agregar la variable, haz un nuevo deploy

### 2. Configurar Supabase Dashboard (CRÍTICO)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega ambas URLs:
   - `http://localhost:3000/auth/callback` (para desarrollo local)
   - `https://self-checkout-kappa.vercel.app/auth/callback` (para producción)

**⚠️ IMPORTANTE:** Sin esta configuración, OAuth NO funcionará en producción

### 3. Configurar Google OAuth (si usas Google)

En el panel de Supabase:
1. Ve a **Authentication** → **Providers**
2. Selecciona **Google**
3. En **Authorized Redirect URIs**, agrega:
   - `https://dkkvxzigqqvolbyeybgr.supabase.co/auth/v1/callback` (esto se genera automáticamente)
   
**Nota:** La configuración en Google Cloud Console ya está hecha si usas Supabase.

## 📋 Variables de Entorno Requeridas

### Frontend (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dkkvxzigqqvolbyeybgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv

# API Backend
NEXT_PUBLIC_API_URL=http://localhost:5000  # En producción: https://tu-backend.com

# URL del sitio (IMPORTANTE)
NEXT_PUBLIC_SITE_URL=https://self-checkout-kappa.vercel.app
```

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://postgres.dkkvxzigqqvolbyeybgr:BmvKhmXieYSKcu9F@aws-1-eu-central-2.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgresिप.dkkvxzigqqvolbyeybgr:BmvKhmXieYSKcu9F@aws-1-eu-central-2.pooler.supabase.com:5432/postgres

# Supabase
SUPABASE_URL=https://dkkvxzigqqvolbyeybgr.supabase.co
SUPABASE_ANON_KEY=sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ9381NiIsInR5cCI6IkpXVCJ9...
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET=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

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://tu-dominio.com
CORS_ORIGIN=https://tu-dominio.com
```

## 🚀 Pasos para Desplegar

1. ✅ **Ya configurado:** `NEXT_PUBLIC_SITE_URL` en `.env.local` con tu dominio de producción

2. ⚠️ **PENDIENTE:** Configura la variable de entorno en Vercel:
   - Ve a https://vercel.com/dashboard
   - Selecciona tu proyecto `self-checkout-kappa`
   - Settings → Environment Variables
   - Agrega: `NEXT_PUBLIC_SITE_URL` = `https://self-checkout-kappa.vercel.app`
   - Selecciona todos los ambientes (Production, Preview, Development)

3. ⚠️ **CRÍTICO:** Configura Supabase Redirect URL:
   - Ve a https://supabase.com/dashboard
   - Tu proyecto → Authentication → URL Configuration
   - En "Redirect URLs" agrega: `https://self-checkout-kappa.vercel.app/auth/callback`
   - Guarda los cambios

4. **Haz un nuevo deploy en Vercel:**
   - Pushea tus cambios a GitHub
   - O haz un redeploy manual desde el dashboard de Vercel

5. **Prueba el login** con Google en https://self-checkout-kappa.vercel.app

## 🔍 Verificación

Después del despliegue, verifica que:
- El login con Google redirige correctamente
- No aparece `localhost:3000` en la URL
- La sesión se mantiene después del login
- El logout funciona correctamente

## 📝 Notas Adicionales

- Los valores por defecto en el código son solo para desarrollo
- Nunca hardcodees URLs de producción en el código
- Usa siempre variables de entorno para URLs
- Reinicia el servidor después de cambiar variables de entorno

