'use client'

import StoreDashboard from '@/components/dashboard/store/StoreDashboard'
import StoreSettingsForm from '@/components/dashboard/store/StoreSettingsForm'

export default function StorePage() {
  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <StoreSettingsForm />
        <StoreDashboard />
      </div>
    </div>
  )
}
