'use client'

import { ShoppingBag, ChevronRight } from 'lucide-react'
import { Product } from './data/mockProducts'

interface CartItem {
  product: Product
  quantity: number
}

interface CartSummaryProps {
  items: CartItem[]
  onContinue: () => void
}

export default function CartSummary({ items, onContinue }: CartSummaryProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  const formatPrice = (price: number) => {
    return `CHF ${price.toFixed(2)}`
  }

  if (totalItems === 0) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Cart Info */}
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium">
            {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
          </span>
        </div>

        {/* Total Price */}
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">
            {formatPrice(totalPrice)}
          </span>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="bg-white text-green-500 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <span>Weiter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 