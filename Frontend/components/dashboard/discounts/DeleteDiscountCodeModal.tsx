'use client'

import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { DiscountCode } from './types'
import { useState, useEffect } from 'react'

interface DeleteDiscountCodeModalProps {
  code: DiscountCode
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

export default function DeleteDiscountCodeModal({
  code,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteDiscountCodeModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container')
      if (!container) {
        container = document.createElement('div')
        container.id = 'global-modals-container'
        document.body.appendChild(container)
      }
      setModalContainer(container)
    }
  }, [])

  if (!modalContainer) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in-scale"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-interactive animate-fade-in-scale"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-scale-in gpu-accelerated mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Código löschen</h2>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Schließen"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Sind Sie sicher, dass Sie den Code <span className="font-semibold">{code.code}</span> löschen möchten?
          </p>
          <p className="text-sm text-gray-500">
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation active:scale-95 disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 active:bg-red-800 transition-all touch-manipulation active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Löschen...
              </>
            ) : (
              'Löschen'
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, modalContainer)
}

