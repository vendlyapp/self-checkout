'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/stores/cartStore';
import { clsx } from 'clsx';

interface CartSummaryProps {
  isMobile?: boolean;
  className?: string;
}

export default function CartSummary({ isMobile = false, className }: CartSummaryProps) {
  const { cartItems, getTotalItems, getSubtotal } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getSubtotal();
  const isEmpty = cartItems.length === 0;


  // No mostrar si el carrito está vacío
  if (isEmpty) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className={clsx(
      "bg-[#25D076] rounded-lg text-white shadow-lg",
      isMobile ? "mx-0 flex items-center justify-between p-4" : "p-4 space-y-3",
      className
    )}>
      {/* Cart info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
          </p>
          <p className="text-lg font-bold">
            {formatPrice(totalPrice)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className={clsx(
        "flex gap-2",
        isMobile ? "flex-row" : "flex-col"
      )}>
        <Link
          href="/charge/cart"
          className={clsx(
            "bg-white text-gray-800 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors font-medium text-sm",
            isMobile ? "px-4 py-2" : "px-3 py-2 text-xs"
          )}
        >
          <span>Weiter</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

      </div>
    </div>
  );
}
