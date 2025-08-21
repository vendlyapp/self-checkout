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
                <div className="text-[22px] text-gray-400 font-semibold line-through mb-1">
                  CHF {subtotal.toFixed(2)}
                </div>
              )}
              <div className="text-[38px] font-bold text-gray-900 leading-tight">
                CHF {total.toFixed(2)}
              </div>
              {promoApplied && (
                <div className="text-brand-700 text-[20px] font-semibold mb-1">
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
                <Lock className="w-4 h-6 mt-3" />
              </div>
              <div className="text-center text-[13px] text-gray-500 mt-1">
                Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren
                verarbeitet
              </div>
            </div>
          </div>
        </main>
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
