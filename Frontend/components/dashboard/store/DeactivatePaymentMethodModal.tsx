'use client'

import { X, AlertTriangle } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { PaymentMethod } from './PaymentMethodsPage'

interface DeactivatePaymentMethodModalProps {
  isOpen: boolean
  method: PaymentMethod | null
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function DeactivatePaymentMethodModal({
  isOpen,
  method,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeactivatePaymentMethodModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container')
      if (!container) {
        container = document.createElement('div')
        container.id = 'global-modals-container'
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100%'
        container.style.height = '100%'
        container.style.pointerEvents = 'none'
        container.style.zIndex = '99999'
        document.body.appendChild(container)
      }
      setModalContainer(container)
    }
  }, [])

  if (!isOpen || !modalContainer || !method) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-scale-in gpu-accelerated">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Zahlungsart deaktivieren?
              </h2>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex-shrink-0">
              {method.icon}
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                {method.name}
              </p>
              <p className="text-sm text-gray-500">
                Aktuell aktiv
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            Möchten Sie diese Zahlungsart wirklich deaktivieren?
            <br />
            <br />
            <span className="text-sm text-gray-500">
              Kunden können diese Zahlungsmethode dann nicht mehr verwenden. Sie können sie jederzeit wieder aktivieren.
            </span>
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation active:scale-95 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium active:bg-orange-700 transition-all touch-manipulation active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Wird deaktiviert...
                </>
              ) : (
                'Deaktivieren'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, modalContainer)
}

