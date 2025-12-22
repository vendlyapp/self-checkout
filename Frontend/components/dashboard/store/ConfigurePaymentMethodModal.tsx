'use client'

import { X, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { PaymentMethod } from './PaymentMethodsPage'

export interface PaymentMethodConfig {
  apiKey?: string
  apiSecret?: string
  merchantId?: string
}

interface ConfigurePaymentMethodModalProps {
  isOpen: boolean
  method: PaymentMethod | null
  onSave: (config: PaymentMethodConfig) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfigurePaymentMethodModal({
  isOpen,
  method,
  onSave,
  onCancel,
  isLoading = false,
}: ConfigurePaymentMethodModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const [config, setConfig] = useState<PaymentMethodConfig>({})

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

  useEffect(() => {
    if (method && isOpen) {
      // Resetear configuración cuando se abre el modal
      setConfig({})
    }
  }, [method, isOpen])

  if (!isOpen || !modalContainer || !method) return null

  const handleSave = async () => {
    await onSave(config)
  }

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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-scale-in gpu-accelerated max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {method.name} einrichten
          </h2>
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
          <div className="space-y-4">
            {/* Aquí puedes agregar campos específicos según el método de pago */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Ingrese su API Key"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                API Secret
              </label>
              <input
                type="password"
                value={config.apiSecret || ''}
                onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                placeholder="Ingrese su API Secret"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Merchant ID (opcional)
              </label>
              <input
                type="text"
                value={config.merchantId || ''}
                onChange={(e) => setConfig({ ...config, merchantId: e.target.value })}
                placeholder="Ingrese su Merchant ID"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
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
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium active:bg-brand-700 transition-all touch-manipulation active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Speichern'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, modalContainer)
}

