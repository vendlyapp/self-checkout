'use client'
import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';

interface UserCartSummaryCartProps {
  variant?: 'inline';
}

export default function UserCartSummaryCart({ variant }: UserCartSummaryCartProps) {
  const { cartItems, promoApplied, promoCode, discountAmount } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  // Solo productos con cantidad > 0
  const validCartItems = cartItems ? cartItems.filter(item => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  // Inline: diseño optimizado para móvil con safe areas
  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
      <div className="w-full max-w-[430px] mx-auto bg-white rounded-lg p-4 mb-1 animate-slide-up-fade shadow-t-sm shadow-black 
                      border-t-2 border-black/10 rounded-t-xl safe-area-bottom overflow-hidden gpu-accelerated">
        {/* Sección superior con Gesamtbetrag */}
        <div className="flex items-start justify-between mb-4 animate-stagger-1">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 mobile-lg transition-interactive">
              Gesamtbetrag
            </span>
            <span className="text-sm text-gray-500 mobile-sm transition-interactive">
              inkl. MwSt • {totalItems} Artikel
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 mobile-xl transition-interactive">
            {formatSwissPriceWithCHF(totalPrice)}
          </span>
        </div>

        {/* Código promocional aplicado */}
        {promoApplied && pathname === "/user/cart" && (
          <div className="mb-4 p-3 bg-[#F2FDF5] rounded-lg border border-[#3C7E44]/20 animate-stagger-2 animate-bounce-in">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[#3C7E44] text-[14px] font-medium mobile-sm transition-interactive">
                Promo Code:{" "}
                <span className="font-bold">{promoCode?.toUpperCase()}</span>
              </div>
              <div className="text-[#3C7E44] text-[12px] bg-[#3C7E44]/10 px-2 py-1 rounded-full mobile-xs transition-interactive">
                ✓ Angewendet
              </div>
            </div>
            <div className="text-[#3C7E44] text-[13px] mobile-xs transition-interactive">
              10% Rabatt auf Bio-Produkte -{" "}
              {formatSwissPriceWithCHF(discountAmount || 0)}
            </div>
          </div>
        )}

        {/* Botón Zur Bezahlung optimizado para móvil */}
        <button
          className="w-[85%] mx-auto bg-[#25D076] text-white py-4 mb-2 px-6 rounded-full font-semibold text-lg hover:bg-[#25D076]/80 
                   transition-interactive gpu-accelerated flex items-center justify-center gap-2 touch-target 
                   tap-highlight-transparent active:scale-95 hover:scale-105 ios-scroll-fix animate-stagger-3"
          onClick={() => router.push("/user/payment")}
          style={{ minHeight: "48px" }}
          aria-label="Zur Bezahlung gehen"
        >
          Zur Bezahlung
          <ArrowRight className="w-5 h-5 transition-interactive" />
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
