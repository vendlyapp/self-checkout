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
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Mail,
  Share2,
  Copy,
  Link2,
  Printer,
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

type PaymentStep = "confirm" | "processing" | "success" | "askData" | "personal" | "invoice" | "additional";

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
  onInvoiceComplete?: () => void;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {paymentStep === "confirm" && (
          <>
            {/* Header con flecha atrás */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <button
                onClick={onBackToMethods || onClose}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Zurück"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 flex-1">
                Zahlung bestätigen
              </h2>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Schließen"
              >
                <X className="w-5 h-5 text-gray-700" />
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
                <h3 className="text-base font-semibold text-gray-900 mb-4">
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
                <div className="border-t border-gray-200 pt-4 space-y-2.5">
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
                  className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {errorMessage}
                </div>
              )}

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-500">
                <Lock className="w-4 h-4 text-[#25D076]" />
                <span>Sichere Zahlung mit SSL-Verschlüsselung</span>
              </div>
            </div>

            {/* Botón CTA Principal - Fixed en la parte inferior */}
            <div className="p-6 border-t border-gray-200 bg-white sticky bottom-0">
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className="w-full bg-[#25D076] hover:bg-[#20B865] text-white font-semibold rounded-xl py-4 text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#25D076]/20"
                style={{ minHeight: '56px' }}
              >
                ZAHLEN CHF {formatPrice(totalAmount)}
              </button>
            </div>
          </>
        )}

        {paymentStep === "processing" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              {/* Animación de loading mejorada */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#25D076] animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <methodInfo.icon 
                    className="w-12 h-12" 
                    style={{ color: methodInfo.color }}
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Zahlung wird verarbeitet...
              </h3>
              <p className="text-2xl font-bold text-[#25D076] mb-6">
                CHF {formatPrice(totalAmount)}
              </p>
              
              {/* Progress bar */}
              <div className="w-4/5 max-w-xs mb-6">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#25D076] via-[#20B865] to-[#25D076] animate-pulse" style={{ width: '100%', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                Bitte schließen Sie dieses Fenster nicht
              </p>
            </div>
          </>
        )}

        {/* Paso 3: Éxito - Solo muestra confirmación breve */}
        {paymentStep === "success" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              <div className="w-20 h-20 bg-[#25D076] rounded-full flex items-center justify-center mb-4 animate-scale-in shadow-lg shadow-[#25D076]/20">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Zahlung erfolgreich!
              </h3>
              <p className="text-xl font-bold text-[#25D076] mb-4">
                CHF {formatPrice(totalAmount)}
              </p>
              <p className="text-sm text-gray-600 text-center mb-6">
                Ihre Bestellung wurde erfolgreich verarbeitet
              </p>
            </div>
          </>
        )}

        {/* Paso 3.5: ¿Quiere dar sus datos? */}
        {paymentStep === "askData" && (
          <>
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6">
              <div className="w-20 h-20 bg-[#25D076] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#25D076]/20">
                <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
                Möchten Sie Ihre Daten angeben?
              </h3>
              <p className="text-base text-gray-600 text-center mb-8 max-w-sm">
                Ihre Daten helfen uns, Ihnen bessere Service zu bieten und Ihre Rechnung zu erstellen.
              </p>
              
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={() => onStepChange?.("personal")}
                  className="w-full bg-[#25D076] hover:bg-[#20B865] text-white font-semibold rounded-xl py-4 text-base transition-colors shadow-lg shadow-[#25D076]/20"
                  style={{ minHeight: '56px' }}
                >
                  Ja, gerne
                </button>
                <button
                  onClick={() => {
                    // Ir directamente a opciones adicionales sin pedir datos
                    onStepChange?.("additional");
                  }}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl py-4 text-base transition-colors border-2 border-gray-200"
                  style={{ minHeight: '56px' }}
                >
                  Weiter ohne Daten
                </button>
              </div>
            </div>
          </>
        )}

        {/* Paso 4: Datos Personales */}
        {paymentStep === "personal" && (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => onStepChange?.("askData")}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Zurück"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 flex-1">
                Ihre Kontaktdaten
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-base text-gray-600 text-center mb-6">
                Bitte geben Sie Ihre Kontaktdaten ein
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={personalData.name}
                    onChange={(e) => {
                      const newData = {...personalData, name: e.target.value};
                      setPersonalData(newData);
                      // Guardar automáticamente mientras el usuario escribe (opcional, solo si quiere guardar)
                    }}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                    placeholder="max@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={personalData.address}
                    onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                    placeholder="Bahnhofstrasse 1, 8001 Zürich"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                    placeholder="+41 79 123 45 67"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-white">
              <button
                onClick={() => onStepChange?.("invoice")}
                className="w-full bg-[#25D076] hover:bg-[#20B865] text-white font-semibold rounded-xl py-4 text-base transition-colors shadow-lg shadow-[#25D076]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '56px' }}
                disabled={!personalData.name || !personalData.email || !personalData.address || !personalData.phone}
              >
                WEITER
              </button>
            </div>
          </>
        )}

        {/* Paso 4: ¿Rechnung benötigt? */}
        {paymentStep === "invoice" && (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
              <button
                onClick={() => onStepChange?.("personal")}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Zurück"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800 flex-1">
                Rechnung benötigt?
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col items-center mb-6">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-base text-gray-600 text-center mb-6">
                  Wie möchten Sie die Rechnung erhalten?
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D076] transition-colors">
                  <input
                    type="radio"
                    name="invoice"
                    value="none"
                    checked={invoiceOption === 'none'}
                    onChange={() => {
                      setInvoiceOption('none');
                      setShowFullInvoiceForm(false);
                    }}
                    className="w-5 h-5 text-[#25D076] focus:ring-[#25D076]"
                  />
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-800">Nein, danke</p>
                    <p className="text-sm text-gray-500 mt-1">Keine Rechnung benötigt</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D076] transition-colors">
                  <input
                    type="radio"
                    name="invoice"
                    value="print"
                    checked={invoiceOption === 'print'}
                    onChange={() => {
                      setInvoiceOption('print');
                      setShowFullInvoiceForm(false);
                    }}
                    className="w-5 h-5 text-[#25D076] focus:ring-[#25D076]"
                  />
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-800">Drucken (ohne Daten)</p>
                    <p className="text-sm text-gray-500 mt-1">Für Selbstbedienungskassen</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D076] transition-colors">
                  <input
                    type="radio"
                    name="invoice"
                    value="email"
                    checked={invoiceOption === 'email'}
                    onChange={() => {
                      setInvoiceOption('email');
                      setShowFullInvoiceForm(false);
                    }}
                    className="mt-0.5 w-5 h-5 text-[#25D076] focus:ring-[#25D076] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-800 mb-2">Per E-Mail senden</p>
                    {invoiceOption === 'email' && (
                      <input
                        type="email"
                        value={invoiceEmail || personalData.email}
                        onChange={(e) => setInvoiceEmail(e.target.value)}
                        placeholder={personalData.email || "deine@email.com"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] mt-2"
                        autoFocus
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D076] transition-colors">
                  <input
                    type="radio"
                    name="invoice"
                    value="phone"
                    checked={invoiceOption === 'phone'}
                    onChange={() => {
                      setInvoiceOption('phone');
                      setShowFullInvoiceForm(false);
                    }}
                    className="mt-0.5 w-5 h-5 text-[#25D076] focus:ring-[#25D076] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-800 mb-2">Per Telefon senden</p>
                    {invoiceOption === 'phone' && (
                      <input
                        type="tel"
                        value={invoicePhone || personalData.phone}
                        onChange={(e) => setInvoicePhone(e.target.value)}
                        placeholder={personalData.phone || "+41 79 123 45 67"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] mt-2"
                        autoFocus
                      />
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-[#25D076] transition-colors">
                  <input
                    type="radio"
                    name="invoice"
                    value="full"
                    checked={invoiceOption === 'full'}
                    onChange={() => {
                      setInvoiceOption('full');
                      setShowFullInvoiceForm(true);
                    }}
                    className="mt-0.5 w-5 h-5 text-[#25D076] focus:ring-[#25D076] flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-800">Mit Steuerdaten</p>
                    <p className="text-sm text-gray-500 mt-1">Für Unternehmen oder Steuerzwecke</p>
                  </div>
                </label>
              </div>

              {showFullInvoiceForm && invoiceOption === 'full' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Steuerdaten</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name oder Firmenname *
                    </label>
                    <input
                      type="text"
                      value={invoiceData.name}
                      onChange={(e) => setInvoiceData({...invoiceData, name: e.target.value})}
                      placeholder="Max Mustermann"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      E-Mail *
                    </label>
                    <input
                      type="email"
                      value={invoiceData.email || personalData.email}
                      onChange={(e) => setInvoiceData({...invoiceData, email: e.target.value})}
                      placeholder={personalData.email || "max@example.com"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={invoiceData.phone || personalData.phone}
                      onChange={(e) => setInvoiceData({...invoiceData, phone: e.target.value})}
                      placeholder={personalData.phone || "+41 79 123 45 67"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] bg-white"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Stadt *
                      </label>
                      <input
                        type="text"
                        value={invoiceData.city}
                        onChange={(e) => setInvoiceData({...invoiceData, city: e.target.value})}
                        placeholder="Zürich"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Postleitzahl *
                      </label>
                      <input
                        type="text"
                        value={invoiceData.postalCode}
                        onChange={(e) => setInvoiceData({...invoiceData, postalCode: e.target.value})}
                        placeholder="8000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={invoiceData.address}
                      onChange={(e) => setInvoiceData({...invoiceData, address: e.target.value})}
                      placeholder="Bahnhofstrasse 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#25D076] bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => {
                  if (invoiceOption === 'none' || invoiceOption === 'print') {
                    onSkipInvoice?.();
                  } else {
                    onInvoiceComplete?.();
                  }
                }}
                className="w-full bg-[#25D076] hover:bg-[#20B865] text-white font-semibold rounded-xl py-3.5 text-base transition-colors shadow-lg shadow-[#25D076]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  (invoiceOption === 'email' && !invoiceEmail && !personalData.email) ||
                  (invoiceOption === 'phone' && !invoicePhone && !personalData.phone) ||
                  (invoiceOption === 'full' && (!invoiceData.name || !invoiceData.email || !invoiceData.address || !invoiceData.city || !invoiceData.postalCode))
                }
              >
                WEITER
              </button>
            </div>
          </>
        )}

        {/* Paso 5: Opciones adicionales - Simplificado y sin scroll */}
        {paymentStep === "additional" && (
          <>
            <div className="flex items-center justify-end p-4 border-b border-gray-200 bg-white">
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Schließen"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-8 px-6 min-h-[400px]">
              {/* Icono de éxito */}
              <div className="w-16 h-16 bg-[#25D076] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#25D076]/20">
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                Vielen Dank!
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Ihre Bestellung wurde erfolgreich verarbeitet
              </p>

              {/* Opciones compactas en grid */}
              <div className="w-full max-w-sm space-y-2 mb-6">
                <label className="flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={saveDataForFuture}
                    onChange={(e) => setSaveDataForFuture(e.target.checked)}
                    className="w-4 h-4 text-[#25D076] focus:ring-[#25D076] rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Daten für zukünftige Einkäufe speichern</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={receiveOffers}
                    onChange={(e) => setReceiveOffers(e.target.checked)}
                    className="w-4 h-4 text-[#25D076] focus:ring-[#25D076] rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Exklusive Angebote erhalten</span>
                </label>
              </div>

              {/* Rechnung - Grid compacto 2x2 */}
              <div className="w-full max-w-sm mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 text-center">
                  Rechnung
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={async () => {
                      const invoiceData = {
                        orderId: Math.random().toString(36).substring(2, 12).toUpperCase(),
                        date: new Date().toLocaleDateString('de-DE'),
                        items: cartItems,
                        total: totalAmount,
                        personalData: personalData,
                      };
                      console.log('Generating PDF:', invoiceData);
                      alert('PDF wird generiert...');
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#25D076]/30 transition-all group"
                  >
                    <Download className="w-5 h-5 text-gray-600 group-hover:text-[#25D076] transition-colors" />
                    <span className="text-xs font-medium text-gray-700">PDF</span>
                  </button>
                  <button 
                    onClick={() => {
                      const email = personalData.email || invoiceEmail || invoiceData.email;
                      if (email) {
                        window.location.href = `mailto:${email}?subject=Rechnung`;
                      } else {
                        alert('Bitte geben Sie eine E-Mail-Adresse ein');
                      }
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#25D076]/30 transition-all group"
                  >
                    <Mail className="w-5 h-5 text-gray-600 group-hover:text-[#25D076] transition-colors" />
                    <span className="text-xs font-medium text-gray-700">E-Mail</span>
                  </button>
                  <button 
                    onClick={() => {
                      const invoiceLink = `${window.location.origin}/invoice/${Math.random().toString(36).substring(2, 12)}`;
                      navigator.clipboard.writeText(invoiceLink);
                      alert('Link kopiert!');
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#25D076]/30 transition-all group"
                  >
                    <Link2 className="w-5 h-5 text-gray-600 group-hover:text-[#25D076] transition-colors" />
                    <span className="text-xs font-medium text-gray-700">Link</span>
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="flex flex-col items-center gap-1.5 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-[#25D076]/30 transition-all group"
                  >
                    <Printer className="w-5 h-5 text-gray-600 group-hover:text-[#25D076] transition-colors" />
                    <span className="text-xs font-medium text-gray-700">Drucken</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Botón final fijo */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => {
                  // Si el usuario quiere guardar sus datos, guardarlos en localStorage
                  if (saveDataForFuture && personalData.name && personalData.email) {
                    onSaveCustomerData?.(personalData);
                    console.log('Customer data saved to localStorage:', personalData);
                  }
                  
                  // Guardar preferencias si están seleccionadas
                  if (saveDataForFuture || receiveOffers) {
                    console.log('Saving preferences:', { saveDataForFuture, receiveOffers, personalData });
                    // Aquí se enviarían las preferencias al backend si es necesario
                  }
                  
                  onClose();
                }}
                className="w-full bg-[#25D076] hover:bg-[#20B865] text-white font-semibold rounded-xl py-3.5 text-base transition-colors shadow-lg shadow-[#25D076]/20"
              >
                ABSCHLIESSEN
              </button>
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
      await createOrderMutation.mutateAsync({
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

      // IMPORTANTE: La compra ya se completó correctamente aquí
      // El carrito se limpiará cuando se cierre el modal o se complete el flujo
      // Los productos ya se descontaron y el código promocional ya se usó
      
      setPaymentStep("success");

      // Después de 1.5 segundos, preguntar si quiere dar datos
      setTimeout(() => {
        setPaymentStep("askData");
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Wir konnten Ihre Zahlung nicht verarbeiten. Bitte versuchen Sie es erneut.";
      setOrderError(message);
      setPaymentStep("confirm");
    }
  };

  const handleInvoiceComplete = () => {
    // Pasar a la pantalla de opciones adicionales
    setPaymentStep("additional");
  };

  const handleSkipInvoice = () => {
    // Si no quiere factura o quiere imprimir, ir directamente a opciones adicionales
    setPaymentStep("additional");
  };

  const handleStepChange = (step: PaymentStep) => {
    setPaymentStep(step);
  };


  const handlePaymentSuccess = () => {
    // Esta función se llama cuando se completa el flujo
    // El carrito ya se limpió automáticamente cuando se procesó la orden
    clearCart();
    setSelectedPaymentMethod("");
    setIsModalOpen(false);
    setPaymentStep("confirm");
    setOrderError(null);
    // Redirigir a la página principal de la tienda
    const storeSlug = store?.slug;
    if (storeSlug) {
      router.push(`/store/${storeSlug}`);
    } else {
      router.push("/user");
    }
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

  // Mostrar mensaje si el carrito está vacío (solo después de montar para evitar hydration mismatch)
  if (mounted && totalItems === 0) {
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
          CHF {formatSwissPriceWithCHF(payableTotal)}
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
            {paymentMethods.map((method, index) => {
            const isSelected = selectedPaymentMethod === method.id;
            
            return (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`
                  px-4 py-4 w-[345px] h-[50px] text-sm rounded-full
                  flex items-center justify-center gap-2
                  ${isSelected ? "ring-4 ring-brand-300 ring-opacity-50" : ""}
                  hover:opacity-90 active:scale-95 touch-target tap-highlight-transparent
                  relative
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
          if (paymentStep === "additional" || paymentStep === "success") {
            handlePaymentSuccess();
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
        onSkipInvoice={handleSkipInvoice}
        onStepChange={handleStepChange}
        personalData={personalData}
        setPersonalData={setPersonalData}
        onSaveCustomerData={saveCustomerDataToLocalStorage}
      />
    </div>
  );
}
