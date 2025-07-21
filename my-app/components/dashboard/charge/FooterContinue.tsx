import React from 'react';

type FooterContinueProps = {
  subtotal: number;
  promoApplied: boolean;
  discountAmount: number;
  totalItems: number;
  total: number;
  onContinue?: () => void;
};

const FooterContinue: React.FC<FooterContinueProps> = ({
  subtotal,
  promoApplied,
  discountAmount,
  totalItems,
  total,
  onContinue
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
    <div className="mb-2">
      {promoApplied && (
        <>
        <div className="flex items-center justify-between">
          <div className="text-gray-800 font-semibold text-[16px]">Zwischensumme</div>
          <div className="text-gray-800 text-[16px]">CHF {subtotal.toFixed(2)}</div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="text-brand-700 font-semibold text-[15px]">10% Rabatt auf Bio-Produkte</div>
          <div className="text-brand-700 text-[15px]">- CHF {discountAmount.toFixed(2)}</div>
        </div>
        </>
        )}
    </div>
    <div className="flex items-center justify-between pt-2">
      <div>
        <div className="text-gray-800 font-bold text-[18px]">Gesamtbetrag</div>
        <div className="text-gray-400 text-[13px]">inkl. MwSt • {totalItems} Artikel</div>
      </div>
      <div className="text-brand-600 font-bold text-[26px]">CHF {total.toFixed(2)}</div>
    </div>
    <button
      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full py-3 text-[18px] flex items-center justify-center gap-2 mt-4 transition-colors"
      aria-label="Zur Bezahlung"
      onClick={onContinue}
    >
      Zur Bezahlung
      <span className="ml-1">&rarr;</span>
    </button>
  </div>
);

export default FooterContinue;