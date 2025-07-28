'use client'
import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface UserCartSummaryCartProps {
  variant?: 'inline';
}

export default function UserCartSummaryCart({ variant }: UserCartSummaryCartProps) {
  const { cartItems, clearCart } = useCartStore();
  const router = useRouter();

  // Solo productos con cantidad > 0
  const validCartItems = cartItems ? cartItems.filter(item => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return `CHF ${price.toFixed(2)}`;
  };

  // Inline: diseño como la imagen
  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    return (
      <div className="w-full bg-white rounded-lg p-4 mb-1 animate-fade-up">
        {/* Sección superior con Gesamtbetrag */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              Gesamtbetrag
            </span>
            <span className="text-sm text-gray-500">
              inkl. MwSt • {totalItems} Artikel
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(totalPrice)}
          </span>
        </div>
        
        {/* Botón Zur Bezahlung */}
        <button
          className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => router.push('/user/payment')}
        >
          Zur Bezahlung
          <ArrowRight className="w-5 h-5" />
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