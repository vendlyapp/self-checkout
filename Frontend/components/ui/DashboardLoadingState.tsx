'use client'

import { Loader } from '@/components/ui/Loader'

type DashboardLoadingMode = 'page' | 'section' | 'overlay'

interface DashboardLoadingStateProps {
  mode?: DashboardLoadingMode
  message?: string
  className?: string
}

export function DashboardLoadingState({
  mode = 'page',
  message = 'Wird geladen...',
  className = '',
}: DashboardLoadingStateProps) {
  if (mode === 'overlay') {
    return (
      <div className={`absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/85 backdrop-blur-sm ${className}`}>
        <div className="text-center">
          <Loader size="lg" className="mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
      </div>
    )
  }

  if (mode === 'section') {
    return (
      <div className={`flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-12 ${className}`}>
        <div className="text-center">
          <Loader size="md" className="mx-auto mb-3" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full min-h-dvh bg-[#F2EDE8] flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader size="lg" className="mx-auto mb-4" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

