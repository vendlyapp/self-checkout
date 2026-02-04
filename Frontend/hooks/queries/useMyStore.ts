'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'

export interface StoreData {
  id: string
  ownerId: string
  name: string
  slug: string
  logo: string | null
  qrCode: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
  isActive: boolean
  isOpen?: boolean
  createdAt: string
  updatedAt: string
  /** Primera vez que el admin guardó la configuración de la tienda (onboarding) */
  settingsCompletedAt?: string | null
  /** Cuando el admin completó el flujo de onboarding */
  onboardingCompletedAt?: string | null
}

export const useMyStore = () => {
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  // Verificar si hay sesión antes de ejecutar la query
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data: { session } } = await supabase.auth.getSession()
        setHasSession(!!session?.access_token)
      } catch {
        setHasSession(false)
      }
    }
    checkSession()
  }, [])

  return useQuery({
    queryKey: ['myStore'],
    queryFn: async ({ signal }) => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado')
      }

      const url = buildApiUrl('/api/store/my-store')
      const headers = getAuthHeaders(session.access_token)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout

      try {
        const response = await fetch(url, {
          headers,
          signal: signal || controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Error al cargar tienda')
        }

        return result.data as StoreData
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
    },
    enabled: hasSession === true, // Solo ejecutar si hay sesión
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    throwOnError: false, // No lanzar errores automáticamente
  })
}

