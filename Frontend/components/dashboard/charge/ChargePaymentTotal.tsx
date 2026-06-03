'use client';

import { formatSwissPriceWithCHF } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cartStore';

export default function ChargePaymentTotal({
  storeName,
  subtotal,
  total,
  totalItems,
  promoApplied,
}: {
  storeName: string;
  subtotal: number;
  total: number;
  totalItems: number;
  promoApplied: boolean;
}) {
  const { promoInfo } = useCartStore();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card text-center">
      <p className="text-sm font-medium text-gray-500">{storeName}</p>
      {promoApplied && (
        <p className="mt-1 text-base text-gray-400 line-through tabular-nums">
          {formatSwissPriceWithCHF(subtotal)}
        </p>
      )}
      <p className="mt-1 text-4xl font-extrabold tabular-nums leading-tight text-gray-900">
        {formatSwissPriceWithCHF(total)}
      </p>
      {promoApplied && promoInfo && (
        <p className="mt-2 text-sm font-semibold text-[#3C7E44]">
          {promoInfo.discountType === 'percentage'
            ? `${Math.round(promoInfo.discountValue)}% Rabatt angewendet`
            : 'Rabatt angewendet'}
        </p>
      )}
      <p className="mt-1 text-sm text-gray-500">
        inkl. MwSt. · {totalItems} {totalItems === 1 ? 'Artikel' : 'Artikel'}
      </p>
    </div>
  );
}
