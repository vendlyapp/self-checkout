'use client'
import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter, useParams } from 'next/navigation';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';
import { ChevronRight } from 'lucide-react';

interface UserCartSummaryProps {
  variant?: 'inline';
}

export default function UserCartSummary({ variant }: UserCartSummaryProps) {
  const { cartItems } = useCartStore();
  const router = useRouter();
  const params = useParams();
  const { store } = useScannedStoreStore();
  const slug = params?.slug as string || store?.slug;

  // Solo productos con cantidad > 0
  const validCartItems = cartItems ? cartItems.filter(item => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  // Inline: barra optimizada para móvil con safe areas
  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return (
      <div className="w-full max-w-[430px] mx-auto bg-brand-500 rounded-lg flex items-center justify-between px-4 mb-3 
                      safe-area-bottom overflow-hidden h-[50px]">
        <span className="text-white font-semibold text-sm truncate">
          {totalItems} Artikel &bull; <span className="font-bold">CHF {totalPrice.toFixed(2)}</span>
        </span>
        <button
          className="bg-white text-[#6E7996] font-bold px-2 rounded-lg text-sm shadow-sm 
                   tap-highlight-transparent flex-shrink-0 h-[32px] flex items-center justify-center"
          onClick={() => router.push(slug ? `/store/${slug}/payment` : "/user/payment")}
          aria-label="Zur Bezahlung gehen"
        >
          <span>Bezahlen</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Default: barra flotante fixed
  return (
    <CartSummary
      items={validCartItems}
      onContinue={() => router.push(slug ? `/store/${slug}/cart` : '/user/cart')}
    />
  );
}
