"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import {
  CreditCard,
  Smartphone,
  FileText,
  DollarSign,
  Lock,
  QrCode,
  Coins,
} from "lucide-react";
import HeaderNav from "@/components/navigation/HeaderNav";
import PaymentModal from "@/components/dashboard/charge/PaymentModal";
import { useMyStore } from "@/hooks/queries/useMyStore";
import { usePaymentMethods } from "@/hooks/queries/usePaymentMethods";
import { Loader } from "@/components/ui/Loader";
import { formatSwissPriceWithCHF } from "@/lib/utils";

export default function PaymentPage() {
  const {
    clearCart,
    getTotalItems,
    getSubtotal,
    getTotalWithDiscount,
    promoApplied,
  } = useCartStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Obtener la tienda del usuario autenticado
  const { data: store, isLoading: storeLoading } = useMyStore();

  // Obtener métodos de pago reales desde la API
  const { data: paymentMethodsData, isLoading: paymentMethodsLoading } = usePaymentMethods({
    storeId: store?.id || '',
    activeOnly: true, // Solo mostrar métodos activos
  });

  // Sincronizar estado del carrito solo en el cliente para evitar hydration mismatch
  const mountedRef = useRef(false);
  
  useEffect(() => {
    // Solo establecer mounted una vez
    if (!mountedRef.current) {
      mountedRef.current = true;
      setMounted(true);
    }
  }, []); // Sin dependencias para ejecutar solo una vez

  // Cálculos del carrito desde el store centralizado
  // Solo calcular después de montar para evitar hydration mismatch
  const totalItems = mounted ? getTotalItems() : 0;
  const subtotal = mounted ? getSubtotal() : 0;
  const total = mounted ? getTotalWithDiscount() : 0;

  // Mapeo de códigos de métodos de pago a iconos de lucide-react
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

  // Mapear métodos de pago de la API al formato esperado
  const paymentMethods = paymentMethodsData?.map((method) => {
    const IconComponent = getPaymentMethodIcon(method.code);
    const bgColorValue = method.bgColor || '#6E7996';
    
    return {
      code: method.code,
      label: method.displayName,
      icon: IconComponent,
      bgColor: bgColorValue, // Guardar el valor del color directamente
    };
  }) || [];

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setSelectedPaymentMethod("");
    // Redirigir a /charge después del pago exitoso (flujo admin)
    router.push("/charge");
  };

  // Mostrar loading state durante la hidratación o mientras se cargan los datos
  if (!mounted || storeLoading || paymentMethodsLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center animate-fade-in gpu-accelerated">
        <div className="flex flex-col items-center justify-center text-center">
          <Loader size="lg" className="mb-4" />
          <p className="text-xl font-semibold text-gray-900">
            Wird geladen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full animate-fade-in gpu-accelerated">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="flex flex-col">
            <HeaderNav
              title="Bezahlung"
              showAddButton={false}
              closeDestination="/charge/cart"
            />

            <main className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-md mx-auto">
                <div className="text-center p-4 bg-[#F9F6F4] rounded-xl">
                  <div className="text-[18px] font-medium text-gray-700 mb-1">
                    {store?.name || "Geschäft"}
                  </div>
                  {promoApplied && (
                    <div className="text-[16px] text-gray-400 line-through mb-1">
                      {formatSwissPriceWithCHF(subtotal)}
                    </div>
                  )}
                  <div className="text-[38px] font-bold text-gray-900 leading-tight">
                    {formatSwissPriceWithCHF(total)}
                  </div>
                  {promoApplied && (
                    <div className="text-[#3C7E44] text-[15px] font-semibold mb-1">
                      10% Rabatt auf Bio-Produkte angewendet!
                    </div>
                  )}
                  <div className="text-gray-500 text-[16px]">
                    inkl. MwSt • {totalItems} Artikel
                  </div>
                </div>
                <div className="py-6 mb-8 ml-8 mr-8">
                  <div className="text-center text-[18px] font-semibold text-gray-800 mb-4">
                    Zahlungsart wählen:
                  </div>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Keine Zahlungsmethoden verfügbar</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {paymentMethods.map((payment) => {
                        const Icon = payment.icon;
                        return (
                          <button
                            key={payment.code}
                            onClick={() => handlePaymentMethodSelect(payment.code)}
                            className="w-full flex items-center justify-center gap-3 rounded-full hover:opacity-90 text-white font-bold text-[20px] py-4 shadow 
                                     transition-ios active:scale-95"
                            aria-label={payment.label}
                            style={{
                              backgroundColor: payment.bgColor,
                            }}
                          >
                            <Icon className="w-6 h-6" /> {payment.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="w-full max-w-md mx-auto mt-auto mb-2 bg-white  py-3 px-4 shadow border border-gray-100">
                  <div className="flex items-center gap-2 justify-center text-[15px] text-gray-700 ">
                    <span className="w-3 h-3 rounded-full bg-brand-500 inline-block mr-2" />
                    <span className="font-semibold">
                      256-BIT SSL VERSCHLÜSSELUNG
                    </span>
                    <Lock className="w-4 h-4 -mt-1" />
                  </div>
                  <div className="text-center text-[13px] text-gray-500 mt-1">
                    Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren
                    verarbeitet
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bezahlung</h1>
                <p className="text-gray-600 mt-1">Wählen Sie Ihre bevorzugte Zahlungsmethode</p>
              </div>
              <button
                onClick={() => router.push("/charge/cart")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 
                         transition-ios hover:bg-gray-100 rounded-lg active:scale-95"
              >
                <span>← Zurück zum Warenkorb</span>
              </button>
            </div>

            {/* Payment Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Zahlungsart wählen</h2>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Keine Zahlungsmethoden verfügbar</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {paymentMethods.map((payment) => {
                        const Icon = payment.icon;
                        return (
                          <button
                            key={payment.code}
                            onClick={() => handlePaymentMethodSelect(payment.code)}
                            className="w-full flex items-center justify-center gap-4 rounded-xl hover:opacity-90 text-white font-bold text-lg py-4 shadow 
                                     transition-ios active:scale-95"
                            aria-label={payment.label}
                            style={{
                              backgroundColor: payment.bgColor,
                            }}
                          >
                            <Icon className="w-6 h-6" /> {payment.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Bestellübersicht</h2>

                  {/* Store Info */}
                  <div className="text-center p-4 bg-[#F9F6F4] rounded-xl mb-6">
                    <div className="text-lg font-medium text-gray-700 mb-1">
                      {store?.name || "Geschäft"}
                    </div>
                    {promoApplied && (
                      <div className="text-base text-gray-400 line-through mb-1">
                        {formatSwissPriceWithCHF(subtotal)}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-gray-900 leading-tight">
                      {formatSwissPriceWithCHF(total)}
                    </div>
                    {promoApplied && (
                      <div className="text-[#3C7E44] text-sm font-semibold mb-1">
                        10% Rabatt auf Bio-Produkte angewendet!
                      </div>
                    )}
                    <div className="text-gray-500 text-base">
                      inkl. MwSt • {totalItems} Artikel
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="bg-gray-50 rounded-xl py-4 px-4">
                    <div className="flex items-center gap-2 justify-center text-sm text-gray-700 mb-2">
                      <span className="w-3 h-3 rounded-full bg-brand-500 inline-block" />
                      <span className="font-semibold">
                        256-BIT SSL VERSCHLÜSSELUNG
                      </span>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren verarbeitet
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMethod={selectedPaymentMethod}
        totalAmount={total}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
