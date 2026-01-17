'use client'

import PaymentMethodsPage from '@/components/dashboard/store/PaymentMethodsPage'
import { useResponsive } from '@/hooks'

export default function PaymentMethodsRoute() {
  const { isMobile } = useResponsive()

  return (
    <div className="w-full h-full gpu-accelerated">
      {/* Mobile Layout */}
      {isMobile && (
        <div className="p-4">
          <PaymentMethodsPage />
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Zahlungsarten verwalten
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Verwalten Sie Ihre Zahlungsmethoden
            </p>
          </div>
          <PaymentMethodsPage />
        </div>
      )}
    </div>
  )
}

