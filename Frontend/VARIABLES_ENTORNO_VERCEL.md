# 🔐 Variables de Entorno para Vercel

## Variables Requeridas en Vercel

Configura estas variables en tu proyecto de Vercel:

### Panel de Vercel: Settings → Environment Variables

---

## 📋 LISTA DE VARIABLES

### 1. Supabase Configuration

**Variable:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://dkkvxzigqqvolbyeybgr.supabase.co`  
**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

**Variable:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** `sb_publishable_w5YLhoNEwZViKFH8HoiEOg_Hru9YwGv`  
**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 2. Site URL (CRÍTICA para OAuth)

**Variable:** `NEXT_PUBLIC_SITE_URL`  
**Value:** `https://self-checkout-kappa.vercel.app`  
**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 3. Backend API URL

**Variable:** `NEXT_PUBLIC_API_URL`  
**Value:** `https://tu-backend-url.com` ← **CAMBIAR con tu URL de backend en producción**  
**Environments:** ✅ Production, ✅ Preview

**NOTA:** Actualmente tienes `http://localhost:5000` en desarrollo, pero necesitas tu URL real del backend desplegado en producción.

---

## 📸 Cómo Agregar en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `self-checkout-kappa`
3. Click en **Settings** (⚙️)
4. Click en **Environment Variables** (en el menú lateral)
5. Para cada variable:
   - Click **Add New**
   - Ingresa el **Key** (nombre de la variable)
   - Ingresa el **Value** (valor de la variable)
   - Selecciona los **Environments** (Production, Preview, Development)
   - Click **Save**

---

## 🎯 Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│ VARIABLE                        │ VALUE                  │
├─────────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL       │ https://dkkvx...      │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY  │ sb_publishable_...    │
│ NEXT_PUBLIC_SITE_URL           │ https://self-checkout...│
│ NEXT_PUBLIC_API_URL            │ https://tu-backend... │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Verificar que Funcionan

Después de configurar las variables, haz un nuevo deploy:

1. Ve a **Deployments**
2. Encuentra tu último deploy
3. Click en los 3 puntos (...) → **Redeploy**
4. O haz un push a GitHub para trigger automático

---

## ⚠️ Importante

- Las variables que empiezan con `NEXT_PUBLIC_` son expuestas al cliente (browser)
- **NO** agregues variables sensibles como `SUPABASE_SERVICE_ROLE_KEY` en el frontend
- Después de agregar/modificar variables, **siempre haz un redeploy**

---

## 🆘 Troubleshooting

**Problema:** Las variables no se actualizan después del deploy

**Solución:** 
1. Verifica que las variables estén en el ambiente correcto (Production)
2. Haz un redeploy manual
3. Verifica los logs del build en Vercel

---

## 📝 Notas

- Estas son las variables **mínimas** necesarias
- Si agregas más variables en el futuro (ej: analytics, tracking), agrégalas aquí también
- Cada vez que despliegues a un nuevo dominio, actualiza `NEXT_PUBLIC_SITE_URL`

