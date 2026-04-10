'use client'

import { useMemo, useState } from 'react'
import { Mail, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { buildApiUrl, getAuthHeaders } from '@/lib/config/api'
import { Loader } from '@/components/ui/Loader'

interface ProfileAccountCardProps {
  userId: string
  initialName: string
  initialEmail: string
  onProfileUpdated?: () => Promise<void> | void
}

export default function ProfileAccountCard({
  userId,
  initialName,
  initialEmail,
  onProfileUpdated,
}: ProfileAccountCardProps) {
  const [name, setName] = useState(initialName || '')
  const [email, setEmail] = useState(initialEmail || '')
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = useMemo(() => {
    return name.trim() !== (initialName || '').trim() || email.trim().toLowerCase() !== (initialEmail || '').trim().toLowerCase()
  }, [name, email, initialName, initialEmail])

  const handleSave = async () => {
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedName) {
      toast.error('Name ist erforderlich')
      return
    }

    if (!normalizedEmail) {
      toast.error('E-Mail ist erforderlich')
      return
    }

    setIsSaving(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Nicht authentifiziert')

      const emailChanged = normalizedEmail !== (initialEmail || '').trim().toLowerCase()

      if (emailChanged) {
        const { error: authUpdateError } = await supabase.auth.updateUser({ email: normalizedEmail })
        if (authUpdateError) throw authUpdateError
      }

      const url = buildApiUrl(`/api/users/${userId}`)
      const headers = getAuthHeaders(token)
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
        }),
      })

      const json = await response.json().catch(() => ({}))
      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Profil konnte nicht gespeichert werden')
      }

      if (onProfileUpdated) await onProfileUpdated()

      if (emailChanged) {
        toast.success('Profil gespeichert. Bitte bestätigen Sie die neue E-Mail in Ihrem Postfach.')
      } else {
        toast.success('Profil erfolgreich gespeichert')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Fehler beim Speichern')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Konto bearbeiten</h2>
        <p className="mt-1 text-sm text-gray-500">
          Aktualisieren Sie Ihren Namen und Ihre E-Mail-Adresse.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Name</span>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="Ihr Name"
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">E-Mail</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              placeholder="name@beispiel.ch"
            />
          </div>
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSaving ? <Loader size="xs" color="white" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}

