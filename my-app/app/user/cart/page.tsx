'use client';

import { useCartStore } from '@/lib/stores/cartStore';
import HeaderNav from '@/components/navigation/HeaderNav';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function UserCartPage() {
  const { cartItems, updateQuantity, clearCart } = useCartStore();
  const router = useRouter();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const formatPrice = (price: number) => `CHF ${price.toFixed(2)}`;

  return (
    <div className="flex flex-col min-h-full bg-background-cream">
      {/* Header fijo */}
      <HeaderNav title="Warenkorb" />
      {/* Lista de productos */}
      <div className="flex-1 px-4 pt-4 pb-32">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">Dein Warenkorb ist leer</div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-semibold text-[16px]">{product.name}</div>
                  <div className="text-gray-500 text-sm">{product.description}</div>
                  <div className="font-bold text-[17px] mt-1">CHF {product.price}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-bold"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label="Weniger"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
                  <button
                    className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-bold"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label="Mehr"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
            {/* Promo code */}
            <div className="text-green-600 text-sm font-semibold mt-2 cursor-pointer">Promo Code?</div>
          </div>
        )}
      </div>
   
     
    </div>
  );
} 