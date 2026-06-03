'use client';

import { formatSwissPriceWithCHF } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cartStore';

type FooterContinueProps = {
  subtotal: number;
  promoApplied: boolean;
  discountAmount: number;
  totalItems: number;
  total: number;
  onContinue?: () => void;
};

export default function FooterContinue({
  subtotal,
  promoApplied,
  discountAmount,
  totalItems,
  total,
  onContinue,
}: FooterContinueProps) {
  const { promoInfo } = useCartStore();

  const discountLabel =
    promoInfo?.discountType === 'percentage'
      ? `${Math.round(promoInfo.discountValue)}% Rabatt`
      : promoInfo?.description || 'Rabatt';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto max-w-3xl px-4 py-3">
        {promoApplied && (
          <div className="mb-2 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Zwischensumme</span>
              <span className="tabular-nums">{formatSwissPriceWithCHF(subtotal)}</span>
            </div>
            <div className="flex justify-between font-medium text-[#3C7E44]">
              <span>{discountLabel}</span>
              <span className="tabular-nums">−{formatSwissPriceWithCHF(discountAmount)}</span>
            </div>
          </div>
        )}
        <div className="flex items-end justify-between gap-3 border-t border-gray-100 pt-2">
          <div>
            <p className="text-xs text-gray-500">Gesamtbetrag · inkl. MwSt.</p>
            <p className="text-2xl font-extrabold tabular-nums text-gray-900">
              {formatSwissPriceWithCHF(total)}
            </p>
            <p className="text-xs text-gray-400">
              {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D076] text-base font-bold text-white shadow-[0_4px_16px_rgba(37,208,118,0.35)] active:scale-[0.98]"
          aria-label="Zur Bezahlung"
        >
          Zur Bezahlung
        </button>
      </div>
    </div>
  );
}
