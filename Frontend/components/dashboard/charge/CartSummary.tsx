'use client';

import { ShoppingCart, ChevronRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';

interface CartItem {
  product: { price: number };
  quantity: number;
}

interface CartSummaryProps {
  items: CartItem[];
  onContinue: () => void;
  isVisible?: boolean;
}

/** Sticky-Leiste auf /charge — gleicher Stil wie Store-Warenkorb */
export default function CartSummary({ items, onContinue, isVisible = true }: CartSummaryProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (totalItems === 0 || !isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gray-100">
            <ShoppingCart className="h-5 w-5 text-gray-600" strokeWidth={2} />
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#25D076] px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-500">
              {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
            </p>
            <p className="text-lg font-extrabold tabular-nums text-gray-900">
              {formatSwissPriceWithCHF(totalPrice)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl bg-gray-900 px-5 text-sm font-bold text-white active:scale-[0.98]"
        >
          Warenkorb
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
