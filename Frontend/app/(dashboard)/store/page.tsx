'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StorePage() {
  const { isLoading } = useMyStore()

  if (isLoading) {
    return <DashboardLoadingState mode="page" message="Dashboard wird geladen..." className="animate-page-enter" />
  }

  return (
    <div className="min-w-0 animate-page-enter">
      <StoreDashboard />
    </div>
  )
}
