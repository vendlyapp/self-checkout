'use client'
import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter } from 'next/navigation';

interface UserCartSummaryProps {
  variant?: 'inline';
}

export default function UserCartSummary({ variant }: UserCartSummaryProps) {
  const { cartItems } = useCartStore();
  const router = useRouter();

  // Solo productos con cantidad > 0
  const validCartItems = cartItems ? cartItems.filter(item => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  // Inline: barra normal, no fixed ni z-index
  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return (
      <div className="w-full bg-brand-500 rounded-lg flex items-center justify-between px-4 py-2 mb-1 animate-fade-up ">
        <span className="text-white font-semibold text-base">
          {totalItems} Artikel &bull; CHF {totalPrice.toFixed(2)}
        </span>
        <button
          className="bg-white text-brand-500 font-bold px-5 py-2 rounded-full text-base shadow-sm hover:bg-gray-50 transition-colors"
          onClick={() => router.push('/user/cart')}
        >
          Bezahlen
        </button>
      </div>
    );
  }

  // Default: barra flotante fixed
  return (
    <CartSummary
      items={validCartItems}
      onContinue={() => router.push('/user/cart')}
    />
  );
} 