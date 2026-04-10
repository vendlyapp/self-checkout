'use client'

import { ShieldCheck, Store, UserCircle2 } from 'lucide-react'

interface ProfileAccessCardProps {
  role: 'ADMIN' | 'SUPER_ADMIN' | 'CUSTOMER'
  storeName?: string
}

const ACCESS_BY_ROLE: Record<ProfileAccessCardProps['role'], string[]> = {
  ADMIN: [
    'Dashboard',
    'Produkte',
    'Bestellungen',
    'Rechnungen',
    'Kunden',
    'Rabatte & Codes',
    'Zahlungsarten',
    'Store-Einstellungen',
  ],
  SUPER_ADMIN: [
    'Super-Admin Dashboard',
    'Store-Verwaltung',
    'Benutzerverwaltung',
    'Globale Konfiguration',
    'Analyse & Monitoring',
  ],
  CUSTOMER: [
    'Bestellungen',
    'Rechnungen',
    'Konto',
  ],
}

const ROLE_LABEL: Record<ProfileAccessCardProps['role'], string> = {
  ADMIN: 'Store-Administrator',
  SUPER_ADMIN: 'Super-Administrator',
  CUSTOMER: 'Kunde',
}

export default function ProfileAccessCard({ role, storeName }: ProfileAccessCardProps) {
  const accesses = ACCESS_BY_ROLE[role] || []

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Zugriffsübersicht</h2>
          <p className="text-sm text-gray-500">Ihre aktuelle Rolle und Berechtigungen</p>
        </div>
      </div>

      <div className="mb-4 grid gap-2 rounded-xl bg-gray-50 p-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <UserCircle2 className="h-4 w-4 text-gray-500" />
          <span>{ROLE_LABEL[role]}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Store className="h-4 w-4 text-gray-500" />
          <span>{storeName || 'Kein Geschäft verknüpft'}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {accesses.map((item) => (
          <span
            key={item}
            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

