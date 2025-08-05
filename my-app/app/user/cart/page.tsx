'use client';

import { useCartStore } from '@/lib/stores/cartStore';
import HeaderNav from '@/components/navigation/HeaderNav';
import React from 'react';
import ProductCard from '@/components/dashboard/charge/ProductCard';
import { Product } from '@/components/dashboard/products_list/data/mockProducts';

export default function UserCartPage() {
  const { cartItems, updateQuantity } = useCartStore();

  const handleUpdateQuantity = (product: Product, newQuantity: number) => {
    updateQuantity(product.id, newQuantity);
  };

  return (
    <div className="flex flex-col min-h-full bg-background-cream">
      
      <HeaderNav title="Warenkorb"  />
      {/* Lista de productos */}
      <div className="flex-1 px-4 pt-4 pb-32 mt-[70px]">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 mt-16">Dein Warenkorb ist leer</div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(({ product, quantity }) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleUpdateQuantity}
                initialQuantity={quantity}
              />
            ))}
            {/* Promo code */}
            <div className="text-green-600 text-sm font-semibold mt-2 cursor-pointer">Promo Code?</div>
          </div>
        )}
      </div>
    </div>
  );
} 