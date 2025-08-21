import React from "react";
import { X } from "lucide-react";

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoApplied: boolean;
  discountAmount: number;
  promoError: string;
  setPromoError: (error: string) => void;
  onApplyPromo: () => void;
  onRemovePromo: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  promoCode,
  setPromoCode,
  promoApplied,
  discountAmount,
  promoError,
  setPromoError,
  onApplyPromo,
  onRemovePromo,
}) => {
  return (
    <div className="mt-6 px-2 pl-4 pr-4 pb-24">
      <label
        htmlFor="promo"
        className="text-brand-500 text-[15px] font-semibold"
      >
        Promo Code?
      </label>
      {!promoApplied ? (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex gap-2">
            <input
              id="promo"
              type="text"
              autoCapitalize="characters"
              maxLength={10}
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoError("");
              }}
              placeholder="Gib deinen Code ein"
              className="block w-full rounded-lg border-2 uppercase border-white px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Promo Code"
              onKeyDown={(e) => {
                if (e.key === "Enter") onApplyPromo();
              }}
            />
            <button
              onClick={onApplyPromo}
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-2 text-[15px] transition-colors"
              aria-label="Promo anwenden"
            >
              Anwenden
            </button>
          </div>
          {promoError && (
            <span className="text-red-600 text-[14px] font-medium mt-1">
              {promoError}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center bg-brand-100 rounded-xl px-4 py-3 mt-2 mb-2 shadow-sm border border-brand-200">
          <div className="flex-1">
            <div className="text-brand-700 font-semibold text-[15px] leading-tight">
              10% Rabatt auf Bio-Produkte
            </div>
            <div className="text-brand-700 text-[15px]">
              - CHF {discountAmount.toFixed(2)}
            </div>
          </div>
          <button
            onClick={onRemovePromo}
            className="ml-2 p-1 rounded-full hover:bg-brand-200 focus:outline-none"
            aria-label="Promo entfernen"
            tabIndex={0}
          >
            <X className="w-5 h-5 text-brand-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
