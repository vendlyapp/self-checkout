'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { toast } from 'sonner'

interface UpdateStoreData {
  name?: string
  logo?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  description?: string | null
}

export const useUpdateStore = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: UpdateStoreData) => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Sie sind nicht angemeldet')
      }

      const url = buildApiUrl('/api/store/my-store')
      const headers = getAuthHeaders(session.access_token)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos timeout

      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Fehler beim Aktualisieren des Geschäfts')
        }

        return result.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore'] })
      toast.success('Geschäft erfolgreich aktualisiert')
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Aktualisieren des Geschäfts')
    },
  })
}

export const useRegenerateQR = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Sie sind nicht angemeldet')
      }

      const url = buildApiUrl('/api/store/my-store/regenerate-qr')
      const headers = getAuthHeaders(session.access_token)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 segundos timeout (generar QR puede tardar)

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Fehler beim Neugenerieren des QR-Codes')
        }

        return result.data
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout')
        }
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore'] })
      toast.success('QR-Code erfolgreich regeneriert')
    },
    onError: (error) => {
      toast.error(error.message || 'Fehler beim Regenerieren des QR-Codes')
    },
  })
}

