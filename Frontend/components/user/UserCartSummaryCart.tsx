'use client'
import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter, useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';

interface UserCartSummaryCartProps {
  variant?: 'inline';
}

export default function UserCartSummaryCart({ variant }: UserCartSummaryCartProps) {
  const { cartItems, promoApplied, discountAmount, promoInfo } = useCartStore();
  const router = useRouter();
  const params = useParams();
  const { store } = useScannedStoreStore();
  const slug = params?.slug as string || store?.slug;

  const validCartItems = cartItems ? cartItems.filter(item => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = validCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalAfterDiscount = promoApplied ? subtotal - (discountAmount || 0) : subtotal;

    return (
      <div className="w-full border-b border-gray-100 bg-white px-3 py-2.5">
        {promoApplied && (
          <div className="mb-2 space-y-1 text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <span className="font-medium">Zwischensumme</span>
              <span className="tabular-nums">{formatSwissPriceWithCHF(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-[#3C7E44]">
              <span className="truncate pr-2">
                {promoInfo?.discountType === 'percentage'
                  ? `${Math.round(promoInfo.discountValue)}% Rabatt`
                  : promoInfo?.description || 'Rabatt'}
              </span>
              <span className="shrink-0 tabular-nums">− {formatSwissPriceWithCHF(discountAmount || 0)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-tight text-gray-900">Gesamtbetrag</p>
            <p className="mt-0.5 text-xs leading-tight text-gray-500">
              inkl. MwSt · {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
            </p>
          </div>
          <p className="shrink-0 text-lg font-bold tabular-nums leading-none text-gray-900">
            {formatSwissPriceWithCHF(totalAfterDiscount)}
          </p>
          <button
            type="button"
            className="flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-brand-500 px-3.5 text-sm font-semibold text-white shadow-soft tap-highlight-transparent transition-ios active:scale-[0.97] touch-target-sm"
            onClick={() => router.push(slug ? `/store/${slug}/payment` : '/')}
            aria-label="Zur Bezahlung gehen"
          >
            Bezahlen
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <CartSummary
      items={validCartItems}
      onContinue={() => router.push(slug ? `/store/${slug}/cart` : '/')}
    />
  );
}
