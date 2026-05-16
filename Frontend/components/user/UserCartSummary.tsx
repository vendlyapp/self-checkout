'use client';

import { useCartStore } from '@/lib/stores/cartStore';
import CartSummary from '../dashboard/charge/CartSummary';
import { useRouter, useParams } from 'next/navigation';
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore';
import { ChevronRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';

interface UserCartSummaryProps {
  variant?: 'inline';
}

export default function UserCartSummary({ variant }: UserCartSummaryProps) {
  const { cartItems } = useCartStore();
  const router = useRouter();
  const params = useParams();
  const { store } = useScannedStoreStore();
  const slug = (params?.slug as string) || store?.slug;

  const validCartItems = cartItems ? cartItems.filter((item) => item.quantity > 0) : [];
  if (!validCartItems || validCartItems.length === 0) return null;

  if (variant === 'inline') {
    const totalItems = validCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = validCartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return (
      <div className="flex h-[50px] w-full items-center justify-between gap-3 rounded-xl bg-brand-500 px-3.5 shadow-soft">
        <span className="min-w-0 truncate text-sm font-semibold text-white">
          {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}{' '}
          <span className="font-bold tabular-nums">{formatSwissPriceWithCHF(totalPrice)}</span>
        </span>
        <button
          type="button"
          className="flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg bg-white px-3 text-sm font-bold text-[#6E7996] shadow-sm tap-highlight-transparent transition-ios active:scale-[0.97] touch-target-sm"
          onClick={() => router.push(slug ? `/store/${slug}/payment` : '/')}
          aria-label="Zur Bezahlung gehen"
        >
          Bezahlen
          <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
        </button>
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
