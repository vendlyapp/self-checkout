"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/stores/cartStore";
import HeaderNav from "@/components/navigation/HeaderNav";
import { PaymentPage, PaymentModal } from "@/components/dashboard/charge";

export default function PaymentPageWrapper() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { clearCart } = useCartStore();

  const [totalAmount, setTotalAmount] = useState(0);

  const handlePaymentMethodSelect = (method: string, amount: number) => {
    setSelectedPaymentMethod(method);
    setTotalAmount(amount);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setSelectedPaymentMethod("");
    // Redirigir a /user después del pago exitoso
    router.push("/user");
  };

  return (
    <>
      <HeaderNav
        title="Bezahlung"
        showAddButton={false}
        closeDestination="/charge/cart"
      />

      <PaymentPage onPaymentMethodSelect={handlePaymentMethodSelect} />

      {/* Modal de confirmación de pago */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMethod={selectedPaymentMethod}
        totalAmount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
