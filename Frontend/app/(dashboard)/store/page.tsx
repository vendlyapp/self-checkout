'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'
import { StoreDashboardSkeletonLoader } from '@/components/dashboard/skeletons'
import { useMyStore } from '@/hooks/queries/useMyStore'

export default function StorePage() {
  const { isLoading } = useMyStore()

  if (isLoading) {
    return (
      <div className="min-w-0 animate-page-enter">
        <StoreDashboardSkeletonLoader />
      </div>
    )
  }

  return (
    <div className="min-w-0 animate-page-enter">
      <StoreDashboard />
    </div>
  )
}
