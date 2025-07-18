'use client'

import HeaderNav from '@/components/navigation/HeaderNav'
import { useCartStore } from '@/lib/stores/cartStore'
import { CreditCard, Smartphone, FileText, DollarSign, ShieldCheck } from 'lucide-react'

export default function PaymentPage() {
  const { cartItems } = useCartStore()
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  // Simular lógica de descuento (igual que en el carrito)
  // Si el usuario aplicó CHECK01, hay un descuento del 10%
  // En un caso real, esto debería venir del store global
  let promoApplied = false
  let discountAmount = 0
  let total = subtotal

  // Aquí podrías obtener el estado real del promo code desde el store global si lo implementas
  if (typeof window !== 'undefined') {
    const promo = localStorage.getItem('cart-storage')
    if (promo && promo.includes('CHECK01')) {
      promoApplied = true
      discountAmount = +(subtotal * 0.10).toFixed(2)
      total = +(subtotal - discountAmount).toFixed(2)
    }
  }

  return (
    <div className="flex flex-col bg-background-cream ">
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-32">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6 mt-2">
            <div className="text-[18px] font-medium text-gray-700 mb-1">Heiniger’s Hofladen</div>
            {promoApplied && (
              <div className="text-[22px] text-gray-400 font-semibold line-through mb-1">CHF {subtotal.toFixed(2)}</div>
            )}
            <div className="text-[38px] font-bold text-gray-900 leading-tight">CHF {total.toFixed(2)}</div>
            {promoApplied && (
              <div className="text-green-700 text-[20px] font-semibold mb-1">10% Rabatt auf Bio-Produkte angewendet!</div>
            )}
            <div className="text-gray-500 text-[16px]">inkl. MwSt • {totalItems} Artikel</div>
          </div>
          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="text-center text-[18px] font-semibold text-gray-800 mb-4">Zahlungsart wählen:</div>
            <div className="flex flex-col gap-4">
              <button className="w-full flex items-center justify-center gap-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-[20px] py-4 shadow transition-colors" aria-label="TWINT">
                <Smartphone className="w-6 h-6" /> TWINT
              </button>
              <button className="w-full flex items-center justify-center gap-3 rounded-full bg-[#7e8bb6] hover:bg-[#6b7aa3] text-white font-bold text-[20px] py-4 shadow transition-colors" aria-label="Zahlungslink">
                <CreditCard className="w-6 h-6" /> Zahlungslink
              </button>
              <button className="w-full flex items-center justify-center gap-3 rounded-full bg-[#7b7575] hover:bg-[#6a6565] text-white font-bold text-[20px] py-4 shadow transition-colors" aria-label="Bargeld">
                <DollarSign className="w-6 h-6" /> Bargeld
              </button>
              <button className="w-full flex items-center justify-center gap-3 rounded-full bg-[#1d3b36] hover:bg-[#16302b] text-white font-bold text-[20px] py-4 shadow transition-colors" aria-label="Rechnung">
                <FileText className="w-6 h-6" /> Rechnung
              </button>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto mt-auto mb-2">
          <div className="flex items-center gap-2 justify-center text-[15px] text-gray-700 bg-white rounded-xl py-3 px-4 shadow border border-gray-100">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-2" />
            <span className="font-semibold">256-BIT SSL VERSCHLÜSSELUNG</span>
            <ShieldCheck className="w-5 h-5 ml-1 text-green-600" />
          </div>
          <div className="text-center text-[13px] text-gray-500 mt-1">
            Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren verarbeitet
          </div>
        </div>
      </main>
    </div>
  )
} 