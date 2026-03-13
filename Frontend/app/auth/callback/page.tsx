'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Escuchar el evento SIGNED_IN en vez de llamar getSession() de inmediato.
    // Con PKCE flow, Supabase necesita intercambiar el ?code= por tokens antes
    // de que getSession() devuelva algo — onAuthStateChange espera ese momento exacto.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    // Fallback: si ya había una sesión activa antes de montar el componente
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error en callback:', error)
        router.push('/login?error=auth_failed')
        return
      }
      if (session) {
        router.push('/dashboard')
      }
    })

    // Timeout de seguridad: si en 10s no hubo evento, algo falló
    const timeout = setTimeout(() => {
      router.push('/login?error=auth_failed')
    }, 10_000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Authentifizierung wird verarbeitet...</p>
      </div>
    </div>
  )
}

