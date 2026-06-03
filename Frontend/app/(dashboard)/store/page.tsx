'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { useMyStoreInitialLoading } from '@/hooks/queries/useStoreQueryScope'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StorePage() {
  const { data: store, isFetched, isFetching } = useMyStore()
  const loading = useMyStoreInitialLoading(store, isFetched, isFetching)

  if (loading) {
    return <DashboardLoadingState mode="page" message="Dashboard wird geladen..." className="animate-page-enter" />
  }

  return (
    <div className="min-w-0 animate-page-enter">
      <StoreDashboard />
    </div>
  )
}
