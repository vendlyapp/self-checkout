'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StoreSettingsForm from '@/components/dashboard/store/StoreSettingsForm'
import { useResponsive } from '@/hooks'
import { useMyStore } from '@/hooks/queries/useMyStore'
import type { StoreData } from '@/hooks/queries/useMyStore'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { toast } from 'sonner'
import { CreditCard, Store } from 'lucide-react'

const FIRST_TIME_BANNER = {
  title: 'Willkommen',
  description: 'Füllen Sie die Angaben aus und speichern Sie. Bargeld ist standardmässig aktiv; Zahlungsarten können Sie danach einrichten.',
}

export default function StoreSettingsPage() {
  const { isMobile } = useResponsive()
  const router = useRouter()
  const { data: store, refetch: refetchStore } = useMyStore()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [completingOnboarding, setCompletingOnboarding] = useState(false)

  const isFirstTimeSetup =
    store && (store.settingsCompletedAt == null || store.settingsCompletedAt === '')

  const handleStoreUpdate = useCallback(
    (updatedStore: StoreData) => {
      refetchStore()
      const onboardingNotComplete =
        updatedStore &&
        (updatedStore.onboardingCompletedAt == null || updatedStore.onboardingCompletedAt === '')
      if (onboardingNotComplete) {
        setShowPaymentModal(true)
      }
    },
    [refetchStore]
  )

  const handleConfigurePaymentYes = () => {
    setShowPaymentModal(false)
    router.push('/store/payment-methods?onboarding=1')
  }

  const handleConfigurePaymentNo = async () => {
    setCompletingOnboarding(true)
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      const url = buildApiUrl('/api/store/my-store/onboarding-complete')
      const headers = getAuthHeaders(session.access_token)
      const res = await fetch(url, { method: 'PATCH', headers })
      if (res.ok) {
        await refetchStore()
        setShowPaymentModal(false)
        toast.success(
          'Vielen Dank! Sie können jetzt ein Produkt anlegen, um mit dem Verkauf zu beginnen.'
        )
      }
    } catch {
      toast.error('Fehler beim Speichern')
    } finally {
      setCompletingOnboarding(false)
    }
  }

  return (
    <div className="h-full w-full min-w-0">
      {/* Banner primera vez — compacto y claro */}
      {isFirstTimeSetup && (
        <div className="mx-auto max-w-2xl px-4 pt-4 md:px-6 md:pt-6">
          <div
            className="rounded-2xl border border-brand-200/80 bg-white p-4 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Store className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[17px] font-semibold text-gray-900">{FIRST_TIME_BANNER.title}</h2>
                <p className="mt-1 text-[15px] text-gray-600 leading-snug">
                  {FIRST_TIME_BANNER.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: mismo fondo que el resto del dashboard (crema) */}
      {isMobile && (
        <div className="min-h-dvh bg-background-cream safe-area-bottom">
          <div className="px-4 py-4">
            <StoreSettingsForm onUpdate={handleStoreUpdate} />
          </div>
        </div>
      )}

      {/* Desktop */}
      {!isMobile && (
        <div className="min-h-dvh bg-background-cream py-8">
          <div className="mx-auto max-w-2xl px-4 md:px-6">
            <StoreSettingsForm onUpdate={handleStoreUpdate} />
          </div>
        </div>
      )}

      {/* Modal Zahlungsart */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent
          showCloseButton={true}
          className="max-w-[calc(100%-2rem)] w-full sm:max-w-md rounded-2xl border border-gray-200 bg-white p-0 shadow-xl gap-0 overflow-hidden"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5 pr-12">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
                <CreditCard className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Zahlungsart konfigurieren?
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-gray-500">
                  Barzahlung ist bereits aktiv. Jetzt eine weitere Methode hinzufügen oder später unter Einstellungen → Zahlungsarten.
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleConfigurePaymentNo}
                disabled={completingOnboarding}
                className="min-h-[48px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
              >
                {completingOnboarding ? 'Bitte warten…' : 'Später'}
              </button>
              <button
                type="button"
                onClick={handleConfigurePaymentYes}
                className="min-h-[48px] rounded-xl bg-brand-500 px-4 py-3 text-[15px] font-semibold text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/20"
              >
                Jetzt konfigurieren
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
