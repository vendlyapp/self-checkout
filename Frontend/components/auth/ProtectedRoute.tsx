'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        const returnUrl = pathname !== '/login' ? pathname : '/dashboard'
        router.push(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`)
      } else if (!requireAuth && isAuthenticated) {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, loading, requireAuth, router, pathname, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return null
  }
  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

