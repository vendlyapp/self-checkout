'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { devError } from '@/lib/utils/logger'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    let redirected = false

    const redirectToDashboard = () => {
      if (!redirected) {
        redirected = true
        router.replace('/dashboard')
      }
    }

    const redirectToLogin = (reason?: string) => {
      if (!redirected) {
        redirected = true
        router.replace(`/login${reason ? `?error=${reason}` : ''}`)
      }
    }

    // 1. Escuchar SIGNED_IN — funciona para PKCE y flujo implícito
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        redirectToDashboard()
      } else if (event === 'SIGNED_OUT') {
        redirectToLogin()
      }
    })

    // 2. Fallback: esperar un tick y luego verificar sesión activa
    //    (por si PKCE ya procesó el código antes de que montara el componente)
    const checkSession = async () => {
      try {
        // Pequeño delay para que Supabase termine el code exchange
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          devError('[AuthCallback] Error:', error)
          redirectToLogin('auth_failed')
          return
        }
        if (session) {
          redirectToDashboard()
        }
      } catch (e) {
        devError('[AuthCallback] Exception:', e)
        redirectToLogin('auth_failed')
      }
    }

    checkSession()

    // 3. Timeout de seguridad — si en 15s no pasa nada, algo falló
    const timeout = setTimeout(() => redirectToLogin('timeout'), 15_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="flex flex-1 min-h-[100dvh] w-full items-center justify-center bg-gradient-to-br from-brand-50 via-background-cream to-brand-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Authentifizierung wird verarbeitet...</p>
        <p className="text-gray-400 text-sm mt-1">Bitte warten...</p>
      </div>
    </div>
  )
}
