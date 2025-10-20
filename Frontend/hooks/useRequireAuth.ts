'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

/**
 * Hook para requerir autenticación en una página
 * Redirige al login si el usuario no está autenticado
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  return {
    isAuthenticated,
    loading,
    user
  }
}

/**
 * Hook para redirigir usuarios autenticados
 * Útil para páginas de login/registro
 */
export const useRedirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, loading, router, redirectTo])

  return {
    isAuthenticated,
    loading
  }
}

