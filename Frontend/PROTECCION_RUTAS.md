# 🔒 Protección de Rutas y Logout - Guía de Uso

## ✅ Lo que se implementó

### 1. Logout Mejorado
- ✅ Limpia sesión de Supabase
- ✅ Limpia localStorage
- ✅ Limpia sessionStorage
- ✅ Limpia cookies de Supabase
- ✅ Resetea estados locales

### 2. Protección de Rutas
- ✅ Componente `ProtectedRoute`
- ✅ Hook `useRequireAuth`
- ✅ Hook `useRedirectIfAuthenticated`
- ✅ Dashboard automáticamente protegido

### 3. Página 404
- ✅ Diseño profesional y moderno
- ✅ Botones de navegación
- ✅ Enlaces útiles
- ✅ Responsive

---

## 📖 Cómo Usar

### Logout (Ya funciona)

El logout ya está implementado en tu `AuthContext`. Solo úsalo así:

```tsx
import { useAuth } from '@/lib/auth/AuthContext'

function Component() {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    const { error } = await signOut()
    if (!error) {
      router.push('/login')
    }
  }

  return <button onClick={handleLogout}>Cerrar Sesión</button>
}
```

### Proteger Rutas Automáticamente (Ya está en Dashboard)

El layout del dashboard ya está protegido. Todas las rutas dentro de `(dashboard)` están protegidas:

```
✅ /dashboard - Protegida
✅ /products - Protegida
✅ /sales - Protegida
✅ /store - Protegida
```

### Proteger Rutas Individualmente

**Opción 1: Con componente ProtectedRoute**

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function MyPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <div>Contenido protegido</div>
    </ProtectedRoute>
  )
}
```

**Opción 2: Con hook useRequireAuth**

```tsx
'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function MyPage() {
  const { isAuthenticated, loading } = useRequireAuth()

  if (loading) return <div>Cargando...</div>

  return <div>Contenido protegido</div>
}
```

### Redirigir si ya está autenticado (Login/Register)

```tsx
'use client'

import { useRedirectIfAuthenticated } from '@/hooks/useRequireAuth'

export default function LoginPage() {
  const { loading } = useRedirectIfAuthenticated('/dashboard')

  if (loading) return <div>Cargando...</div>

  return <div>Formulario de login</div>
}
```

---

## 🎯 Ejemplos de Uso

### 1. Proteger una nueva página

```tsx
// app/configuracion/page.tsx
'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function ConfigPage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      <h1>Configuración de {user?.email}</h1>
      {/* Tu contenido aquí */}
    </div>
  )
}
```

### 2. Botón de Logout en tu Header/Navbar

```tsx
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function LogoutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await signOut()
    
    if (error) {
      toast.error('Error al cerrar sesión')
    } else {
      toast.success('Sesión cerrada correctamente')
      router.push('/login')
    }
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
    >
      <LogOut className="w-5 h-5" />
      Cerrar Sesión
    </button>
  )
}
```

### 3. Verificar autenticación en cualquier componente

```tsx
import { useAuth } from '@/lib/auth/AuthContext'

export function MyComponent() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>
  }

  return (
    <div>
      <p>Bienvenido {user?.email}</p>
    </div>
  )
}
```

---

## 🛡️ Rutas Protegidas Actuales

### Automáticamente Protegidas (por el layout)
```
✅ /dashboard/*
✅ /products/*
✅ /sales/*
✅ /store/*
```

### Rutas Públicas
```
✅ /login
✅ /register
✅ /
```

### Página 404
```
✅ /cualquier-ruta-inexistente → Muestra página 404 profesional
```

---

## 🔄 Flujo de Autenticación

### Login Exitoso
```
1. Usuario ingresa credenciales
2. AuthContext actualiza sesión
3. Redirige a returnUrl o /dashboard
4. Dashboard layout verifica autenticación
5. Muestra contenido
```

### Logout
```
1. Usuario hace click en logout
2. signOut() limpia todo:
   - Sesión de Supabase
   - localStorage
   - sessionStorage
   - Cookies
3. AuthContext actualiza estado (user = null)
4. Redirige a /login
```

### Acceso a ruta protegida sin login
```
1. Usuario intenta acceder a /dashboard
2. ProtectedRoute verifica autenticación
3. No está autenticado
4. Redirige a /login?returnUrl=/dashboard
5. Después del login, vuelve a /dashboard
```

---

## 🧪 Probar que Funciona

### 1. Probar Logout
```bash
# Inicia sesión
# Ve al dashboard
# Haz logout
# Intenta volver a /dashboard
# Deberías ser redirigido a /login
```

### 2. Probar Protección
```bash
# Sin iniciar sesión:
# Ve a http://localhost:3000/dashboard
# Deberías ser redirigido a /login
```

### 3. Probar 404
```bash
# Ve a http://localhost:3000/ruta-que-no-existe
# Deberías ver la página 404 profesional
```

### 4. Probar ReturnUrl
```bash
# Sin login, ve a /dashboard
# Te redirige a /login?returnUrl=/dashboard
# Inicia sesión
# Deberías volver a /dashboard (no a inicio)
```

---

## 📋 Checklist de Funcionalidades

- ✅ Logout limpia sesión completamente
- ✅ Logout limpia localStorage y sessionStorage
- ✅ Logout limpia cookies de Supabase
- ✅ Dashboard protegido automáticamente
- ✅ Redirección después de login preserva URL deseada
- ✅ Página 404 profesional
- ✅ Loading states mientras verifica autenticación
- ✅ No flash de contenido no autorizado

---

## 🎉 ¡Todo Listo!

Ahora tu aplicación tiene:
- ✅ Logout completo y limpio
- ✅ Protección de rutas automática
- ✅ Página 404 profesional
- ✅ Mejor UX con returnUrl

**No necesitas hacer nada más.** Todo está configurado y funcionando.

