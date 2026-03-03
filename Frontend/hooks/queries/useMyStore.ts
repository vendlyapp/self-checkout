'use client'

import { useQuery } from '@tanstack/react-query'
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
  /** Número de IVA de la tienda (ej. CHE-123.456.789 MWST) */
  vatNumber?: string | null
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
  return useQuery({
    queryKey: ['myStore'],
    queryFn: async ({ signal }) => {
      // La sesión se verifica directamente en la queryFn — sin useEffect ni estado extra.
      // Esto elimina el waterfall: render → effect → setState → re-render → query start.
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        // Lanzar error marcado para que retry no lo reintente
        const err = new Error('NO_SESSION')
        ;(err as Error & { noRetry: boolean }).noRetry = true
        throw err
      }

      const url = buildApiUrl('/api/store/my-store')
      const headers = getAuthHeaders(session.access_token)

      const response = await fetch(url, { headers, signal })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar tienda')
      }

      return result.data as StoreData
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      // No reintentar si no hay sesión o si el error es de auth
      if (error instanceof Error && (error.message === 'NO_SESSION' || error.message.includes('autenticado'))) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  })
}

