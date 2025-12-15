'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'
import StoreSettingsForm from '@/components/dashboard/store/StoreSettingsForm'

export default function StorePage() {
  return (
    <div className="w-full h-full overflow-auto animate-page-enter gpu-accelerated">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="animate-stagger-1">
          <StoreSettingsForm />
        </div>
        <div className="animate-stagger-2">
          <StoreDashboard />
        </div>
      </div>
    </div>
  )
}
