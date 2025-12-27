"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, Smartphone, CreditCard, Coins, QrCode, FileText } from "lucide-react";
import { ModernSpinner } from "@/components/ui";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { usePaymentMethods } from "@/hooks/queries/usePaymentMethods";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  totalAmount: number;
  promoApplied?: boolean;
  promoCode?: string;
  discountAmount?: number;
  onPaymentSuccess: () => void;
  storeId?: string; // Opcional, si no se pasa se obtiene del store
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
  storeId: propStoreId,
}) => {
  const [paymentStep, setPaymentStep] = useState<
    "confirm" | "processing" | "success"
  >("confirm");

  // Obtener store desde el store si no se pasa como prop
  const { store } = useScannedStoreStore();
  const storeId = propStoreId || store?.id || '';

  // Obtener métodos de pago reales desde la API
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethods({
    storeId,
    activeOnly: true,
  });

  // Mapeo de códigos a iconos de lucide-react
  const getPaymentMethodIcon = (code: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'twint': Smartphone,
      'qr-rechnung': QrCode,
      'bargeld': Coins,
      'debit-credit': CreditCard,
      'postfinance': CreditCard,
      'klarna': CreditCard,
    };
    return iconMap[code] || CreditCard;
  };

  // Obtener información del método seleccionado desde los datos reales
  const getMethodInfo = (methodId: string) => {
    // Buscar el método en los datos reales de la API
    const method = paymentMethodsData?.find((m: any) => m.code === methodId);
    
    if (method) {
      return {
        name: method.displayName,
        color: method.bgColor || '#6E7996',
        icon: getPaymentMethodIcon(method.code),
      };
    }

    // Si no se encuentra el método, retornar valores por defecto
    return {
      name: "Método de pago",
      color: '#6E7996',
      icon: CreditCard,
    };
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

  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'global-modals-container';
        document.body.appendChild(container);
      }
      setModalContainer(container);
    }
  }, []);

  // No renderizar nada si no está abierto o no hay contenedor
  if (!isOpen || !modalContainer) return null;

  const methodInfo = getMethodInfo(selectedMethod);

  const modalContent = (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in-scale" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl 
                      animate-scale-in gpu-accelerated antialiased">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 antialiased">
            Zahlung bestätigen
          </h2>
          <button
            onClick={onClose}
            disabled={paymentStep === "processing"}
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
                  {methodInfo.icon && (
                    <methodInfo.icon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 antialiased">
                    {methodInfo.name}
                  </p>
                  <p className="text-sm text-gray-600 antialiased">
                    Zahlungsmethode ausgewählt
                  </p>
                </div>
              </div>

              {/* Resumen del pago */}
              <div className="bg-brand-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 antialiased">Gesamtbetrag:</span>
                  <span className="text-2xl font-bold text-brand-600 antialiased">
                    CHF {totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 antialiased">inkl. MwSt</p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors antialiased"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 px-4 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors antialiased"
                >
                  Bestätigen
                </button>
              </div>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="text-center py-8">
              <ModernSpinner size="lg" color="brand" className="mb-6" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 animate-pulse antialiased">
                Zahlung wird verarbeitet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 antialiased">
                Bitte warten Sie, während wir Ihre Zahlung bearbeiten...
              </p>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 antialiased">
                Zahlung erfolgreich!
              </h3>
              <p className="text-gray-600 antialiased">
                Ihre Bestellung wurde erfolgreich verarbeitet.
              </p>
              <p className="text-sm text-gray-500 mt-2 antialiased">
                Sie werden in Kürze weitergeleitet...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, modalContainer);
};

export default PaymentModal;
