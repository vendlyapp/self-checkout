"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { ModernSpinner } from "@/components/ui";
import { formatSwissPriceWithCHF } from "@/lib/utils";

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
  promoApplied,
  promoCode,
  discountAmount,
  onPaymentSuccess,
}) => {
  const [paymentStep, setPaymentStep] = useState<
    "confirm" | "processing" | "success"
  >("confirm");

  const getMethodInfo = (methodId: string) => {
    const methods = {
      twint: { name: "TWINT", color: "#25D076" },
      card: { name: "Zahlungslink", color: "#6E7996" },
      cash: { name: "Bargeld", color: "#766B6A" },
      invoice: { name: "Rechnung", color: "#1d3b36" },
    };
    return methods[methodId as keyof typeof methods] || methods.card;
  };

  const handleConfirmPayment = async () => {
    setPaymentStep("processing");

    try {
      // Simular procesamiento de pago
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setPaymentStep("success");

      // Esperar un momento para mostrar el éxito y luego proceder
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        // Reiniciar el modal para la próxima vez
        setPaymentStep("confirm");
      }, 2000);
    } catch {
      alert("Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setPaymentStep("confirm");
    }
  };

  // No renderizar nada si no está abierto
  if (!isOpen) return null;

  const methodInfo = getMethodInfo(selectedMethod);

  return (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-scale">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl 
                      animate-scale-in gpu-accelerated">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Zahlung bestätigen
          </h2>
          <button
            onClick={onClose}
            disabled={paymentStep !== "confirm"}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del modal - Solo un estado visible a la vez */}
        <div className="p-6">
          {paymentStep === "confirm" && (
            <>
              {/* Información del método de pago */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: methodInfo.color }}
                >
                  <span className="text-2xl font-bold">
                    {methodInfo.name.charAt(0)}
                  </span>
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
                    {formatSwissPriceWithCHF(totalAmount)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">inkl. MwSt</p>

                {/* Código promocional aplicado */}
                {promoApplied && (
                  <div className="mt-3 p-3 bg-[#F2FDF5] rounded-lg border border-[#3C7E44]/20">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[#3C7E44] text-[14px] font-medium">
                        Promo Code: <span className="font-bold">{promoCode?.toUpperCase()}</span>
                      </div>
                      <div className="text-[#3C7E44] text-[12px] bg-[#3C7E44]/10 px-2 py-1 rounded-full">
                        ✓ Angewendet
                      </div>
                    </div>
                    <div className="text-[#3C7E44] text-[13px]">
                      10% Rabatt auf Bio-Produkte - {formatSwissPriceWithCHF(discountAmount || 0)}
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={paymentStep !== "confirm"}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={paymentStep !== "confirm"}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Bestätigen
                </button>
              </div>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="text-center py-8">
              {/* Spinner moderno y personalizado */}
              <ModernSpinner size="lg" color="blue" className="mb-6" />

              {/* Texto con animación sutil */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 animate-pulse">
                  Zahlung wird verarbeitet
                </h3>
                <p className="text-gray-600 text-sm">
                  Bitte warten Sie, während wir Ihre Zahlung bearbeiten...
                </p>

                {/* Indicador de progreso visual */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full animate-pulse"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="text-center py-8">
              {/* Icono de éxito con animación */}
              <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-800">
                  Zahlung erfolgreich!
                </h3>
                <p className="text-gray-600">
                  Ihre Bestellung wurde erfolgreich verarbeitet.
                </p>
                <p className="text-sm text-gray-500">
                  Sie werden in Kürze weitergeleitet...
                </p>

                {/* Indicador de progreso para redirección */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-4">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-brand-600 h-1 rounded-full animate-pulse"
                    style={{ width: "100%" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
