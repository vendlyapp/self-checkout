# Configuración para Producción

## OAuth con Google

Para que el login con Google funcione en producción, configura las URLs de redirección en Supabase:

### Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Tu proyecto → **Authentication** → **URL Configuration**
3. Configura **Site URL** con la URL pública de tu frontend (por ejemplo `https://tu-dominio.ch`).
4. En **Redirect URLs**, incluye:
   - `http://localhost:3000/auth/callback` (desarrollo)
   - `https://tu-dominio.ch/auth/callback` (producción)

## Variables de entorno en Vercel

En Vercel → Settings → Environment Variables, define (valores reales solo en el panel, no en el repo):

```env
NEXT_PUBLIC_API_URL=https://self-checkout-9a4fzg.fly.dev
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

**Importante:** `NEXT_PUBLIC_*` se fijan en el **build**. Tras cambiar variables en Vercel → **Deployments → Redeploy** (idealmente sin caché de build). No uses `http://localhost:5000` en Production.

**Fly.io (backend):** `CORS_ORIGIN` debe incluir la URL exacta del front (ej. `https://tu-app.vercel.app`), sin barra final.

Plantilla local: `Frontend/.env.example` → copiar a `.env.local`.

## Backend (Fly.io)

No guardes secretos en el repositorio. Usa `Backend/scripts/env.fly.secrets.example` como plantilla y `scripts/setup_fly_secrets.sh` con un archivo local `scripts/.env.fly.secrets` (gitignored).
