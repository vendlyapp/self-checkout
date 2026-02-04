'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StoreSettingsForm from '@/components/dashboard/store/StoreSettingsForm'
import { useResponsive } from '@/hooks'
import { useMyStore } from '@/hooks/queries/useMyStore'
import type { StoreData } from '@/hooks/queries/useMyStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { toast } from 'sonner'
import { CreditCard, Store } from 'lucide-react'

const FIRST_TIME_BANNER = {
  title: 'Willkommen! Konfigurieren Sie Ihre Geschäft zum ersten Mal',
  description:
    'Bitte füllen Sie die folgenden Angaben aus und speichern Sie. Anschließend können Sie optional Ihre Zahlungsarten einrichten. Bargeld (Barzahlung) ist standardmäßig aktiv.',
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
    <div className="w-full h-full gpu-accelerated">
      {/* Mensaje primera vez (alemán) */}
      {isFirstTimeSetup && (
        <div className="mx-auto mt-4 max-w-4xl px-4 sm:mt-6 sm:px-6">
          <div
            className="rounded-2xl border border-brand-200 bg-brand-50/80 p-4 shadow-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-brand-900">{FIRST_TIME_BANNER.title}</h2>
                <p className="mt-1 text-sm text-brand-800">{FIRST_TIME_BANNER.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
          <div className="px-4 py-4 pb-32">
            <StoreSettingsForm onUpdate={handleStoreUpdate} />
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-6">
          <div className="max-w-4xl mx-auto px-6">
            <StoreSettingsForm onUpdate={handleStoreUpdate} />
          </div>
        </div>
      )}

      {/* Modal: ¿Configurar método de pago? */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-500" />
              Zahlungsart konfigurieren?
            </DialogTitle>
            <DialogDescription>
              Möchten Sie jetzt eine Zahlungsart konfigurieren? Barzahlung (Bargeld) ist bereits
              aktiv. Sie können jederzeit unter Einstellungen → Zahlungsarten weitere Methoden
              hinzufügen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={handleConfigurePaymentNo}
              disabled={completingOnboarding}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {completingOnboarding ? 'Bitte warten…' : 'Später'}
            </button>
            <button
              type="button"
              onClick={handleConfigurePaymentYes}
              className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Ja, jetzt konfigurieren
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
