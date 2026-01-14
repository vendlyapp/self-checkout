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
  ArrowLeft,
  FileText,
  Download,
  Mail,
  Link2,
  Printer,
  ShoppingCart,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatSwissPriceWithCHF } from "@/lib/utils";
import { usePromoLogic } from "@/hooks";
import { useCreateOrder } from "@/hooks/mutations";
import { createPortal } from "react-dom";
import { usePaymentMethods } from "@/hooks/queries/usePaymentMethods";
import { lightHaptic, mediumHaptic, successHaptic, errorHaptic } from "@/lib/utils/hapticFeedback";
import { InvoiceService } from "@/lib/services/invoiceService";
import { toast } from "sonner";
import { Loader } from "@/components/ui/Loader";

interface PaymentMethodDisplay {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; width?: number; height?: number }>;
  isSvg?: boolean;
  iconPath?: string | null;
  bgColor: string;
  textColor: string;
  methodData?: { id: string; name: string; displayName: string; code: string; bgColor?: string | null; textColor?: string | null; [key: string]: unknown };
}

type PaymentStep = "confirm" | "processing" | "success" | "askData" | "personal" | "viewInvoice" | "completing";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethod: string;
  totalAmount: number;
  isProcessing: boolean;
  paymentStep: PaymentStep;
  errorMessage?: string | null;
  onConfirm: () => void;
  paymentMethods: PaymentMethodDisplay[];
  promoApplied?: boolean;
  promoCode?: string;
  discountAmount?: number;
  subtotal?: number;
  promoInfo?: {
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    description?: string;
  };
  cartItems?: Array<{ product: { id: string; name: string; price: number }; quantity: number }>;
  onBackToMethods?: () => void;
  onInvoiceComplete?: (invoiceData?: {
    option: 'none' | 'print' | 'email' | 'phone' | 'full';
    email?: string;
    phone?: string;
    fullData?: {
      name: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
      phone: string;
    };
    saveDataForFuture?: boolean;
  }) => void;
  onSkipInvoice?: () => void;
  onStepChange?: (step: PaymentStep) => void;
  personalData?: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  setPersonalData?: (data: { name: string; email: string; address: string; phone: string }) => void;
  onSaveCustomerData?: (data: { name: string; email: string; address: string; phone: string }) => void;
  createdInvoiceId?: string | null;
  createdInvoiceShareToken?: string | null;
  createdOrderId?: string | null;
  onViewInvoice?: () => void;
  onSkipViewInvoice?: () => void;
  onCreateInvoice?: (data?: { name: string; email: string; address: string; phone: string }) => Promise<void>;
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
  promoApplied = false,
  promoCode,
  discountAmount = 0,
  subtotal = 0,
  promoInfo,
  cartItems = [],
  onBackToMethods,
  onInvoiceComplete,
  onSkipInvoice,
  onStepChange,
  personalData: externalPersonalData,
  setPersonalData: setExternalPersonalData,
  onSaveCustomerData,
  createdInvoiceId,
  createdInvoiceShareToken,
  createdOrderId,
  onViewInvoice,
  onSkipViewInvoice,
  onCreateInvoice,
}) => {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);
  const [invoiceOption, setInvoiceOption] = useState<'none' | 'print' | 'email' | 'phone' | 'full'>('none');
  const [invoiceEmail, setInvoiceEmail] = useState('');
  const [invoicePhone, setInvoicePhone] = useState('');
  const [invoiceData, setInvoiceData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [showFullInvoiceForm, setShowFullInvoiceForm] = useState(false);
  const [saveDataForFuture, setSaveDataForFuture] = useState(false);
  const [receiveOffers, setReceiveOffers] = useState(false);
  
  // Usar datos externos si están disponibles, sino usar estado local
  const personalData = externalPersonalData || { name: '', email: '', address: '', phone: '' };
  const setPersonalData = setExternalPersonalData || (() => {});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let container = document.getElementById('global-modals-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'global-modals-container';
        document.body.appendChild(container);
      }
      setModalContainer(container);
      
      // Cleanup: no remover el contenedor, solo limpiar cuando el componente se desmonte
      return () => {
        // No hacer nada aquí - el contenedor se mantiene para otros modales
      };
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

  // El totalAmount ya viene con IVA incluido (precios en Suiza ya incluyen IVA)

  const formatPrice = (price: number) => {
    if (price % 1 === 0) {
      return `${price}.-`;
    }
    return price.toFixed(2);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      style={{ pointerEvents: 'auto' }}
      onClick={(e) => {
        // Cerrar al hacer clic fuera del modal (solo si no está en estados críticos)
        if (e.target === e.currentTarget && paymentStep !== "processing" && paymentStep !== "completing") {
          lightHaptic();
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden gpu-accelerated"
        onClick={(e) => e.stopPropagation()}
      >
        {paymentStep === "confirm" && (
          <>
            {/* Header unificado con diseño consistente */}
            <div className="flex items-center gap-3 p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <button
                onClick={() => {
                  lightHaptic();
                  if (onBackToMethods) {
                    onBackToMethods();
                  } else {
                    onClose();
                  }
                }}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-full transition-ios-fast active:scale-95 touch-target"
                aria-label="Zurück"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 flex-1">
                Zahlung bestätigen
              </h2>
              <button
                onClick={() => {
                  lightHaptic();
                  onClose();
                }}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-full transition-ios-fast active:scale-95 touch-target"
                aria-label="Schließen"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Card Método de Pago */}
              <div className="bg-[#F9FAFB] rounded-xl p-4 mb-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: methodInfo.color }}
                    >
                      <methodInfo.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-base truncate">
                        {methodInfo.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Verbunden
                      </p>
                    </div>
                  </div>
                  {onBackToMethods && (
                    <button
                      onClick={onBackToMethods}
                      className="text-[#25D076] text-sm font-medium hover:underline flex-shrink-0 ml-2"
                    >
                      Ändern →
                    </button>
                  )}
                </div>
              </div>

              {/* Resumen de Compra */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Bestellübersicht
                </h3>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                  {cartItems.map((item, index) => (
                    <div key={item.product.id || index} className="flex justify-between items-start text-sm pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                      <span className="text-gray-700 flex-1 pr-4">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="text-gray-900 font-semibold flex-shrink-0">
                        CHF {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-2 space-y-2.5">
                  {promoApplied && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Zwischensumme</span>
                        <span className="text-gray-800 font-medium">CHF {formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm bg-[#F2FDF5] -mx-2 px-2 py-1.5 rounded-lg">
                        <span className="text-[#3C7E44] font-semibold">
                          {promoInfo?.discountType === 'percentage' 
                            ? `${Math.round(promoInfo.discountValue)}% Rabatt`
                            : 'Rabatt'
                          }
                        </span>
                        <span className="text-[#3C7E44] font-semibold">
                          - CHF {formatPrice(discountAmount)}
                        </span>
                      </div>
                      {promoCode && (
                        <div className="text-xs text-gray-500 -mx-2 px-2">
                          Code: <span className="font-semibold">{promoCode.toUpperCase()}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Gesamtbetrag</span>
                      <span className="text-xl font-bold text-[#25D076]">
                        CHF {formatPrice(totalAmount)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">inkl. MwSt</p>
                  </div>
                </div>
              </div>


              {errorMessage && (
                <div
                  className="mb-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            {/* Botón CTA Principal - Estilo unificado */}
            <div className="p-5 border-t border-gray-200 bg-white sticky bottom-0">
              <button
                onClick={() => {
                  mediumHaptic();
                  onConfirm();
                }}
                disabled={isProcessing}
                className="w-full bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-2xl py-4 text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#25D076]/25 active:scale-[0.97] active:shadow-md touch-target"
                style={{ minHeight: '56px' }}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verarbeitung...
                  </span>
                ) : (
                  `ZAHLEN CHF ${formatPrice(totalAmount)}`
                )}
              </button>
            </div>
          </>
        )}

        {paymentStep === "processing" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              {/* Animación de loading - Más sutil */}
              <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                <Loader size="xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <methodInfo.icon 
                    className="w-12 h-12" 
                    style={{ color: methodInfo.color }}
                  />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Zahlung wird verarbeitet...
              </h3>
              <p className="text-2xl font-bold text-[#25D076] mb-6">
                CHF {formatPrice(totalAmount)}
              </p>
              
              {/* Progress bar - Sin animación de pulso */}
              <div className="w-4/5 max-w-xs mb-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#25D076] via-[#20B865] to-[#25D076] rounded-full w-full"></div>
                </div>
              </div>
              
              <p className="text-base text-gray-600 text-center max-w-xs">
                Bitte schließen Sie dieses Fenster nicht
              </p>
            </div>
          </>
        )}

        {/* Paso 3: Éxito - Diseño unificado */}
        {paymentStep === "success" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              {/* Icono de éxito - Sin animación excesiva */}
              <div className="w-28 h-28 bg-gradient-to-br from-[#25D076] to-[#20B865] rounded-3xl flex items-center justify-center shadow-lg shadow-[#25D076]/25 mb-8">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Zahlung erfolgreich!
              </h3>
              <p className="text-2xl font-bold text-[#25D076] mb-2">
                CHF {formatPrice(totalAmount)}
              </p>
              <p className="text-base text-gray-600 text-center mb-8 max-w-xs">
                Ihre Bestellung wurde erfolgreich verarbeitet
              </p>

              {/* Botón para continuar - El usuario debe hacer clic */}
              <div className="w-full max-w-xs">
                <button
                  onClick={() => {
                    mediumHaptic();
                    onStepChange?.("askData");
                  }}
                  className="w-full bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-2xl py-4 text-base transition-colors shadow-lg shadow-[#25D076]/25 active:scale-[0.97] active:shadow-md touch-target"
                  style={{ minHeight: '56px' }}
                >
                  Weiter
                </button>
              </div>
            </div>
          </>
        )}

        {/* Paso 3.5: ¿Quiere dar sus datos? - Diseño unificado */}
        {paymentStep === "askData" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              {/* Icono - Sin animación excesiva */}
              <div className="w-28 h-28 bg-gradient-to-br from-[#25D076]/20 to-[#20B865]/10 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-[#25D076]/10">
                <CheckCircle className="w-12 h-12 text-[#25D076]" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Möchten Sie Ihre Daten angeben?
              </h3>
              <p className="text-base text-gray-600 text-center mb-8 max-w-xs">
                Ihre Daten helfen uns, Ihnen bessere Service zu bieten und Ihre Rechnung zu erstellen.
              </p>
              
              {/* Botones - Sin animaciones de entrada */}
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={() => {
                    mediumHaptic();
                    onStepChange?.("personal");
                  }}
                  className="w-full bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-2xl py-4 text-base transition-colors shadow-lg shadow-[#25D076]/25 active:scale-[0.97] active:shadow-md touch-target"
                  style={{ minHeight: '56px' }}
                >
                  Ja, gerne
                </button>
                <button
                  onClick={async () => {
                    lightHaptic();
                    
                    // Crear factura como invitado (sin datos del cliente)
                    if (onCreateInvoice) {
                      try {
                        await onCreateInvoice();
                      } catch (error) {
                        console.error('Error al crear factura:', error);
                        // Continuar de todas formas
                      }
                    }
                    
                    // Ir al paso final de ver factura
                    onStepChange?.("viewInvoice");
                  }}
                  className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-2xl py-4 text-base transition-colors border-2 border-gray-200 active:scale-[0.97] active:border-gray-300 touch-target"
                  style={{ minHeight: '56px' }}
                >
                  Weiter ohne Daten
                </button>
              </div>
            </div>
          </>
        )}

        {/* Paso 4: Datos Personales - Header unificado */}
        {paymentStep === "personal" && (
          <>
            <div className="flex items-center gap-3 p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <button
                onClick={() => onStepChange?.("askData")}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-full transition-ios-fast active:scale-95 touch-target"
                aria-label="Zurück"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 flex-1">
                Ihre Kontaktdaten
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-base text-gray-600 text-center mb-6">
                Bitte geben Sie Ihre Kontaktdaten ein
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={personalData.name}
                    onChange={(e) => {
                      const newData = {...personalData, name: e.target.value};
                      setPersonalData(newData);
                    }}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors hover:border-gray-300 ios-input-fix"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                    placeholder="max@example.com"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors hover:border-gray-300 ios-input-fix"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={personalData.address}
                    onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                    placeholder="Bahnhofstrasse 1, 8001 Zürich"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors hover:border-gray-300 ios-input-fix"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                    placeholder="+41 79 123 45 67"
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors hover:border-gray-300 ios-input-fix"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 bg-white sticky bottom-0">
              <button
                onClick={async () => {
                  mediumHaptic();
                  
                  // Guardar datos del cliente en localStorage si se proporcionaron
                  if (personalData.name && personalData.email) {
                    onSaveCustomerData?.(personalData);
                  }
                  
                  // Crear la factura con los datos del cliente
                  if (onCreateInvoice) {
                    try {
                      await onCreateInvoice(personalData);
                    } catch (error) {
                      console.error('Error al crear factura:', error);
                      // Continuar de todas formas
                    }
                  }
                  
                  // Ir al paso final de ver factura
                  onStepChange?.("viewInvoice");
                }}
                className="w-full bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-2xl py-4 text-base transition-colors shadow-lg shadow-[#25D076]/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] active:shadow-md touch-target"
                style={{ minHeight: '56px' }}
                disabled={!personalData.name || !personalData.email || !personalData.address || !personalData.phone}
              >
                WEITER
              </button>
            </div>
          </>
        )}

        {/* Pasos "invoice" y "additional" eliminados - La factura se crea automáticamente */}

        {/* Paso final: ¿Ver factura? - Aparece al final del flujo */}
        {paymentStep === "viewInvoice" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              {/* Icono - Sin animación excesiva */}
              <div className="w-28 h-28 bg-gradient-to-br from-[#25D076]/20 to-[#20B865]/10 rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-[#25D076]/10">
                <FileText className="w-12 h-12 text-[#25D076]" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Ihre Rechnung ist bereit
              </h3>
              <p className="text-base text-gray-600 text-center mb-8 max-w-xs">
                Möchten Sie Ihre Rechnung jetzt ansehen, herunterladen oder drucken?
              </p>

              {/* Botones - Opciones finales */}
              <div className="w-full max-w-xs space-y-3">
                {createdInvoiceShareToken ? (
                  <button
                    onClick={onViewInvoice}
                    className="w-full bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-2xl py-4 text-base transition-colors shadow-lg shadow-[#25D076]/25 active:scale-[0.97] active:shadow-md touch-target"
                    style={{ minHeight: '56px' }}
                  >
                    Rechnung anzeigen
                  </button>
                ) : (
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Rechnung wird vorbereitet...
                  </p>
                )}
                <button
                  onClick={onSkipViewInvoice}
                  className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold rounded-2xl py-4 text-base transition-colors border-2 border-gray-200 active:scale-[0.97] active:border-gray-300 touch-target"
                  style={{ minHeight: '56px' }}
                >
                  Zurück zur Tienda
                </button>
              </div>

              {/* Nota informativa */}
              <p className="text-xs text-gray-500 text-center mt-8 max-w-xs">
                Sie können Ihre Rechnung jederzeit über den Link in Ihrer E-Mail aufrufen
              </p>
            </div>
          </>
        )}

        {/* Paso final: Completando compra - Diseño unificado */}
        {paymentStep === "completing" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
              {/* Animación - Solo el spinner, sin otras animaciones */}
              <div className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center">
                <Loader size="xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-[#25D076]" strokeWidth={2.5} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Bestellung wird abgeschlossen...
              </h3>
              <p className="text-base text-gray-600 text-center mb-8 max-w-xs">
                Vielen Dank für Ihren Einkauf. Wir leiten Sie gleich weiter.
              </p>
              
              {/* Progress bar - Sin animación de pulso */}
              <div className="w-4/5 max-w-xs">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#25D076] via-[#20B865] to-[#25D076] w-full"></div>
                </div>
              </div>
            </div>
          </>
        )}
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
    promoCode,
    cartItems,
  } = useCartStore();
  const { store } = useScannedStoreStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("confirm");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  
  // Cargar datos guardados del localStorage al iniciar
  const loadSavedCustomerData = (): { name: string; email: string; address: string; phone: string } => {
    if (typeof window === 'undefined') {
      return { name: '', email: '', address: '', phone: '' };
    }
    try {
      const saved = localStorage.getItem('vendly_customer_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          email: parsed.email || '',
          address: parsed.address || '',
          phone: parsed.phone || '',
        };
      }
    } catch (error) {
      console.error('Error loading customer data from localStorage:', error);
    }
    return { name: '', email: '', address: '', phone: '' };
  };

  // Guardar datos del cliente en localStorage
  const saveCustomerDataToLocalStorage = (data: { name: string; email: string; address: string; phone: string }) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vendly_customer_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving customer data to localStorage:', error);
    }
  };

  const [personalData, setPersonalData] = useState(loadSavedCustomerData());
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [createdInvoiceShareToken, setCreatedInvoiceShareToken] = useState<string | null>(null);
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
  
  const { promoInfo } = useCartStore();

  // Cargar datos guardados cuando se monta el componente
  useEffect(() => {
    if (mounted) {
      const savedData = loadSavedCustomerData();
      if (savedData.name || savedData.email) {
        setPersonalData(savedData);
      }
    }
  }, [mounted]);

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

  // Manejar el paso "completing" automáticamente
  useEffect(() => {
    if (paymentStep === "completing") {
      // Esperar 2 segundos mostrando "completing" y luego redirigir
      const timer = setTimeout(() => {
        handlePaymentSuccess();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [paymentStep]); // eslint-disable-line react-hooks/exhaustive-deps

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
    mediumHaptic(); // Feedback háptico al seleccionar método
    setSelectedPaymentMethod(method);
    setPaymentStep("confirm");
    setOrderError(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    // No permitir cerrar durante processing o completing
    if (createOrderMutation.isPending && paymentStep === "processing") {
      return;
    }

    // No permitir cerrar durante completing (se está redirigiendo)
    if (paymentStep === "completing") {
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
      setOrderError("Ihr Warenkorb ist leer.");
      setPaymentStep("confirm");
      return;
    }

    try {
      setOrderError(null);
      setPaymentStep("processing");

      // Preparar datos del cliente para enviar al backend
      const customerData = personalData.name && personalData.email 
        ? {
            name: personalData.name,
            email: personalData.email,
            address: personalData.address || undefined,
            phone: personalData.phone || undefined,
          }
        : undefined;

      // Usar mutation de React Query
      const orderResult = await createOrderMutation.mutateAsync({
        items: orderItems,
        paymentMethod: selectedPaymentMethod,
        total: payableTotal,
        storeId: store?.id,
        storeSlug: store?.slug,
        customer: customerData, // Enviar datos del cliente al backend
        metadata: {
          storeId: store?.id ?? null,
          storeSlug: store?.slug ?? null,
          storeName: store?.name ?? null,
          promoApplied,
          promoCode: promoApplied && promoCode ? promoCode : null, // Enviar código de descuento para registrar uso
          discountAmount: promoApplied ? discountAmount ?? 0 : 0,
          totalBeforeVAT: Number(subtotal.toFixed(2)),
          totalWithVAT: Number(totalWithVAT.toFixed(2)),
          // Incluir datos del cliente en metadata también para referencia
          customerData: customerData,
        },
      });

      // Guardar el ID de la orden (la factura se creará después cuando el usuario decida)
      if (orderResult?.id) {
        setCreatedOrderId(orderResult.id);
      }
      // NO guardar invoiceId ni invoiceShareToken aquí - se crearán después

      // IMPORTANTE: La compra ya se completó correctamente aquí
      // El carrito se limpiará cuando se cierre el modal o se complete el flujo
      // Los productos ya se descontaron y el código promocional ya se usó
      
      // Feedback háptico de éxito
      successHaptic();
      
      setPaymentStep("success");

      // NO cambiar automáticamente - el usuario debe hacer clic para avanzar
    } catch (error) {
      // Feedback háptico de error
      errorHaptic();
      
      const message =
        error instanceof Error
          ? error.message
          : "Wir konnten Ihre Zahlung nicht verarbeiten. Bitte versuchen Sie es erneut.";
      setOrderError(message);
      setPaymentStep("confirm");
    }
  };

  const handleInvoiceComplete = async (modalInvoiceData?: {
    option: 'none' | 'print' | 'email' | 'phone' | 'full';
    email?: string;
    phone?: string;
    fullData?: {
      name: string;
      email: string;
      address: string;
      city: string;
      postalCode: string;
      phone: string;
    };
    saveDataForFuture?: boolean;
  }) => {
    if (!createdOrderId) {
      // Si no hay orderId, ir directamente a preguntar si quiere ver la factura
      setPaymentStep("viewInvoice");
      return;
    }

    if (!modalInvoiceData) {
      // Si no hay datos de factura, ir directamente a preguntar si quiere ver la factura
      setPaymentStep("viewInvoice");
      return;
    }

    try {
      // Obtener datos de factura según la opción seleccionada
      const invoicePayload: {
        orderId: string;
        customerName?: string;
        customerEmail?: string;
        customerAddress?: string;
        customerCity?: string;
        customerPostalCode?: string;
        customerPhone?: string;
        saveCustomerData?: boolean;
      } = {
        orderId: createdOrderId,
      };

      // Determinar qué datos usar según la opción seleccionada
      if (modalInvoiceData.option === 'email') {
        invoicePayload.customerEmail = modalInvoiceData.email || personalData.email || undefined;
        invoicePayload.customerName = personalData.name || undefined;
        invoicePayload.customerAddress = personalData.address || undefined;
        invoicePayload.customerPhone = personalData.phone || undefined;
      } else if (modalInvoiceData.option === 'phone') {
        invoicePayload.customerPhone = modalInvoiceData.phone || personalData.phone || undefined;
        invoicePayload.customerName = personalData.name || undefined;
        invoicePayload.customerEmail = personalData.email || undefined;
        invoicePayload.customerAddress = personalData.address || undefined;
      } else if (modalInvoiceData.option === 'full' && modalInvoiceData.fullData) {
        invoicePayload.customerName = modalInvoiceData.fullData.name || personalData.name || undefined;
        invoicePayload.customerEmail = modalInvoiceData.fullData.email || personalData.email || undefined;
        invoicePayload.customerAddress = modalInvoiceData.fullData.address || personalData.address || undefined;
        invoicePayload.customerCity = modalInvoiceData.fullData.city || undefined;
        invoicePayload.customerPostalCode = modalInvoiceData.fullData.postalCode || undefined;
        invoicePayload.customerPhone = modalInvoiceData.fullData.phone || personalData.phone || undefined;
        invoicePayload.saveCustomerData = modalInvoiceData.saveDataForFuture;
      } else if (modalInvoiceData.option === 'print') {
        // Para imprimir, usar datos básicos si están disponibles
        invoicePayload.customerName = personalData.name || undefined;
        invoicePayload.customerEmail = personalData.email || undefined;
        invoicePayload.customerAddress = personalData.address || undefined;
        invoicePayload.customerPhone = personalData.phone || undefined;
      }

      // Si ya existe una factura creada automáticamente, actualizarla
      // Si no, crear una nueva
      let result;
      if (createdInvoiceId) {
        // Actualizar la factura existente con los datos adicionales
        result = await InvoiceService.updateInvoice(createdInvoiceId, {
          customerName: invoicePayload.customerName,
          customerEmail: invoicePayload.customerEmail,
          customerAddress: invoicePayload.customerAddress,
          customerCity: invoicePayload.customerCity,
          customerPostalCode: invoicePayload.customerPostalCode,
          customerPhone: invoicePayload.customerPhone,
          metadata: {
            saveCustomerData: invoicePayload.saveCustomerData,
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        // Crear una nueva factura si no existe
        result = await InvoiceService.createInvoice(invoicePayload);
      }

      if (result.success && result.data) {
        // Guardar el ID de la factura para poder compartirla después
        const invoiceId = result.data.id;
        const invoiceNumber = result.data.invoiceNumber;
        
        // Guardar el invoiceId en el estado para mostrar el botón
        setCreatedInvoiceId(invoiceId);
        
        // Mostrar mensaje de éxito
        toast.success(`Rechnung ${invoiceNumber} wurde erstellt`);
        
        // Si el usuario quiere guardar datos para el futuro, guardarlos
        if (invoicePayload.saveCustomerData && invoicePayload.customerEmail) {
          saveCustomerDataToLocalStorage({
            name: invoicePayload.customerName || '',
            email: invoicePayload.customerEmail || '',
            address: invoicePayload.customerAddress || '',
            phone: invoicePayload.customerPhone || '',
          });
        }

        // Si es email o phone, mostrar mensaje adicional
        if (modalInvoiceData.option === 'email' && invoicePayload.customerEmail) {
          toast.info(`Rechnung wurde an ${invoicePayload.customerEmail} gesendet`);
        } else if (modalInvoiceData.option === 'phone' && invoicePayload.customerPhone) {
          toast.info(`Rechnung wurde an ${invoicePayload.customerPhone} gesendet`);
        }

        // Guardar el link de la factura para compartir después si es necesario
        if (invoiceId) {
          const invoiceUrl = `${window.location.origin}/invoice/${invoiceId}`;
          // Opcional: guardar en localStorage para acceso rápido
          localStorage.setItem('lastInvoiceUrl', invoiceUrl);
        }
      } else {
        // Si falla la creación de la factura, continuar de todas formas
        console.error('Error al crear factura:', result.error);
        toast.warning('Rechnung konnte nicht erstellt werden, aber die Bestellung wurde erfolgreich abgeschlossen');
      }
    } catch (error) {
      // Si hay error, continuar de todas formas
      console.error('Error al crear factura:', error);
      toast.warning('Rechnung konnte nicht erstellt werden, aber die Bestellung wurde erfolgreich abgeschlossen');
    }

    // Después de actualizar/crear factura, preguntar si quiere verla
    setPaymentStep("viewInvoice");
  };

  const handleViewInvoice = () => {
    // Si tiene shareToken, redirigir a la página pública de la factura
    if (createdInvoiceShareToken) {
      router.push(`/invoice/public/${createdInvoiceShareToken}`);
      // Cerrar el modal después de redirigir
      setTimeout(() => {
        setIsModalOpen(false);
        clearCart();
      }, 300);
    } else {
      // Si no tiene shareToken pero tiene invoiceId, intentar obtenerlo
      // Por ahora, mostrar mensaje de error
      toast.error('Rechnung konnte nicht geladen werden');
    }
  };

  const handleSkipViewInvoice = () => {
    // Si no quiere ver la factura, cerrar el modal y redirigir
    handlePaymentSuccess();
  };

  // Función para crear la factura después de que el usuario decida sobre sus datos
  const handleCreateInvoice = async (customerData?: { name: string; email: string; address: string; phone: string }) => {
    if (!createdOrderId) {
      console.error('No hay orderId para crear la factura');
      return;
    }

    try {
      // Crear la factura con los datos del cliente (o como invitado si no hay datos)
      const invoicePayload = {
        orderId: createdOrderId,
        customerName: customerData?.name || 'Gast',
        customerEmail: customerData?.email || undefined,
        customerAddress: customerData?.address || undefined,
        customerPhone: customerData?.phone || undefined,
        saveCustomerData: !!customerData?.name && !!customerData?.email,
      };

      const result = await InvoiceService.createInvoice(invoicePayload);

      if (result.success && result.data) {
        setCreatedInvoiceId(result.data.id);
        if (result.data.shareToken) {
          setCreatedInvoiceShareToken(result.data.shareToken);
        }
        console.log('✅ Factura creada:', result.data.invoiceNumber);
      } else {
        console.error('Error al crear factura:', result.error);
        throw new Error(result.error || 'Error al crear factura');
      }
    } catch (error) {
      console.error('Error al crear factura:', error);
      throw error;
    }
  };

  // Función para actualizar la factura con los datos del cliente (si ya existe)
  const handleUpdateInvoiceWithData = async (data: { name: string; email: string; address: string; phone: string }) => {
    if (!createdInvoiceId || !createdOrderId) {
      // Si no existe factura, crearla
      return handleCreateInvoice(data);
    }

    try {
      const result = await InvoiceService.updateInvoice(createdInvoiceId, {
        customerName: data.name || undefined,
        customerEmail: data.email || undefined,
        customerAddress: data.address || undefined,
        customerPhone: data.phone || undefined,
        metadata: {
          saveCustomerData: true,
          updatedAt: new Date().toISOString(),
        },
      });

      if (result.success && result.data) {
        // Actualizar el shareToken si se actualizó
        if (result.data.shareToken) {
          setCreatedInvoiceShareToken(result.data.shareToken);
        }
        console.log('✅ Factura actualizada con datos del cliente');
      }
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      throw error;
    }
  };

  const handleStepChange = (step: PaymentStep) => {
    setPaymentStep(step);
  };


  const handlePaymentSuccess = () => {
    // Esta función se llama cuando se completa el flujo
    // El carrito ya se limpió automáticamente cuando se procesó la orden
    clearCart();
    setSelectedPaymentMethod("");
    setOrderError(null);
    
    // Cerrar el modal con una transición suave
    setIsModalOpen(false);
    setPaymentStep("confirm");
    
    // Redirigir a la página principal de la tienda después de una pequeña pausa
    const storeSlug = store?.slug;
    setTimeout(() => {
      if (storeSlug) {
        router.push(`/store/${storeSlug}`);
      } else {
        router.push("/user");
      }
    }, 300); // Pequeña pausa para transición suave
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
        methodData: {
          ...method,
          bgColor: method.bgColor ?? undefined,
          textColor: method.textColor ?? undefined,
        },
    };
  }) || [];

  // Redirigir automáticamente si el carrito está vacío (después de completar compra)
  useEffect(() => {
    if (mounted && totalItems === 0 && store?.slug) {
      // Pequeño delay para evitar redirección inmediata durante la transición
      const redirectTimer = setTimeout(() => {
        router.push(`/store/${store.slug}`);
      }, 500);

      return () => clearTimeout(redirectTimer);
    }
  }, [mounted, totalItems, store?.slug, router]);

  // Mostrar mensaje amigable si el carrito está vacío (solo después de montar para evitar hydration mismatch)
  if (mounted && totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F9F6F4] px-4 -mt-20">
        <div className="text-center max-w-md">
          {/* Icono de carrito vacío */}
          <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            <div className="w-24 h-24 bg-[#25D076]/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-[#25D076]" strokeWidth={1.5} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-[#373F49] mb-3">
            Ihr Warenkorb ist leer
          </h2>
          <p className="text-lg text-[#6E7996] mb-8">
            Fügen Sie Produkte hinzu, um fortzufahren
          </p>
          
          {/* Botón para volver a la tienda */}
          {store?.slug && (
            <button
              onClick={() => router.push(`/store/${store.slug}`)}
              className="inline-flex items-center gap-2 bg-[#25D076] hover:bg-[#20B865] active:bg-[#1EA55A] text-white font-semibold rounded-xl px-6 py-3 transition-ios shadow-lg shadow-[#25D076]/20 active:scale-[0.98] touch-target"
            >
              <ArrowLeft className="w-5 h-5" />
              Zurück zum Shop
            </button>
          )}
          
          {/* Mensaje de redirección automática */}
          <p className="text-sm text-[#6E7996] mt-6">
            Sie werden automatisch weitergeleitet...
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
        <p className="text-xl pt-4 font-semibold text-[#373F49]">
          {store?.name ?? "Gastbestellung"}
        </p>
        <p className="text-5xl font-bold">
          {formatSwissPriceWithCHF(payableTotal)}
        </p>
        <p className="text-lg font-semibold text-[#373F49]">
          inkl. MwSt • {totalItems} {totalItems === 1 ? "Artikel" : "Artikel"}
        </p>
        
      </div>

      {/* Código promocional */}
      <div className="pt-4 pl-12">
        {!promoApplied ? (
          <>
            <button
              onClick={() => setShowPromoInput(!showPromoInput)}
              className="text-[#25D076] text-[15px] font-semibold cursor-pointer hover:underline"
            >
              Promo Code?
            </button>
            {showPromoInput && (
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
                    autoFocus
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-brand-500 justify-center items-center flex hover:bg-brand-600 text-white font-semibold rounded-lg px-4 py-3  
                             touch-target tap-highlight-transparent 
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
            )}
          </>
        ) : (
          <div className="flex items-center bg-[#F2FDF5] rounded-xl px-4 py-3 mt-2 mb-2 shadow-sm border border-brand-200 mr-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-[#3C7E44] font-semibold text-[15px] leading-tight">
                  Code: {localPromoCode}
                </div>
              </div>
              <div className="text-[#3C7E44] text-[14px] leading-tight">
                {promoInfo?.discountType === 'percentage' 
                  ? `${Math.round(promoInfo.discountValue)}% Rabatt auf deine Produkte`
                  : promoInfo?.description 
                  ? promoInfo.description
                  : 'Rabatt'
                } - {formatSwissPriceWithCHF(discountAmount || 0)}
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
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#25D076] animate-spin"></div>
            </div>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#6E7996]">Keine Zahlungsmethoden verfügbar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => {
            const isSelected = selectedPaymentMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`
                  px-4 py-4 w-[345px] h-[50px] text-sm rounded-full
                  flex items-center justify-center gap-2
                  ${isSelected ? "ring-4 ring-brand-300 ring-opacity-50 shadow-lg scale-105" : "shadow-md"}
                  hover:opacity-90 active:scale-[0.97] touch-target tap-highlight-transparent
                  relative transition-ios
                `}
                style={{ 
                  backgroundColor: method.bgColor, // Usar color directamente desde la DB
                  color: method.textColor, // Usar color de texto directamente desde la DB
                  minHeight: "50px"
                }}
                aria-label={`${method.name} auswählen`}
              >
                {React.createElement(method.icon, { 
                  className: "w-5 h-5",
                  color: method.textColor
                } as React.ComponentProps<typeof method.icon>)}
                <span className="font-medium" style={{ color: method.textColor }}>{method.name}</span>
                {isSelected && (
                  <div className="absolute right-4">
                    <Eclipse className="w-4 h-4" color={method.textColor} />
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
        onClose={() => {
          // Si el pago ya se completó, limpiar y redirigir
          if (paymentStep === "success" || paymentStep === "completing" || paymentStep === "viewInvoice") {
            // Si está en "completing", ya se está procesando la redirección
            if (paymentStep !== "completing") {
              handlePaymentSuccess();
            }
          } else {
            handleModalClose();
          }
        }}
        selectedMethod={selectedPaymentMethod}
        totalAmount={payableTotal}
        isProcessing={isProcessing}
        paymentStep={paymentStep}
        errorMessage={orderError}
        onConfirm={handleConfirmPayment}
        paymentMethods={paymentMethods}
        promoApplied={promoApplied}
        promoCode={promoCode}
        discountAmount={discountAmount}
        subtotal={subtotal}
        promoInfo={promoInfo}
        cartItems={cartItems}
        onBackToMethods={() => {
          setIsModalOpen(false);
          setPaymentStep("confirm");
        }}
        onInvoiceComplete={handleInvoiceComplete}
        onStepChange={handleStepChange}
        personalData={personalData}
        setPersonalData={setPersonalData}
        onSaveCustomerData={saveCustomerDataToLocalStorage}
        createdInvoiceId={createdInvoiceId}
        createdInvoiceShareToken={createdInvoiceShareToken}
        createdOrderId={createdOrderId}
        onViewInvoice={handleViewInvoice}
        onSkipViewInvoice={handleSkipViewInvoice}
        onCreateInvoice={handleCreateInvoice}
      />
    </div>
  );
}
