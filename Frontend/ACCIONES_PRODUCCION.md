# ⚡ ACCIONES PARA PRODUCCIÓN - OAuth

## 🎯 Resumen

Tu frontend está en Vercel: **https://self-checkout-kappa.vercel.app**

Se ha configurado el código para usar URLs dinámicas, pero necesitas hacer 2 acciones críticas:

---

## ✅ ACCIÓN 1: Configurar Variable en Vercel

**URL:** https://vercel.com/dashboard

1. Selecciona tu proyecto `self-checkout-kappa`
2. Ve a **Settings** → **Environment Variables**
3. Click en **Add New**
4. Configura:
   - **Key:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://self-checkout-kappa.vercel.app`
   - **Environments:** ☑ Production, ☑ Preview, ☑ Development
5. Click **Save**
6. **Haz un redeploy** (Deployments → botón de 3 puntos → Redeploy)

---

## ✅ ACCIÓN 2: Configurar Redirect URL en Supabase

**URL:** https://supabase.com/dashboard

1. Selecciona tu proyecto
2. Ve a **Authentication** → **URL Configuration**
3. En **Redirect URLs**, agrega:
   ```
   https://self-checkout-kappa.vercel.app/auth/callback
   ```
4. Click **Save**

---

## 🧪 Verificar que Funciona

1. Ve a https://self-checkout-kappa.vercel.app
2. Click en "Mit Google fortfahren"
3. Haz login con tu cuenta de Google
4. Deberías ser redirigido a `/dashboard` sin errores

**Si ves** `localhost:3000` en la URL, significa que falta la configuración en Vercel.

**Si ves** error de "redirect_uri_mismatch", significa que falta la configuración en Supabase.

---

## 📋 Estado Actual

- ✅ Código actualizado con URLs dinámicas
- ✅ `.env.local` configurado con tu dominio
- ⏳ Variable en Vercel (pendiente)
- ⏳ Redirect URL en Supabase (pendiente)

---

## 🆘 ¿Necesitas Ayuda?

Revisa el archivo `Frontend/docs/CONFIGURACION_PRODUCCION.md` para más detalles.

