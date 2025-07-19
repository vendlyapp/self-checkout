'use client'

import { useCartStore } from '@/lib/stores/cartStore'
import ProductCard from '@/components/dashboard/charge/ProductCard'
import { useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FooterContinue from '@/components/dashboard/charge/FooterContinue'
import FixedHeaderContainerSimple from '@/components/dashboard/charge/FixedHeaderContainerSimple'

export default function CartPage() {
  const { cartItems, updateQuantity } = useCartStore()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const router = useRouter()

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  // Aplica el código promocional
  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'CHECK01') {
      const discount = +(subtotal * 0.10).toFixed(2)
      setDiscountAmount(discount)
      setPromoApplied(true)
      setPromoError('')
    } else {
      setPromoApplied(false)
      setDiscountAmount(0)
      setPromoError('Der Code existiert nicht oder ist ungültig.')
    }
  }

  // Quita el código promocional
  const handleRemovePromo = () => {
    setPromoApplied(false)
    setDiscountAmount(0)
    setPromoCode('')
  }

  const total = +(subtotal - discountAmount).toFixed(2)

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
  }

  const handleContinue = () => {
    // Cambia la ruta según tu flujo de pago
    router.push('/charge/payment')
  }

  return (
    <FixedHeaderContainerSimple title="Warenkorb">
      <div className="flex flex-col min-h-screen bg-background-cream">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto pb-40 px-2 pt-2">
            <div className="space-y-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="text-center text-gray-500">Dein Warenkorb ist leer.</div>
                  <button
                    onClick={() => router.push('/charge')}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full px-6 py-3 text-[17px] mt-2 transition-colors shadow"
                    aria-label="Zurück zu den Produkten"
                  >
                    Zurück zu den Produkten
                  </button>
                </div>
              ) : (
                cartItems.map(({ product, quantity }) => (
                  <div className="space-y-2 pl-4 pr-4" key={product.id}>
                    <ProductCard
                      key={product.id}
                      product={product}
                      initialQuantity={quantity}
                      onAddToCart={(_product, newQuantity) => handleQuantityChange(product.id, newQuantity)}
                    />
                  </div>
                ))
              )}
            </div>
            {/* Promo Code */}
            <div className="mt-6 px-2 pl-4 pr-4 pb-24">
              <label htmlFor="promo" className="text-green-600 text-[15px] font-semibold">Promo Code?</label>
              {!promoApplied ? (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex gap-2">
                    <input
                      id="promo"
                      type="text"
                      autoCapitalize="characters"
                      maxLength={10}
                      value={promoCode}
                      onChange={e => {
                        setPromoCode(e.target.value)
                        setPromoError('')
                      }}
                      placeholder="Gib deinen Code ein"
                      className="block w-full rounded-lg border uppercase border-gray-300 px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Promo Code"
                      onKeyDown={e => { if (e.key === 'Enter') handleApplyPromo() }}
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg px-4 py-2 text-[15px] transition-colors"
                      aria-label="Promo anwenden"
                    >
                      Anwenden
                    </button>
                  </div>
                  {promoError && (
                    <span className="text-red-600 text-[14px] font-medium mt-1">{promoError}</span>
                  )}
                </div>
              ) : (
                <div className="flex items-center bg-green-100 rounded-xl px-4 py-3 mt-2 mb-2 shadow-sm border border-green-200">
                  <div className="flex-1">
                    <div className="text-green-700 font-semibold text-[15px] leading-tight">10% Rabatt auf Bio-Produkte</div>
                    <div className="text-green-700 text-[15px]">- CHF {discountAmount.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="ml-2 p-1 rounded-full hover:bg-green-200 focus:outline-none"
                    aria-label="Promo entfernen"
                    tabIndex={0}
                  >
                    <X className="w-5 h-5 text-green-700" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
        <FooterContinue
          subtotal={subtotal}
          promoApplied={promoApplied}
          discountAmount={discountAmount}
          totalItems={totalItems}
          total={total}
          onContinue={handleContinue}
        />
      </div>
    </FixedHeaderContainerSimple>
  )
} 