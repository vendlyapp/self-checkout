'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'

export default function StorePage() {
  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <StoreDashboard />
      </div>
    </div>
  )
}
