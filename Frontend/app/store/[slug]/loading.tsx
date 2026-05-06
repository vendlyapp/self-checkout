'use client'

import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StoreSlugLoading() {
  return (
    <DashboardLoadingState
      mode="page"
      message="Wird geladen..."
      className="animate-page-enter"
    />
  )
}
