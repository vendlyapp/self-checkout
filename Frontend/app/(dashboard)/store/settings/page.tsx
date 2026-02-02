'use client'

import StoreSettingsForm from '@/components/dashboard/store/StoreSettingsForm'
import { useResponsive } from '@/hooks'

export default function StoreSettingsPage() {
  const { isMobile } = useResponsive()

  return (
    <div className="w-full h-full gpu-accelerated">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
          <div className="px-4 py-4 pb-32">
            <StoreSettingsForm />
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-6">
          <div className="max-w-4xl mx-auto px-6">
            <StoreSettingsForm />
          </div>
        </div>
      )}
    </div>
  )
}
