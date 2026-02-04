'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PaymentMethodsPage from '@/components/dashboard/store/PaymentMethodsPage'
import { useResponsive } from '@/hooks'
import { useMyStore } from '@/hooks/queries/useMyStore'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { CheckCircle2, Package } from 'lucide-react'

const ONBOARDING_THANK_YOU = {
  title: 'Vielen Dank!',
  description:
    'Sie können jetzt ein Produkt anlegen, um mit dem Verkauf zu beginnen. Bargeld (Barzahlung) ist bereits aktiv.',
  cta: 'Produkt anlegen',
  ctaHref: '/products_list/add_product',
}

export default function PaymentMethodsRoute() {
  const { isMobile } = useResponsive()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: store, refetch: refetchStore } = useMyStore()
  const isOnboarding = searchParams.get('onboarding') === '1'
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)

  useEffect(() => {
    if (!isOnboarding || !store?.id || store.onboardingCompletedAt) return

    const completeOnboarding = async () => {
      try {
        const { supabase } = await import('@/lib/supabase/client')
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) return
        const url = buildApiUrl('/api/store/my-store/onboarding-complete')
        const headers = getAuthHeaders(session.access_token)
        const res = await fetch(url, { method: 'PATCH', headers })
        if (res.ok) {
          await refetchStore()
          setOnboardingCompleted(true)
          const urlClean = window.location.pathname
          router.replace(urlClean, { scroll: false })
        }
      } catch {
        setOnboardingCompleted(true)
      }
    }

    completeOnboarding()
  }, [isOnboarding, store?.id, store?.onboardingCompletedAt, refetchStore, router])

  const showThankYouBanner = isOnboarding && (onboardingCompleted || !!store?.onboardingCompletedAt)

  return (
    <div className="w-full h-full gpu-accelerated">
      {/* Banner de agradecimiento al terminar onboarding */}
      {showThankYouBanner && (
        <div className="mx-auto mt-4 max-w-4xl px-4 sm:mt-6 sm:px-6">
          <div
            className="rounded-2xl border border-green-200 bg-green-50/90 p-4 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-green-900">{ONBOARDING_THANK_YOU.title}</h2>
                <p className="mt-1 text-sm text-green-800">{ONBOARDING_THANK_YOU.description}</p>
                <Link
                  href={ONBOARDING_THANK_YOU.ctaHref}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  <Package className="h-4 w-4" />
                  {ONBOARDING_THANK_YOU.cta}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
