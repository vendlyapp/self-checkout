'use client'

import { X, Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { PaymentMethod } from './PaymentMethodsPage'
import { getAvailablePaymentMethod, type AvailablePaymentMethod } from '@/lib/constants/paymentMethods'
import { getPaymentMethodIcon, isSvgIcon } from '@/lib/utils/paymentMethodIcons'
import Image from 'next/image'
import React from 'react'

export interface PaymentMethodConfig {
  [key: string]: string | number | boolean | undefined
}

interface ConfigurePaymentMethodModalProps {
  isOpen: boolean
  method: PaymentMethod | null
  availableMethod: AvailablePaymentMethod | null
  onSave: (config: PaymentMethodConfig) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfigurePaymentMethodModal({
  isOpen,
  method,
  availableMethod,
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

  // Determinar qué método usar (el disponible o el que viene del método existente)
  const methodToConfigure = availableMethod || (method ? getAvailablePaymentMethod(method.apiMethod.code) : null)

  useEffect(() => {
    if (methodToConfigure && isOpen) {
      // Si hay un método existente con config, cargar esos valores
      if (method?.apiMethod.config) {
        setConfig(method.apiMethod.config as PaymentMethodConfig)
      } else {
        // Resetear configuración cuando se abre el modal
        setConfig({})
      }
    }
  }, [method, methodToConfigure, isOpen])

  if (!isOpen || !modalContainer || !methodToConfigure) return null

  const handleSave = async () => {
    // Validar campos requeridos
    const requiredFields = methodToConfigure.configFields.filter((field) => field.required)
    const missingFields = requiredFields.filter((field) => !config[field.key] || String(config[field.key]).trim() === '')

    if (missingFields.length > 0) {
      alert(`Bitte füllen Sie alle erforderlichen Felder aus: ${missingFields.map((f) => f.label).join(', ')}`)
      return
    }

    await onSave(config)
  }

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Renderizar icono
  const isSvg = isSvgIcon(methodToConfigure.icon)
  const iconPath = methodToConfigure.icon

  const iconElement = isSvg && iconPath ? (
    <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white border border-gray-200">
      <Image 
        src={iconPath} 
        alt={`${methodToConfigure.displayName} icon`}
        width={48}
        height={48}
        className="object-contain"
      />
    </div>
  ) : (
    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
      {React.createElement(getPaymentMethodIcon(methodToConfigure.icon), { className: 'w-7 h-7 text-gray-600' })}
    </div>
  )

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        // Cerrar solo si se hace clic en el backdrop
        if (e.target === e.currentTarget && !isLoading) {
          onCancel()
        }
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-scale"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl animate-scale-in gpu-accelerated max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            {iconElement}
            <h2 className="text-xl font-semibold text-gray-900">
              {methodToConfigure.displayName} einrichten
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 touch-target"
            aria-label="Modal schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            {methodToConfigure.description}
          </p>

          <div className="space-y-4">
            {methodToConfigure.configFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={field.type}
                  value={String(config[field.key] || '')}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  required={field.required}
                />
              </div>
            ))}
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
              className="flex-1 px-4 py-3 bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl font-medium active:bg-[#25D076]/80 transition-all touch-manipulation active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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
