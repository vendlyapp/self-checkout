'use client';

import { useState, useRef } from 'react';
import { Tag, X } from 'lucide-react';
import { usePromoLogic } from '@/hooks';
import { useCartStore } from '@/lib/stores/cartStore';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import { resetIosViewportZoom } from '@/lib/utils/iosInputZoom';

export default function ChargePromoBlock() {
  const [promoOpen, setPromoOpen] = useState(false);
  const promoInputRef = useRef<HTMLInputElement>(null);
  const { promoInfo } = useCartStore();

  const promoLabel =
    !promoInfo
      ? 'Rabatt'
      : promoInfo.discountType === 'percentage'
        ? `${Math.round(promoInfo.discountValue)}% Rabatt`
        : promoInfo.description || 'Rabatt';
  const {
    promoApplied,
    discountAmount,
    promoError,
    localPromoCode,
    setLocalPromoCode,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoLogic();

  if (promoApplied) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-brand-200 bg-[#F2FDF5] px-4 py-3 shadow-soft">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#3C7E44]">
            <Tag className="h-4 w-4 shrink-0" />
            {localPromoCode || promoInfo?.code || 'Code'}
          </p>
          <p className="text-sm text-[#3C7E44]">
            {promoLabel} · −{formatSwissPriceWithCHF(discountAmount)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemovePromo}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-brand-700 hover:bg-brand-100 active:scale-95"
          aria-label="Code entfernen"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  if (!promoOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setPromoOpen(true);
          setTimeout(() => promoInputRef.current?.focus(), 50);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D076] active:opacity-70"
      >
        <Tag className="h-4 w-4" />
        Gutscheincode einlösen
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-2.5 shadow-card">
      <div className="flex gap-2">
        <input
          ref={promoInputRef}
          type="text"
          inputMode="text"
          value={localPromoCode}
          onChange={(e) => setLocalPromoCode(e.target.value.toUpperCase().slice(0, 20))}
          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
          onBlur={resetIosViewportZoom}
          placeholder="z.B. SUNNE10"
          maxLength={20}
          autoCapitalize="characters"
          className="ios-input-fix h-11 min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-bold uppercase tracking-wide outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="button"
          onClick={handleApplyPromo}
          disabled={localPromoCode.trim().length < 3}
          className="h-11 shrink-0 rounded-xl bg-[#25D076] px-4 text-sm font-bold text-white shadow-soft disabled:opacity-50 active:scale-[0.98]"
        >
          Einlösen
        </button>
        <button
          type="button"
          onClick={() => {
            setPromoOpen(false);
            setLocalPromoCode('');
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-gray-400 hover:bg-gray-100"
          aria-label="Abbrechen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {promoError && (
        <p className="mt-2 text-xs font-semibold text-red-500">{promoError}</p>
      )}
    </div>
  );
}
