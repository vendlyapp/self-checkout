import React from "react";
import { formatSwissPrice, formatSwissPriceWithCHF } from "@/lib/utils";

type FooterContinueProps = {
  subtotal: number;
  promoApplied: boolean;
  discountAmount: number;
  totalItems: number;
  total: number;
  promoCode?: string;
  onContinue?: () => void;
};

const FooterContinue: React.FC<FooterContinueProps> = ({
  subtotal,
  promoApplied,
  discountAmount,
  totalItems,
  total,
  promoCode,
  onContinue,
}) => {
  return (
    <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
      <div className="mb-2">
        {promoApplied && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-gray-800 font-semibold text-[16px]">
                Zwischensumme
              </div>
              <div className="text-gray-800 text-[16px]">
                {formatSwissPriceWithCHF(subtotal)}
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[#3C7E44] font-semibold text-[15px]">
                10% Rabatt auf Bio-Produkte
              </div>
              <div className="text-[#3C7E44] text-[15px] font-semibold">
                - {formatSwissPriceWithCHF(discountAmount)}
              </div>
            </div>
            {/* Código promocional aplicado */}
            <div className="flex items-center justify-between mt-2 p-2 bg-[#F2FDF5] rounded-lg border border-[#3C7E44]/20">
              <div className="text-[#3C7E44] text-[14px] font-medium">
                Promo Code: <span className="font-bold">{promoCode?.toUpperCase()}</span>
              </div>
              <div className="text-[#3C7E44] text-[12px] bg-[#3C7E44]/10 px-2 py-1 rounded-full">
                ✓ Angewendet
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-gray-800 font-bold text-[18px]">
            Gesamtbetrag
          </div>
          <div className="text-gray-400 text-[14px]">
            inkl. MwSt • {totalItems} Artikel
          </div>
        </div>
        <div className="text-black font-bold text-[24px]">
          {formatSwissPriceWithCHF(total)}
        </div>
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
};

export default FooterContinue;
