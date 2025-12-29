'use client'

import { PaymentMethod } from './PaymentMethodsPage'
import { CheckCircle2, Settings, ChevronRight, Sliders } from 'lucide-react'

interface PaymentMethodSettingsProps {
  paymentMethods: PaymentMethod[]
  onConfigure: (method: PaymentMethod) => void
}

const PaymentMethodSettings = ({ paymentMethods, onConfigure }: PaymentMethodSettingsProps) => {
  // Mapear métodos de pago a items de configuración
  const getSettingsItems = () => {
    const methodMap: Record<string, PaymentMethod | undefined> = {}
    paymentMethods.forEach(method => {
      methodMap[method.id] = method
    })

    const items = [
      { id: 'twint', name: 'TWINT' },
      { id: 'qr-rechnung', name: 'QR Rechnung' },
      { id: 'debit-kreditkarte', name: 'Debit-/Kreditkarte' },
      { id: 'apple-pay', name: 'Apple Pay' },
      { id: 'klarna', name: 'Klarna' },
      { id: 'weitere', name: 'Weitere Einstellungen', isSpecial: true },
    ]

    return items.map(item => {
      const method = methodMap[item.id]
      const isConfigured = method?.isActive ?? false
      
      return {
        id: item.id,
        name: item.name,
        subtitle: isConfigured ? 'bereits eingerichtet' : item.isSpecial ? 'ansehen' : 'konfigurieren',
        method: method,
        isConfigured: isConfigured || false,
        isSpecial: item.isSpecial || false,
      }
    })
  }

  const settingsItems = getSettingsItems()

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Título dentro del contenedor */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Zahlungsarten Einstellungen
          </h2>
        </div>
        
        {/* Cards con separadores */}
        <div>
          {settingsItems.map((item, index) => {
            // Icono según el estado
            const iconSquare = item.isConfigured ? (
              <div className="w-10 h-10 bg-[#25D076] rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            ) : item.isSpecial ? (
              <div className="w-10 h-10 bg-[#f2ede8] rounded-lg flex items-center justify-center">
                <Sliders className="w-5 h-5 text-gray-600" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-[#f2ede8] rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
            )

            return (
              <button
                key={item.id}
                onClick={() => item.method && !item.isSpecial && onConfigure(item.method)}
                disabled={!item.method || item.isSpecial}
                className="w-full block group"
              >
                <div 
                  className={`px-4 py-4 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] gpu-accelerated ${
                    index !== settingsItems.length - 1 ? 'border-b border-gray-200' : ''
                  } ${!item.method || item.isSpecial ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    animation: 'fade-in-scale 0.3s ease-out',
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon Square */}
                      <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                        {iconSquare}
                      </div>
                      
                      {/* Name and Subtitle */}
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-base font-medium text-gray-900 truncate transition-colors group-hover:text-brand-600">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Chevron (solo >) */}
                    <div className="flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1">
                      <ChevronRight className="w-5 h-5 text-gray-400 transition-colors group-hover:text-brand-600" />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodSettings

