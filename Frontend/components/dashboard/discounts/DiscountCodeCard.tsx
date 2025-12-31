'use client'

import { Edit, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import { DiscountCode } from './types'

interface DiscountCodeCardProps {
  code: DiscountCode
  onEdit: () => void
  onDelete: () => void
}

export default function DiscountCodeCard({
  code,
  onEdit,
  onDelete,
}: DiscountCodeCardProps) {
  const isActive = code.status === 'active'
  const isArchived = code.status === 'archived' || code.archived
  const progressPercentage = (code.current_redemptions / code.max_redemptions) * 100
  const validUntil = code.valid_until ? new Date(code.valid_until) : null
  const isExpired = validUntil && validUntil < new Date()

  const getExpiryText = () => {
    if (!validUntil) return 'Unbegrenzt'
    if (isExpired) return 'Abgelaufen'
    const day = validUntil.getDate().toString().padStart(2, '0')
    const month = (validUntil.getMonth() + 1).toString().padStart(2, '0')
    const year = validUntil.getFullYear().toString().slice(-2)
    return `Bis ${day}.${month}.${year}`
  }

  const getDiscountText = () => {
    if (code.discount_type === 'percentage') {
      // Mostrar porcentaje sin decimales
      const percentage = Math.round(Number(code.discount_value))
      return `${percentage}% Rabatt`
    }
    // Para montos fijos, mostrar con 2 decimales
    const fixedAmount = Number(code.discount_value)
    return `CHF ${fixedAmount.toFixed(2)} Rabatt`
  }

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
      !isActive && !isArchived ? 'opacity-60' : isArchived ? 'opacity-75 bg-gray-50' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{code.code}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isArchived
                  ? 'bg-gray-200 text-gray-700'
                  : isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isArchived ? 'Archiviert' : isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{getDiscountText()}</p>
        </div>
        {!isArchived && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Bearbeiten"
            >
              <Edit className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
              aria-label="Archivieren"
            >
              <Trash2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Usage Info */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-gray-600">
            Einlösungen: <span className="font-semibold text-gray-900">{code.current_redemptions}</span> / <span className="font-semibold text-gray-900">{code.max_redemptions}</span>
          </p>
          <p className={clsx(
            "text-sm font-semibold",
            code.max_redemptions - code.current_redemptions === 0
              ? "text-red-600"
              : code.max_redemptions - code.current_redemptions <= code.max_redemptions * 0.2
              ? "text-orange-600"
              : "text-gray-700"
          )}>
            {Math.max(0, code.max_redemptions - code.current_redemptions)} verbleibend
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              code.current_redemptions >= code.max_redemptions
                ? 'bg-red-500'
                : code.current_redemptions >= code.max_redemptions * 0.8
                ? 'bg-orange-500'
                : isActive
                ? 'bg-[#25D076]'
                : 'bg-gray-400'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        {code.current_redemptions >= code.max_redemptions && (
          <p className="text-xs text-red-600 mt-1 font-medium">
            Limit erreicht - Code automatisch deaktiviert
          </p>
        )}
      </div>

      {/* Expiry Date */}
      <div className="text-sm text-gray-600">
        <span>{getExpiryText()}</span>
      </div>
    </div>
  )
}

