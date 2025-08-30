"use client";

import {
  Coins,
  CreditCard,
  Eclipse,
  Lock,
  QrCode,
  Smartphone,
  X,
  CheckCircle,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cartStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModernSpinner } from "@/components/ui";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  totalAmount: number;
  promoApplied?: boolean;
  promoCode?: string;
  discountAmount?: number;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedMethod,
  totalAmount,
  onPaymentSuccess,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "confirm" | "processing" | "success"
  >("confirm");

  const getMethodInfo = (methodId: string) => {
    const methods = {
      twint: { name: "TWINT", icon: Smartphone, color: "#25D076" },
      card: { name: "Debit-, Kreditkarte", icon: CreditCard, color: "#6E7996" },
      postfinance: { name: "PostFinance", icon: QrCode, color: "#F2AD00" },
      cash: { name: "Bargeld", icon: Coins, color: "#766B6A" },
    };
    return methods[methodId as keyof typeof methods] || methods.card;
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setPaymentStep("processing");

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setPaymentStep("success");

      // Esperar un momento para mostrar el éxito y luego proceder
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 2000);
    } catch {
      alert("Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setPaymentStep("confirm");
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const methodInfo = getMethodInfo(selectedMethod);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Zahlung bestätigen
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {paymentStep === "confirm" && (
            <>
              {/* Información del método de pago */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: methodInfo.color }}
                >
                  <methodInfo.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {methodInfo.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Zahlungsmethode ausgewählt
                  </p>
                </div>
              </div>

              {/* Resumen del pago */}
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Gesamtbetrag:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    CHF {totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">inkl. MwSt</p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Bestätigen
                </button>
              </div>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="text-center py-8">
              <ModernSpinner size="lg" color="blue" className="mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Zahlung wird verarbeitet
              </h3>
              <p className="text-gray-600">
                Bitte warten Sie, während wir Ihre Zahlung bearbeiten...
              </p>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Zahlung erfolgreich!
              </h3>
              <p className="text-gray-600">
                Ihre Bestellung wurde erfolgreich verarbeitet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Sie werden in Kürze weitergeleitet...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PaymentP() {
  const {
    getTotalItems,
    getSubtotal,
    getTotalWithVAT,
    clearCart,
    promoCode,
    promoApplied,
    discountAmount,
    applyPromoCode,
    removePromoCode
  } = useCartStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [localPromoCode, setLocalPromoCode] = useState(promoCode);
  const router = useRouter();

  // Calcular totales reales del carrito usando las funciones del store
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const totalWithVAT = getTotalWithVAT();

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setSelectedPaymentMethod("");
    // Redirigir a /user después del pago exitoso
    router.push("/user");
  };

  const handleApplyPromo = () => {
    if (localPromoCode.trim().toUpperCase() === "CHECK01") {
      applyPromoCode(localPromoCode);
      setPromoError("");
    } else {
      setPromoError("Der Code existiert nicht oder ist ungültig.");
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setLocalPromoCode("");
    setPromoError("");
  };

  const paymentMethods = [
    {
      id: "twint",
      name: "TWINT",
      icon: Smartphone,
      bgColor: "bg-[#25D076]",
      textColor: "text-white",
    },
    {
      id: "card",
      name: "Debit-, Kreditkarte",
      icon: CreditCard,
      bgColor: "bg-[#6E7996]",
      textColor: "text-white",
    },
    {
      id: "postfinance",
      name: "PostFinance",
      icon: QrCode,
      bgColor: "bg-[#F2AD00]",
      textColor: "text-white",
    },
    {
      id: "cash",
      name: "Bargeld",
      icon: Coins,
      bgColor: "bg-[#766B6A]",
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
    <>
      {/* Header con información real del carrito */}
      <div className="flex flex-col gap-2 justify-center items-center bg-[#F9F6F4] w-full p-2 border-b border-[#E5E5E5]">
        <p className="text-xl pt-4 font-semibold text-[#373F49]">
          Heinigers Hofladen
        </p>
        <p className="text-2xl font-bold">CHF {totalWithVAT.toFixed(2)}</p>
        <p className="text-lg font-semibold text-[#373F49]">
          inkl. MwSt • {totalItems} {totalItems === 1 ? "Artikel" : "Artikel"}
        </p>
        {subtotal !== totalWithVAT && (
          <p className="text-sm text-[#6E7996]">
            Netto: CHF {subtotal.toFixed(2)} + MwSt (7.7%): CHF{" "}
            {(totalWithVAT - subtotal).toFixed(2)}
          </p>
        )}
      </div>

      {/* Código promocional */}
      <div className="pt-4 pl-12">
        <label
          htmlFor="promo"
          className="text-[#25D076] text-[15px] font-semibold cursor-pointer hover:underline"
        >
          Promo Code?
        </label>
        {!promoApplied ? (
          <div className="flex flex-col gap-1 mt-1 pr-12">
            <div className="flex gap-2">
              <input
                id="promo"
                type="text"
                autoCapitalize="characters"
                maxLength={10}
                value={localPromoCode}
                onChange={(e) => setLocalPromoCode(e.target.value.toUpperCase())}
                placeholder="Gib deinen Code ein"
                className="block w-full rounded-lg border-2 uppercase bg-white px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Promo Code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyPromo();
                  }
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
          <div className="flex items-center bg-[#F2FDF5] rounded-xl px-4 py-3 mt-2 mb-2 shadow-sm border border-brand-200 mr-12">
            <div className="flex-1">
              <div className="text-[#3C7E44] font-semibold text-[15px] leading-tight">
                10% Rabatt auf Bio-Produkte
              </div>
              <div className="text-[#3C7E44] text-[15px]">
                - CHF {discountAmount?.toFixed(2) || "0.00"}
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

      {/* Métodos de pago */}
      <div className="flex flex-col gap-2 justify-center items-center bg-[#F2EDE8] w-full p-4">
        <p className="text-lg font-semibold text-[#373F49] text-center">
          Zahlungsmethode wählen:
        </p>

        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedPaymentMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
              className={`
                ${method.bgColor} ${
                method.textColor
              } px-4 py-4 w-[345px] h-[50px] text-sm rounded-full
                flex items-center gap-2 justify-center transition-all duration-200
                ${isSelected ? "ring-4 ring-blue-300 ring-opacity-50" : ""}
                hover:scale-105 active:scale-95
              `}
            >
              <IconComponent className="w-6 h-6" />
              {method.name}
              {isSelected && (
                <div className="ml-auto">
                  <Eclipse className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer de seguridad */}
      <div className="flex flex-col justify-center items-center bg-[#F9F6F4] w-full p-2 border-t border-[#E5E5E5]">
        <div className="flex flex-row gap-2 justify-center items-center w-full p-2">
          <Eclipse className="w-4 h-4 mt-3 text-[#25D076] bg-[#25D076] rounded-full" />
          <p className="text-sm pt-4 font-semibold text-center text-[#373F49]">
            256-BIT SSL VERSCHLÜSSELUNG
          </p>
          <Lock className="w-4 h-6 mt-3" />
        </div>
        <p className="text-sm w-[80%] text-center text-[#6E7996]">
          Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren
          verarbeitet
        </p>
      </div>

      {/* Modal de pago */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMethod={selectedPaymentMethod}
        totalAmount={totalWithVAT}
        promoApplied={promoApplied}
        promoCode={promoCode}
        discountAmount={discountAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
