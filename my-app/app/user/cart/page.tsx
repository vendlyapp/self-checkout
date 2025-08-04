'use client';

import { useCartStore } from '@/lib/stores/cartStore';
import HeaderNav from '@/components/navigation/HeaderNav';
import React from 'react';
import HeaderUser from '@/components/navigation/user/HeaderUser';
import { Minus, Plus, Package } from 'lucide-react';
import Image from 'next/image'; 

export default function UserCartPage() {
  const { cartItems, updateQuantity } = useCartStore();

  return (
    <div className="flex flex-col min-h-full bg-background-cream">
      <HeaderUser />
      {/* Header fijo */}
      <HeaderNav title="Warenkorb"  />
      {/* Lista de productos */}
      <div className="flex-1 px-4 pt-4 pb-32 mt-[70px]">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">Dein Warenkorb ist leer</div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-xl p-4 flex items-center shadow-sm">
                <div className='flex items-center gap-2 w-[80px] h-[80px] rounded-[16px] overflow-hidden mr-4'>
                  {product.image ? (
                    <Image 
                      src={product.image} 
                      alt={product.name} 
                      width={100} 
                      height={100}
                      className="rounded-[16px] object-cover"
                    />
                  ) : (
                    <div className="w-[80px] h-[80px] rounded-[16px] bg-gray-100 flex items-center justify-center">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
                
                
                <div className=' w-[85%]'>
                  <div className="font-semibold text-[16px]">{product.name}</div>
                  <div className="font-bold text-[17px] mt-1">CHF {product.price} .-</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 rounded-full bg-[#BAB4B4] flex items-center justify-center text-xl font-bold"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    aria-label="Weniger"
                  >
                    <Minus className="w-6 h-6 font-bold text-white text-xl" />
                  </button>
                  <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
                  <button
                    className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-bold"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    aria-label="Mehr"
                  >
                    <Plus className="w-8 h-8 font-bold text-white " />
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