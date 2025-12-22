'use client'

import { PaymentMethod } from './PaymentMethodsPage'

interface PaymentMethodCardProps {
  method: PaymentMethod
  onToggle: (id: string) => void
}

const PaymentMethodCard = ({ method, onToggle }: PaymentMethodCardProps) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 active:scale-[0.98] gpu-accelerated">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Icon */}
          <div className="flex-shrink-0 transition-transform duration-200 hover:scale-110">
            {method.icon}
          </div>
          
          {/* Name */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 truncate transition-colors">
              {method.name}
            </h3>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => onToggle(method.id)}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95 ${
            method.isActive 
              ? 'bg-[#25D076] shadow-sm shadow-[#25D076]/30' 
              : 'bg-gray-300'
          }`}
          role="switch"
          aria-checked={method.isActive}
          aria-label={`Toggle ${method.name}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
              method.isActive 
                ? 'translate-x-6 scale-100' 
                : 'translate-x-1 scale-100'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export default PaymentMethodCard

