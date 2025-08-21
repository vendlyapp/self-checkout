import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/stores/cartStore";

export const usePromoCode = () => {
  const { getSubtotal } = useCartStore();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");

  const subtotal = getSubtotal();
  const total = +(subtotal - discountAmount).toFixed(2);

  // Debug: verificar valores del hook
  console.log("🔍 usePromoCode Debug:", {
    subtotal,
    promoCode,
    promoApplied,
    discountAmount,
    total,
    getSubtotalResult: getSubtotal(),
  });

  // Aplicar código promocional
  const handleApplyPromo = () => {
    console.log("🔍 handleApplyPromo ejecutado:", {
      promoCode: promoCode.trim().toUpperCase(),
      isCHECK01: promoCode.trim().toUpperCase() === "CHECK01",
      subtotal,
      calculatedDiscount: +(subtotal * 0.1).toFixed(2),
    });

    if (promoCode.trim().toUpperCase() === "CHECK01") {
      const discount = +(subtotal * 0.1).toFixed(2);
      console.log("🔍 Aplicando descuento:", { discount });
      setDiscountAmount(discount);
      setPromoApplied(true);
      setPromoError("");
    } else {
      console.log("🔍 Código inválido, limpiando descuento");
      setPromoApplied(false);
      setDiscountAmount(0);
      setPromoError("Der Code existiert nicht oder ist ungültig.");
    }
  };

  // Quitar código promocional
  const handleRemovePromo = () => {
    setPromoApplied(false);
    setDiscountAmount(0);
    setPromoCode("");
  };

  // Limpiar promociones cuando el carrito esté vacío
  useEffect(() => {
    if (subtotal === 0) {
      setPromoApplied(false);
      setDiscountAmount(0);
      setPromoCode("");
    }
  }, [subtotal]);

  return {
    promoCode,
    setPromoCode,
    promoApplied,
    discountAmount,
    promoError,
    setPromoError,
    subtotal,
    total,
    handleApplyPromo,
    handleRemovePromo,
  };
};
