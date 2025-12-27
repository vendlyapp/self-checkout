"use client";

import React from "react";
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
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ModernSpinner } from "@/components/ui";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { usePromoLogic } from "@/hooks";
import { useCreateOrder } from "@/hooks/mutations";
import { createPortal } from "react-dom";
import { usePaymentMethods } from "@/hooks/queries/usePaymentMethods";

interface PaymentMethodDisplay {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; width?: number; height?: number }>;
  isSvg?: boolean;
  iconPath?: string | null;
  bgColor: string;
  textColor: string;
  methodData?: any;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  totalAmount: number;
  isProcessing: boolean;
  paymentStep: "confirm" | "processing" | "success";
  errorMessage?: string | null;
  onConfirm: () => void;
  paymentMethods: PaymentMethodDisplay[];
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedMethod,
  totalAmount,
  isProcessing,
  paymentStep,
  errorMessage,
  onConfirm,
  paymentMethods,
}) => {
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

  if (!isOpen || !modalContainer) {
    return null;
  }

  // Buscar el método seleccionado en la lista de métodos de pago
  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  const getColorFromBgColor = (bgColor: string): string => {
    // Si viene con formato Tailwind bg-[#color], extraer el color
    const match = bgColor.match(/bg-\[([^\]]+)\]/);
    if (match) return match[1];
    // Si ya es un color hex, retornarlo
    if (bgColor.startsWith('#')) return bgColor;
    return "#6E7996";
  };
  const methodInfo = selectedMethodData ? {
    name: selectedMethodData.name,
    icon: selectedMethodData.icon,
    color: selectedMethodData.methodData?.bgColor || getColorFromBgColor(selectedMethodData.bgColor),
  } : {
    name: "Método de pago",
    icon: CreditCard,
    color: "#6E7996",
  };

  const modalContent = (
    <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in-scale" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl 
                      animate-scale-in gpu-accelerated">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Zahlung bestätigen
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing && paymentStep !== "success"}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {paymentStep === "confirm" && (
            <>
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

              <div className="bg-brand-50 p-4 rounded-xl mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Gesamtbetrag:</span>
                  <span className="text-2xl font-bold text-brand-600">
                    CHF {totalAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">inkl. MwSt</p>
              </div>

              {errorMessage && (
                <div
                  className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  Bestätigen
                </button>
              </div>
            </>
          )}

          {paymentStep === "processing" && (
            <div className="text-center py-8">
              <ModernSpinner size="lg" color="brand" className="mb-6" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 animate-pulse">
                Zahlung wird verarbeitet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bitte warten Sie, während wir Ihre Zahlung bearbeiten...
              </p>
            </div>
          )}

          {paymentStep === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-brand-600" />
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

  return createPortal(modalContent, modalContainer);
};

export default function PaymentP() {
  const {
    getTotalItems,
    getSubtotal,
    getTotalWithVAT,
    getOrderItemsPayload,
    clearCart,
  } = useCartStore();
  const { store } = useScannedStoreStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"confirm" | "processing" | "success">("confirm");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // Usar mutation de React Query para crear órdenes
  const createOrderMutation = useCreateOrder();
  const {
    promoApplied,
    discountAmount,
    promoError,
    localPromoCode,
    setLocalPromoCode,
    handleApplyPromo,
    handleRemovePromo,
  } = usePromoLogic();

  // Sincronizar estado del carrito solo en el cliente para evitar hydration mismatch
  // Usar useRef para evitar re-renders innecesarios
  const mountedRef = useRef(false);
  
  useEffect(() => {
    // Solo establecer mounted una vez
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []); // Sin dependencias para ejecutar solo una vez

  // Calcular totales reales del carrito usando las funciones del store
  // Solo calcular después de montar para evitar hydration mismatch
  const totalItems = mounted ? getTotalItems() : 0;
  const subtotal = mounted ? getSubtotal() : 0;
  const totalWithVAT = mounted ? getTotalWithVAT() : 0;
  const totalAfterDiscount = Math.max(
    totalWithVAT - (promoApplied ? discountAmount || 0 : 0),
    0,
  );
  const payableTotal = Number(totalAfterDiscount.toFixed(2));

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setPaymentStep("confirm");
    setOrderError(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    if (createOrderMutation.isPending && paymentStep === "processing") {
      return;
    }

    setIsModalOpen(false);
    setPaymentStep("confirm");
    setOrderError(null);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPaymentMethod || isProcessing) {
      return;
    }

    const orderItems = getOrderItemsPayload();

    if (orderItems.length === 0) {
      setOrderError("Tu carrito está vacío.");
      setPaymentStep("confirm");
      return;
    }

    try {
      setOrderError(null);
      setPaymentStep("processing");

      // Usar mutation de React Query
      await createOrderMutation.mutateAsync({
        items: orderItems,
        paymentMethod: selectedPaymentMethod,
        total: payableTotal,
        storeId: store?.id,
        storeSlug: store?.slug,
        metadata: {
          storeId: store?.id ?? null,
          storeSlug: store?.slug ?? null,
          storeName: store?.name ?? null,
          promoApplied,
          discountAmount: promoApplied ? discountAmount ?? 0 : 0,
          totalBeforeVAT: Number(subtotal.toFixed(2)),
          totalWithVAT: Number(totalWithVAT.toFixed(2)),
        },
      });

      setPaymentStep("success");

      setTimeout(() => {
        handlePaymentSuccess();
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos procesar tu pago. Intenta nuevamente.";
      setOrderError(message);
      setPaymentStep("confirm");
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setSelectedPaymentMethod("");
    setIsModalOpen(false);
    setPaymentStep("confirm");
    setOrderError(null);
    router.push("/user");
  };
  
  // isProcessing viene de la mutation
  const isProcessing = createOrderMutation.isPending;

  // Obtener métodos de pago desde la API
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethods({
    storeId: store?.id || '',
    activeOnly: true, // Solo mostrar métodos activos
  });

  // Mapeo de códigos de métodos de pago a iconos de lucide-react (solo para esta página)
  const getPaymentMethodIconForPaymentPage = (code: string) => {
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

  // Mapear métodos de pago de la API al formato esperado por el componente
  const paymentMethods: PaymentMethodDisplay[] = paymentMethodsData?.map((method) => {
    // Usar iconos de lucide-react en lugar de SVG para esta página
    const IconComponent = getPaymentMethodIconForPaymentPage(method.code);
    
    // Usar el color directamente de la base de datos (ya viene como hex)
    const bgColorValue = method.bgColor || '#6E7996';
    const textColorValue = method.textColor || '#FFFFFF';
    
    return {
      id: method.code,
      name: method.displayName,
      icon: IconComponent,
      isSvg: false, // Siempre false porque usamos iconos de lucide-react
      iconPath: null, // No usamos SVG aquí
      bgColor: bgColorValue, // Guardar el valor directo para usar en style
      textColor: textColorValue, // Guardar el valor directo para usar en style
      methodData: method, // Guardar datos completos para uso futuro
    };
  }) || [];

  // Mostrar mensaje si el carrito está vacío (solo después de montar para evitar hydration mismatch)
  if (mounted && totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F9F6F4]">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#373F49] mb-4 transition-interactive">
            Ihr Warenkorb ist leer
          </p>
          <p className="text-[#6E7996] transition-interactive">
            Fügen Sie Produkte hinzu, um fortzufahren
          </p>
        </div>
      </div>
    );
  }

  // Mostrar loading state durante la hidratación
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F9F6F4]">
        <div className="text-center">
          <p className="text-xl font-semibold text-[#373F49] mb-4">
            Wird geladen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con información real del carrito */}
      <div className="flex flex-col gap-2 justify-center items-center bg-[#F9F6F4] w-full p-2 border-b border-[#E5E5E5]">
        <p className="text-xl pt-4 font-semibold text-[#373F49] transition-interactive">
          {store?.name ?? "Gastbestellung"}
        </p>
        <p className="text-5xl font-bold transition-interactive">
          CHF {formatSwissPriceWithCHF(payableTotal)}
        </p>
        <p className="text-lg font-semibold text-[#373F49] transition-interactive">
          inkl. MwSt • {totalItems} {totalItems === 1 ? "Artikel" : "Artikel"}
        </p>
        
      </div>

      {/* Código promocional */}
      <div className="pt-4 pl-12 animate-stagger-2">
        <label
          htmlFor="promo"
          className="text-[#25D076] text-[15px] font-semibold cursor-pointer hover:underline transition-interactive"
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
                onChange={(e) =>
                  setLocalPromoCode(e.target.value.toUpperCase())
                }
                placeholder="Gib deinen Code ein"
                className="block w-[60%] rounded-lg border-2 uppercase bg-white px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Promo Code"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyPromo();
                  }
                }}
              />
              <button
                onClick={handleApplyPromo}
                className="bg-brand-500 justify-center items-center flex hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-3  
                         transition-interactive gpu-accelerated touch-target tap-highlight-transparent 
                         active:scale-95 hover:scale-105"
                aria-label="Promo anwenden"
                style={{ minHeight: "44px" }}
              >
                <span className="text-white font-semibold text-base mobile-base text-[15px] truncate">
                  Anwenden
                </span>
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
                Promo Code: {localPromoCode}
              </div>
              <div className="text-[#3C7E44] text-[15px]">
                - {formatSwissPriceWithCHF(discountAmount || 0)}
              </div>
            </div>
            <button
              onClick={handleRemovePromo}
              className="ml-2 p-2 rounded-full justify-center items-center flex hover:bg-brand-200 focus:outline-none touch-target tap-highlight-transparent active:scale-95"
              aria-label="Promo entfernen"
              tabIndex={0}
              style={{ minHeight: "44px", minWidth: "44px" }}
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

        {paymentMethodsLoading ? (
          <div className="flex items-center justify-center py-8">
            <ModernSpinner />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#6E7996]">Keine Zahlungsmethoden verfügbar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method, index) => {
            const isSelected = selectedPaymentMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`
                  px-4 py-4 w-[345px] h-[50px] text-sm rounded-full
                  flex items-center justify-center gap-2 transition-interactive gpu-accelerated
                  ${isSelected ? "ring-4 ring-brand-300 ring-opacity-50" : ""}
                  hover:opacity-90 active:scale-95 touch-target tap-highlight-transparent
                  animate-slide-up-fade relative
                `}
                style={{ 
                  backgroundColor: method.bgColor, // Usar color directamente desde la DB
                  color: method.textColor, // Usar color de texto directamente desde la DB
                  minHeight: "50px",
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'both'
                }}
                aria-label={`${method.name} auswählen`}
              >
                {React.createElement(method.icon, { 
                  className: "w-5 h-5 transition-interactive",
                  color: method.textColor
                } as React.ComponentProps<typeof method.icon>)}
                <span className="font-medium" style={{ color: method.textColor }}>{method.name}</span>
                {isSelected && (
                  <div className="absolute right-4 animate-bounce-in">
                    <Eclipse className="w-4 h-4 transition-interactive" color={method.textColor} />
                  </div>
                )}
              </button>
            );
          })}
          </div>
        )}
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
        onClose={handleModalClose}
        selectedMethod={selectedPaymentMethod}
        totalAmount={payableTotal}
        isProcessing={isProcessing}
        paymentStep={paymentStep}
        errorMessage={orderError}
        onConfirm={handleConfirmPayment}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
