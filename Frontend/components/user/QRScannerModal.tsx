'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, QrCode, Camera, Loader2 } from 'lucide-react'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { toast } from 'sonner'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export const QRScannerModal = ({ isOpen, onClose }: QRScannerModalProps) => {
  const router = useRouter()
  const { setStore } = useScannedStoreStore()
  const [storeSlug, setStoreSlug] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStoreSlug('')
      setError('')
    }
  }, [isOpen])

  const handleScan = async () => {
    if (!storeSlug.trim()) {
      setError('Por favor ingresa el código de la tienda')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Verificar que la tienda existe
      const response = await fetch(`http://localhost:5000/api/store/${storeSlug.trim()}`)
      const result = await response.json()

      if (!result.success) {
        setError('Tienda no encontrada')
        setLoading(false)
        return
      }

      // Guardar tienda en el store
      setStore(result.data)
      
      // Redirigir a la tienda
      toast.success(`Bienvenido a ${result.data.name}`)
      router.push(`/store/${result.data.slug}`)
      onClose()
    } catch (err) {
      console.error('Error:', err)
      setError('Error al buscar la tienda')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center">
              <QrCode className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Geschäft scannen
              </h2>
              <p className="text-sm text-gray-500">
                QR-Code eingeben
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Icono de cámara */}
          <div className="flex justify-center py-8 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <Camera className="w-16 h-16 text-brand-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📱 Wie funktioniert es?
            </p>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Scannen Sie den QR-Code des Geschäfts</li>
              <li>2. Oder geben Sie den Code manuell ein</li>
              <li>3. Sehen Sie sich die Produkte an</li>
            </ol>
          </div>

          {/* Input manual */}
          <div>
            <label htmlFor="storeSlug" className="block text-sm font-semibold text-gray-700 mb-2">
              Code des Geschäfts
            </label>
            <input
              id="storeSlug"
              type="text"
              value={storeSlug}
              onChange={(e) => {
                setStoreSlug(e.target.value)
                setError('')
              }}
              onKeyPress={handleKeyPress}
              placeholder="z.B. mein-laden"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleScan}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Laden...
                </>
              ) : (
                'Öffnen'
              )}
            </button>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Der QR-Code befindet sich im Geschäft oder auf der Speisekarte
          </p>
        </div>
      </div>
    </div>
  )
}

