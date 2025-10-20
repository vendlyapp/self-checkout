'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase maneja automáticamente el callback
        // Solo necesitamos verificar la sesión
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error en callback:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (session) {
          // Login exitoso, redirigir al dashboard
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error procesando callback:', error)
        router.push('/login?error=unexpected')
      }
    }

    handleCallback()
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

