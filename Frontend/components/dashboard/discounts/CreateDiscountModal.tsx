'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { DiscountCode } from './types'

interface CreateDiscountModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: DiscountFormData) => void
  editingCode?: DiscountCode | null
  onUpdate?: (id: string, data: DiscountFormData) => void
}

export interface DiscountFormData {
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  maxRedemptions: number
  validFrom: string
  validUntil: string
}

export default function CreateDiscountModal({
  isOpen,
  onClose,
  onCreate,
  editingCode,
  onUpdate,
}: CreateDiscountModalProps) {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null)
  const isEditing = !!editingCode
  
  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    maxRedemptions: 100,
    validFrom: '',
    validUntil: '',
  })
  
  // Drag to dismiss functionality
  const modalRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number>(0)
  const dragCurrentY = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const [translateY, setTranslateY] = useState(0)
  const [backdropOpacity, setBackdropOpacity] = useState(1)

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

  useEffect(() => {
    if (isOpen && editingCode) {
      // Pre-fill form when editing
      const validFrom = editingCode.valid_from.split('T')[0]
      const validUntil = editingCode.valid_until ? editingCode.valid_until.split('T')[0] : ''
      
      setFormData({
        code: editingCode.code,
        discountType: editingCode.discount_type,
        discountValue: editingCode.discount_value,
        maxRedemptions: editingCode.max_redemptions,
        validFrom,
        validUntil,
      })
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        maxRedemptions: 100,
        validFrom: '',
        validUntil: '',
      })
      // Reset drag state
      setTranslateY(0)
      setBackdropOpacity(1)
      isDragging.current = false
    }
  }, [isOpen, editingCode])

  // Drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    const touch = e.touches[0]
    dragStartY.current = touch.clientY
    isDragging.current = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    e.preventDefault()
    e.stopPropagation()
    
    const touch = e.touches[0]
    dragCurrentY.current = touch.clientY
    const deltaY = dragCurrentY.current - dragStartY.current
    
    // Only allow dragging down
    if (deltaY > 0) {
      setTranslateY(deltaY)
      // Fade backdrop as we drag
      const opacity = Math.max(0, 1 - deltaY / 300)
      setBackdropOpacity(opacity)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    e.stopPropagation()
    
    const deltaY = dragCurrentY.current - dragStartY.current
    const threshold = 100 // pixels to trigger close
    
    if (deltaY > threshold) {
      // Close modal with animation
      onClose()
    } else {
      // Snap back with smooth animation
      setTranslateY(0)
      setBackdropOpacity(1)
    }
    
    isDragging.current = false
    dragStartY.current = 0
    dragCurrentY.current = 0
  }

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.code.trim() && formData.discountValue > 0 && formData.validFrom) {
      if (isEditing && editingCode && onUpdate) {
        onUpdate(editingCode.id, formData)
      } else {
        onCreate(formData)
      }
    }
  }

  if (!isOpen || !modalContainer) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center animate-fade-in-scale"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: backdropOpacity }}
        onClick={onClose}
      />

      {/* Modal - Bottom Sheet */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-hidden gpu-accelerated ${
          translateY === 0 && !isDragging.current ? 'animate-slide-up-fade' : ''
        }`}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          willChange: 'transform',
        }}
      >
        {/* Handle bar - Draggable area */}
        <div
          className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing touch-manipulation select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Rabattcode bearbeiten' : 'Rabattcode erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Schliessen"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 overflow-y-auto max-h-[calc(92vh-100px)] overscroll-contain"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
          }}
        >
          <div className="space-y-5 pt-4">
            {/* Rabattcode */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Rabattcode
              </label>
              <input
                type="text"
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="Z.B. SOMMER25"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-transparent transition-all touch-manipulation"
                autoComplete="off"
                required
              />
            </div>

            {/* Rabatt-Art */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rabatt-Art
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: 'percentage' })}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all touch-manipulation active:scale-95 ${
                    formData.discountType === 'percentage'
                      ? 'border-[#25D076] text-[#25D076] bg-green-50'
                      : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300 active:bg-gray-50'
                  }`}
                >
                  % Prozent
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all touch-manipulation active:scale-95 ${
                    formData.discountType === 'fixed'
                      ? 'border-[#25D076] text-[#25D076] bg-green-50'
                      : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300 active:bg-gray-50'
                  }`}
                >
                  CHF Fixbetrag
                </button>
              </div>
            </div>

            {/* Prozent / Fixbetrag y Max. Einlösungen - Dos columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.discountType === 'percentage' ? 'Prozent' : 'Fixbetrag'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="discountValue"
                    value={formData.discountValue || ''}
                    onChange={(e) => {
                      const value = formData.discountType === 'percentage' 
                        ? Math.round(parseFloat(e.target.value) || 0)
                        : parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        discountValue: value,
                      })
                    }}
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-transparent transition-all pr-10"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    {formData.discountType === 'percentage' ? '%' : 'CHF'}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="maxRedemptions" className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Einlösungen
                </label>
                <input
                  type="number"
                  id="maxRedemptions"
                  value={formData.maxRedemptions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxRedemptions: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Gültig von y Gültig bis - Dos columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-2">
                  Gültig von
                </label>
                <input
                  type="date"
                  id="validFrom"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
                  Gültig bis <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  id="validUntil"
                  value={formData.validUntil || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value || '' })
                  }
                  min={formData.validFrom}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-all touch-manipulation active:scale-95"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#25D076] text-white rounded-xl font-medium hover:bg-[#20B866] active:bg-[#1DA55A] transition-all touch-manipulation active:scale-95 shadow-lg shadow-[#25D076]/20"
            >
              {isEditing ? 'Speichern' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, modalContainer)
}

