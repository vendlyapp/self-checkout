'use client'

import { useState } from 'react'
import PaymentMethodCard from './PaymentMethodCard'
import PaymentMethodSettings from './PaymentMethodSettings'
import DeactivatePaymentMethodModal from './DeactivatePaymentMethodModal'
import ConfigurePaymentMethodModal, { PaymentMethodConfig } from './ConfigurePaymentMethodModal'
import { 
  QrCode, 
  Coins
} from 'lucide-react'

export interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  isActive: boolean
  isConfigured?: boolean
}

const PaymentMethodsPage = () => {
  const [deactivateModal, setDeactivateModal] = useState<{
    isOpen: boolean
    method: PaymentMethod | null
  }>({
    isOpen: false,
    method: null,
  })
  const [isDeactivating, setIsDeactivating] = useState(false)

  const [configureModal, setConfigureModal] = useState<{
    isOpen: boolean
    method: PaymentMethod | null
  }>({
    isOpen: false,
    method: null,
  })
  const [isConfiguring, setIsConfiguring] = useState(false)

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'twint',
      name: 'Twint',
      icon: (
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white font-bold text-lg relative z-10">T</div>
          </div>
          {/* Colorful accent shapes */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      ),
      isActive: true,
      isConfigured: true,
    },
    {
      id: 'qr-rechnung',
      name: 'QR Rechnung',
      icon: (
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
          <QrCode className="w-6 h-6 text-white" />
        </div>
      ),
      isActive: true,
      isConfigured: true,
    },
    {
      id: 'bargeld',
      name: 'Bargeld',
      icon: (
        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
          <Coins className="w-6 h-6 text-white" />
        </div>
      ),
      isActive: true,
      isConfigured: false,
    },
    {
      id: 'debit-kreditkarte',
      name: 'Debit-/Kreditkarte',
      icon: (
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <div className="w-4 h-4 rounded-full bg-orange-500 -ml-2"></div>
          </div>
        </div>
      ),
      isActive: false,
      isConfigured: false,
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      icon: (
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-black font-semibold text-xs">Pay</div>
        </div>
      ),
      isActive: false,
      isConfigured: false,
    },
    {
      id: 'klarna',
      name: 'Klarna',
      icon: (
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-pink-500 font-semibold text-xs">Klarna</div>
        </div>
      ),
      isActive: false,
      isConfigured: false,
    },
  ])

  const handleToggle = (id: string) => {
    const method = paymentMethods.find(m => m.id === id)
    if (!method) return

    // Si está activo y queremos desactivarlo, mostrar modal de confirmación
    if (method.isActive) {
      setDeactivateModal({
        isOpen: true,
        method: method,
      })
    } else {
      // Si está inactivo, activarlo directamente
      setPaymentMethods(prev =>
        prev.map(m =>
          m.id === id ? { ...m, isActive: true } : m
        )
      )
    }
  }

  const handleConfirmDeactivate = async () => {
    if (!deactivateModal.method) return

    setIsDeactivating(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800))

    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === deactivateModal.method!.id
          ? { ...method, isActive: false }
          : method
      )
    )

    setIsDeactivating(false)
    setDeactivateModal({ isOpen: false, method: null })
  }

  const handleCancelDeactivate = () => {
    setDeactivateModal({ isOpen: false, method: null })
  }

  const handleConfigure = (method: PaymentMethod) => {
    setConfigureModal({ isOpen: true, method })
  }

  const handleSaveConfiguration = async (config: PaymentMethodConfig) => {
    if (!configureModal.method) return

    setIsConfiguring(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Aquí puedes usar la configuración para guardar en el backend
    // Por ahora solo marcamos como configurado
    console.log('Guardando configuración:', config)

    // Actualizar el método como configurado
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === configureModal.method!.id
          ? { ...method, isConfigured: true }
          : method
      )
    )

    setIsConfiguring(false)
    setConfigureModal({ isOpen: false, method: null })
  }

  const handleCancelConfiguration = () => {
    setConfigureModal({ isOpen: false, method: null })
  }

  const activeMethods = paymentMethods.filter(method => method.isActive)
  const inactiveMethods = paymentMethods.filter(method => !method.isActive)

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Aktive Section */}
        {activeMethods.length > 0 && (
          <div className="animate-slide-down">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Aktive</h2>
            <div className="space-y-3">
              {activeMethods.map((method, index) => (
                <div
                  key={method.id}
                  className="animate-fade-in-scale"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <PaymentMethodCard
                    method={method}
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inaktive Section */}
        {inactiveMethods.length > 0 && (
          <div className="animate-slide-down">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Inaktive</h2>
            <div className="space-y-3">
              {inactiveMethods.map((method, index) => (
                <div
                  key={method.id}
                  className="animate-fade-in-scale"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <PaymentMethodCard
                    method={method}
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zahlungsarten Einstellungen Section */}
        <div className="animate-slide-down">
          <PaymentMethodSettings 
            paymentMethods={paymentMethods} 
            onConfigure={handleConfigure}
          />
        </div>
      </div>

      {/* Modal de confirmación de desactivación */}
      <DeactivatePaymentMethodModal
        isOpen={deactivateModal.isOpen}
        method={deactivateModal.method}
        onConfirm={handleConfirmDeactivate}
        onCancel={handleCancelDeactivate}
        isLoading={isDeactivating}
      />

      {/* Modal de configuración */}
      <ConfigurePaymentMethodModal
        isOpen={configureModal.isOpen}
        method={configureModal.method}
        onSave={handleSaveConfiguration}
        onCancel={handleCancelConfiguration}
        isLoading={isConfiguring}
      />
    </>
  )
}

export default PaymentMethodsPage

