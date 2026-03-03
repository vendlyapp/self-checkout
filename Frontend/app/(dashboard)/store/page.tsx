'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'
import { StoreDashboardSkeletonLoader } from '@/components/dashboard/skeletons'
import { useMyStore } from '@/hooks/queries/useMyStore'

export default function StorePage() {
  const { isLoading } = useMyStore()

  if (isLoading) {
    return (
      <div className="animate-page-enter gpu-accelerated">
        <StoreDashboardSkeletonLoader />
      </div>
    )
  }

  return (
    <div className="animate-page-enter gpu-accelerated">
      <StoreDashboard />
    </div>
  )
}
