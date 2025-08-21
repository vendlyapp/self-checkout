"use client";

import { useCartStore } from "@/lib/stores/cartStore";
import { usePromoCode } from "@/lib/hooks";
import {
  CreditCard,
  Smartphone,
  FileText,
  DollarSign,
  Lock,
  X,
} from "lucide-react";

interface PaymentPageProps {
  onPaymentMethodSelect: (method: string, totalAmount: number) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentMethodSelect }) => {
  const { getTotalItems, getTotalWithVAT } = useCartStore();
  const {
    promoCode,
    setPromoCode,
    promoApplied,
    discountAmount,
    promoError,
    setPromoError,
    subtotal,
    total,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoCode();

  // Cálculos del carrito
  const totalItems = getTotalItems();
  const totalWithVAT = getTotalWithVAT();

  // Usar el total con descuento si hay promoción aplicada, sino usar el total con IVA
  const finalTotal = promoApplied ? total : totalWithVAT;

  const paymentMethods = [
    {
      id: "twint",
      name: "TWINT",
      icon: Smartphone,
      bgColor: "bg-brand-500 hover:bg-brand-600",
      textColor: "text-white",
    },
    {
      id: "card",
      name: "Zahlungslink",
      icon: CreditCard,
      bgColor: "bg-[#7e8bb6] hover:bg-[#6b7aa3]",
      textColor: "text-white",
    },
    {
      id: "cash",
      name: "Bargeld",
      icon: DollarSign,
      bgColor: "bg-[#7b7575] hover:bg-[#6a6565]",
      textColor: "text-white",
    },
    {
      id: "invoice",
      name: "Rechnung",
      icon: FileText,
      bgColor: "bg-[#1d3b36] hover:bg-[#16302b]",
      textColor: "text-white",
    },
  ];

  // Mostrar mensaje si el carrito está vacío
  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F9F6F4]">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#373F49] mb-4">
            Ihr Warenkorb ist leer
          </p>
          <p className="text-[#6E7996]">
            Fügen Sie Produkte hinzu, um fortzufahren
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-cream">
      {/* Header con información del carrito */}
      <div className="flex flex-col gap-2 justify-center items-center bg-[#F9F6F4] w-full p-4 border-b border-[#E5E5E5]">
        <p className="text-xl font-semibold text-[#373F49]">
          Heinigers Hofladen
        </p>

        {/* Mostrar precio original tachado si hay promoción */}
        {promoApplied && (
          <div className="text-[22px] text-gray-400 font-semibold line-through">
            CHF {totalWithVAT.toFixed(2)}
          </div>
        )}

        {/* Precio final */}
        <p className="text-2xl font-bold text-[#373F49]">
          CHF {finalTotal.toFixed(2)}
        </p>

        {/* Información de promoción */}
        {promoApplied && (
          <div className="text-brand-700 text-[16px] font-semibold text-center">
            10% Rabatt auf Bio-Produkte angewendet!
          </div>
        )}

        <p className="text-lg font-semibold text-[#373F49]">
          inkl. MwSt • {totalItems} {totalItems === 1 ? "Artikel" : "Artikel"}
        </p>

        {/* Desglose de precios */}
        {promoApplied ? (
          <div className="text-sm text-[#6E7996] text-center">
            <div>Netto: CHF {subtotal.toFixed(2)}</div>
            <div>MwSt (7.7%): CHF {(totalWithVAT - subtotal).toFixed(2)}</div>
            <div className="text-brand-700 font-semibold">
              Rabatt: - CHF {discountAmount.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#6E7996] text-center">
            <div>Netto: CHF {subtotal.toFixed(2)}</div>
            <div>MwSt (7.7%): CHF {(totalWithVAT - subtotal).toFixed(2)}</div>
          </div>
        )}
      </div>

      {/* Código promocional */}
      <div className="pt-4 px-4">
        <div className="max-w-md mx-auto">
          <label
            htmlFor="promo"
            className="text-brand-500 text-[15px] font-semibold cursor-pointer hover:underline"
          >
            Promo Code?
          </label>

          {!promoApplied ? (
            <div className="flex flex-col gap-1 mt-2">
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
                  className="block flex-1 rounded-lg border-2 uppercase border-white px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Promo Code"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyPromo();
                  }}
                />
                <button
                  onClick={handleApplyPromo}
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
            <div className="flex items-center bg-brand-100 rounded-xl px-4 py-3 mt-2 shadow-sm border border-brand-200">
              <div className="flex-1">
                <div className="text-brand-700 font-semibold text-[15px] leading-tight">
                  10% Rabatt auf Bio-Produkte
                </div>
                <div className="text-brand-700 text-[15px]">
                  - CHF {discountAmount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                className="ml-2 p-1 rounded-full hover:bg-brand-200 focus:outline-none"
                aria-label="Promo entfernen"
                tabIndex={0}
              >
                <X className="w-5 h-5 text-brand-700" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="flex flex-col gap-4 justify-center items-center bg-[#F2EDE8] w-full p-6 flex-1">
        <p className="text-lg font-semibold text-[#373F49] text-center">
          Zahlungsmethode wählen:
        </p>

        <div className="w-full max-w-md space-y-4">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;

            return (
              <button
                key={method.id}
                onClick={() => onPaymentMethodSelect(method.id, finalTotal)}
                className={`
                  ${method.bgColor} ${method.textColor} px-6 py-4 w-full text-lg rounded-full
                  flex items-center gap-3 justify-center transition-all duration-200
                  hover:scale-105 active:scale-95 shadow-lg
                `}
                aria-label={method.name}
              >
                <IconComponent className="w-6 h-6" />
                {method.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer de seguridad */}
      <div className="flex flex-col justify-center items-center bg-[#F9F6F4] w-full p-4 border-t border-[#E5E5E5]">
        <div className="flex flex-row gap-2 justify-center items-center w-full">
          <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
          <p className="text-sm font-semibold text-center text-[#373F49]">
            256-BIT SSL VERSCHLÜSSELUNG
          </p>
          <Lock className="w-4 h-6" />
        </div>
        <p className="text-sm w-[80%] text-center text-[#6E7996] mt-2">
          Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren
          verarbeitet
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
