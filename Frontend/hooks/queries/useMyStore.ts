'use client'

import { useQuery } from '@tanstack/react-query'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'

interface StoreData {
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
}

export const useMyStore = () => {
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  })
}

