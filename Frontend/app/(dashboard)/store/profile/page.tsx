'use client'

import { useResponsive } from '@/hooks'
import { useUser } from '@/lib/contexts/UserContext'
import { useMyStore } from '@/hooks/queries/useMyStore'
import ProfileAccountCard from '@/components/dashboard/store/ProfileAccountCard'
import ProfileAccessCard from '@/components/dashboard/store/ProfileAccessCard'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'
import { UserCircle2 } from 'lucide-react'

export default function ProfilePage() {
  const { isMobile } = useResponsive()
  const { profile, loading, refreshProfile } = useUser()
  const { data: store } = useMyStore()

  if (loading) {
    return <DashboardLoadingState mode="page" message="Wird geladen..." />
  }

  if (!profile) {
    return (
      <div className="min-h-dvh bg-background-cream px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">Profil nicht verfügbar</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ihr Profil konnte aktuell nicht geladen werden. Bitte laden Sie die Seite neu.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full min-w-0 animate-fade-in">
      {isMobile && (
        <div className="min-h-dvh bg-background-cream safe-area-bottom">
          <div className="mx-auto w-full max-w-3xl px-4 py-5 pb-28">
            <div className="mb-5 flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <UserCircle2 className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mein Profil</h1>
                <p className="text-sm text-gray-500">Verwalten Sie Ihre persönlichen Kontodaten</p>
              </div>
            </div>

            <div className="space-y-4">
              <ProfileAccountCard
                userId={profile.id}
                initialName={profile.name}
                initialEmail={profile.email}
                onProfileUpdated={refreshProfile}
              />
              <ProfileAccessCard role={profile.role} storeName={store?.name || profile.storeName} />
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="min-h-dvh bg-background-cream py-8">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100">
                <UserCircle2 className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mein Profil</h1>
                <p className="mt-1 text-base text-gray-500">Verwalten Sie Ihre persönlichen Kontodaten</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <ProfileAccountCard
                userId={profile.id}
                initialName={profile.name}
                initialEmail={profile.email}
                onProfileUpdated={refreshProfile}
              />
              <ProfileAccessCard role={profile.role} storeName={store?.name || profile.storeName} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
