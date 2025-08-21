"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  totalAmount: number;
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
      twint: { name: "TWINT", color: "#25D076" },
      card: { name: "Zahlungslink", color: "#6E7996" },
      cash: { name: "Bargeld", color: "#766B6A" },
      invoice: { name: "Rechnung", color: "#1d3b36" },
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
                    CHF {totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">inkl. MwSt (7.7%)</p>
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
              <Loader2 className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
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

export default PaymentModal;
