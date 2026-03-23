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
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-backend-url.example
```

## Backend (Fly.io)

No guardes secretos en el repositorio. Usa `Backend/scripts/env.fly.secrets.example` como plantilla y `scripts/setup_fly_secrets.sh` con un archivo local `scripts/.env.fly.secrets` (gitignored).
