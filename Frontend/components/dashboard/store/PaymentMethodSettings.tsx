'use client'

import { PaymentMethod } from './PaymentMethodsPage'
import { CheckCircle2, Settings, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PaymentMethodSettingsProps {
  paymentMethods: PaymentMethod[]
}

const PaymentMethodSettings = ({ paymentMethods }: PaymentMethodSettingsProps) => {
  const settingsItems = [
    {
      id: 'twint',
      name: 'TWINT',
      subtitle: 'bereits eingerichtet',
      icon: <CheckCircle2 className="w-5 h-5 text-[#25D076]" />,
      isConfigured: true,
    },
    {
      id: 'qr-rechnung',
      name: 'QR Rechnung',
      subtitle: 'bereits eingerichtet',
      icon: <CheckCircle2 className="w-5 h-5 text-[#25D076]" />,
      isConfigured: true,
    },
    {
      id: 'debit-kreditkarte',
      name: 'Debit-/Kreditkarte',
      subtitle: 'konfigurieren',
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      isConfigured: false,
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      subtitle: 'konfigurieren',
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      isConfigured: false,
    },
    {
      id: 'klarna',
      name: 'Klarna',
      subtitle: 'konfigurieren',
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      isConfigured: false,
    },
    {
      id: 'weitere',
      name: 'Weitere Einstellungen',
      subtitle: 'ansehen',
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      isConfigured: false,
    },
  ]

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
          {settingsItems.map((item, index) => (
            <Link
              key={item.id}
              href="#"
              className="block group"
            >
              <div 
                className={`px-4 py-4 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] gpu-accelerated ${
                  index !== settingsItems.length - 1 ? 'border-b border-gray-200' : ''
                }`}
                style={{
                  animation: 'fade-in-scale 0.3s ease-out',
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                      {item.icon}
                    </div>
                    
                    {/* Name and Subtitle */}
                    <div className="flex-1 min-w-0">
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodSettings

