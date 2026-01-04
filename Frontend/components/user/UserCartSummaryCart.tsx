'use client'
import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter, useParams } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';

interface UserCartSummaryCartProps {
  variant?: 'inline';
}

export default function UserCartSummaryCart({ variant }: UserCartSummaryCartProps) {
  const { cartItems, promoApplied, promoCode, discountAmount, promoInfo } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { store } = useScannedStoreStore();
  const slug = params?.slug as string || store?.slug;

  // Solo productos con cantidad > 0
  const validCartItems = cartItems ? cartItems.filter(item => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  // Inline: diseño optimizado para móvil con safe areas
  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalAfterDiscount = promoApplied ? subtotal - (discountAmount || 0) : subtotal;

    return (
      <div className="w-full max-w-[430px] mx-auto bg-white rounded-lg p-4 mb-1 rounded-t-xl safe-area-bottom overflow-hidden">
        {/* Subtotal - Solo mostrar si hay descuento aplicado */}
        {promoApplied && (
          <div className="flex items-center justify-between mb-2">
            <div className="text-gray-800 font-semibold text-[16px]">
              Zwischensumme
            </div>
            <div className="text-gray-800 text-[16px]">
              {formatSwissPriceWithCHF(subtotal)}
            </div>
          </div>
        )}

        {/* Descuento aplicado */}
        {promoApplied && (
          <div className="flex items-center justify-between mb-2">
            <div className="text-[#3C7E44] font-semibold text-[15px]">
              {promoInfo?.discountType === 'percentage' 
                ? `${Math.round(promoInfo.discountValue)}% Rabatt${promoInfo.description ? ` auf ${promoInfo.description}` : ''}`
                : promoInfo?.description 
                ? promoInfo.description
                : 'Rabatt'
              }
            </div>
            <div className="text-[#3C7E44] text-[15px] font-semibold">
              - {formatSwissPriceWithCHF(discountAmount || 0)}
            </div>
          </div>
        )}

        {/* Separador - Solo si hay descuento */}
        {promoApplied && (
          <div className="border-t border-gray-200 my-2"></div>
        )}

        {/* Sección superior con Gesamtbetrag */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900 mobile-lg">
              Gesamtbetrag
            </span>
            <span className="text-sm text-gray-500 mobile-sm">
              inkl. MwSt • {totalItems} Artikel
            </span>
          </div>
          <span className="text-2xl font-bold text-gray-900 mobile-xl">
            {formatSwissPriceWithCHF(totalAfterDiscount)}
          </span>
        </div>

        {/* Botón Zur Bezahlung optimizado para móvil */}
        <button
          className="w-[85%] mx-auto bg-[#25D076] text-white py-4 mb-2 px-6 rounded-full font-semibold text-lg 
                   flex items-center justify-center gap-2 touch-target 
                   tap-highlight-transparent ios-scroll-fix"
          onClick={() => router.push(slug ? `/store/${slug}/payment` : "/user/payment")}
          style={{ minHeight: "48px" }}
          aria-label="Zur Bezahlung gehen"
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
      onContinue={() => router.push(slug ? `/store/${slug}/cart` : '/user/cart')}
    />
  );
}
