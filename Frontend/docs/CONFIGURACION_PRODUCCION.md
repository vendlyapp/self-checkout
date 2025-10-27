# Configuración para Producción

## 🔐 OAuth con Google

Para que el login con Google funcione en producción, configura las URLs de redirección en Supabase:

### Configurar Supabase Dashboard

1. Ve a https://supabase.com/dashboard
2. Tu proyecto → **Authentication** → **URL Configuration**
3. Configura:

**Site URL:**
```
https://self-checkout-kappa.vercel.app
```

**Redirect URLs** (agregar ambas):
```
http://localhost:3000/auth/callback
https://self-checkout-kappa.vercel.app/auth/callback
```

4. Guarda los cambios

---

## 📋 Variables de Entorno en Vercel

Configura estas variables en Vercel (Settings → Environment Variables):

```env
NEXT_PUBLIC_SUPABASE_URL=https://dkkvxzigqqvolbyeybgr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
```

---

## ✅ Listo

Después de configurar Supabase y desplegar, el login con Google funcionará correctamente.
