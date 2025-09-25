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

  // Inline: barra optimizada para móvil con safe areas
  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    return (
      <div className="w-full max-w-[430px] mx-auto bg-brand-500 rounded-lg flex items-center justify-between px-4 py-3 mb-3 animate-fade-up safe-area-bottom overflow-hidden">
        <span className="text-white font-semibold text-base mobile-base truncate mb-3">
          {totalItems} Artikel &bull; CHF {totalPrice.toFixed(2)}
        </span>
        <button
          className="bg-white text-[#6E7996] font-bold px-5 mb-3 py-2 rounded-lg text-base shadow-sm hover:bg-gray-50 transition-colors touch-target tap-highlight-transparent active:scale-95 flex-shrink-0"
          onClick={() => router.push("/user/payment")}
          style={{ minHeight: "44px", minWidth: "100px" }}
          aria-label="Zur Bezahlung gehen"
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
