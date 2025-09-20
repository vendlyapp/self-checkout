"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import {
  CreditCard,
  Smartphone,
  FileText,
  DollarSign,
  Lock,
} from "lucide-react";
import HeaderNav from "@/components/navigation/HeaderNav";
import PaymentModal from "@/components/dashboard/charge/PaymentModal";

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
  const router = useRouter();

  // Cálculos del carrito desde el store centralizado
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const total = getTotalWithDiscount();

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

  return (
    <>
      <div className="w-full">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="flex flex-col">
            <HeaderNav
              title="Bezahlung"
              showAddButton={false}
              closeDestination="/charge/cart"
            />

            <main className="flex-1 flex flex-col items-center">
              <div className="w-full max-w-md mx-auto ">
                <div className="text-center p-4 bg-[#F9F6F4]">
                  <div className="text-[18px] font-medium text-gray-700 mb-1">
                    Heiniger&apos;s Hofladen
                  </div>
                  {promoApplied && (
                    <div className="text-[16px] text-gray-400  line-through mb-1">
                      CHF {subtotal.toFixed(2)}
                    </div>
                  )}
                  <div className="text-[38px] font-bold text-gray-900 leading-tight">
                    CHF {total.toFixed(2)}
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
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => handlePaymentMethodSelect("twint")}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-[20px] py-4 shadow transition-colors"
                      aria-label="TWINT"
                    >
                      <Smartphone className="w-6 h-6" /> TWINT
                    </button>
                    <button
                      onClick={() => handlePaymentMethodSelect("card")}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-[#7e8bb6] hover:bg-[#6b7aa3] text-white font-bold text-[20px] py-4 shadow transition-colors"
                      aria-label="Zahlungslink"
                    >
                      <CreditCard className="w-6 h-6" /> Zahlungslink
                    </button>
                    <button
                      onClick={() => handlePaymentMethodSelect("cash")}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-[#7b7575] hover:bg-[#6a6565] text-white font-bold text-[20px] py-4 shadow transition-colors"
                      aria-label="Bargeld"
                    >
                      <DollarSign className="w-6 h-6" /> Bargeld
                    </button>
                    <button
                      onClick={() => handlePaymentMethodSelect("invoice")}
                      className="w-full flex items-center justify-center gap-3 rounded-full bg-[#1d3b36] hover:bg-[#16302b] text-white font-bold text-[20px] py-4 shadow transition-colors"
                      aria-label="Rechnung"
                    >
                      <FileText className="w-6 h-6" /> Rechnung
                    </button>
                  </div>
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
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
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
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={() => handlePaymentMethodSelect("twint")}
                      className="w-full flex items-center justify-center gap-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-lg py-4 shadow transition-colors"
                      aria-label="TWINT"
                    >
                      <Smartphone className="w-6 h-6" /> TWINT
                    </button>
                    <button
                      onClick={() => handlePaymentMethodSelect("card")}
                      className="w-full flex items-center justify-center gap-4 rounded-xl bg-[#7e8bb6] hover:bg-[#6b7aa3] text-white font-bold text-lg py-4 shadow transition-colors"
                      aria-label="Zahlungslink"
                    >
                      <CreditCard className="w-6 h-6" /> Zahlungslink
                    </button>
                    <button
                      onClick={() => handlePaymentMethodSelect("cash")}
                      className="w-full flex items-center justify-center gap-4 rounded-xl bg-[#7b7575] hover:bg-[#6a6565] text-white font-bold text-lg py-4 shadow transition-colors"
                      aria-label="Bargeld"
                    >
                      <DollarSign className="w-6 h-6" /> Bargeld
                    </button>
                    <button
                      onClick={() => handlePaymentMethodSelect("invoice")}
                      className="w-full flex items-center justify-center gap-4 rounded-xl bg-[#1d3b36] hover:bg-[#16302b] text-white font-bold text-lg py-4 shadow transition-colors"
                      aria-label="Rechnung"
                    >
                      <FileText className="w-6 h-6" /> Rechnung
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Bestellübersicht</h2>

                  {/* Store Info */}
                  <div className="text-center p-4 bg-[#F9F6F4] rounded-xl mb-6">
                    <div className="text-lg font-medium text-gray-700 mb-1">
                      Heiniger&apos;s Hofladen
                    </div>
                    {promoApplied && (
                      <div className="text-base text-gray-400 line-through mb-1">
                        CHF {subtotal.toFixed(2)}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-gray-900 leading-tight">
                      CHF {total.toFixed(2)}
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

      {/* Modal de confirmación de pago */}
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
