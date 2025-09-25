import { useState } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import type { PromoLogicReturn } from "@/types";

/**
 * Hook centralizado para lógica de códigos promocionales
 * Maneja la aplicación y remoción de códigos de descuento
 *
 * @returns PromoLogicReturn - Estado y funciones para manejo de promociones
 *
 * @example
 * ```tsx
 * const {
 *   promoApplied,
 *   discountAmount,
 *   promoError,
 *   localPromoCode,
 *   setLocalPromoCode,
 *   handleApplyPromo,
 *   handleRemovePromo,
 * } = usePromoLogic();
 *
 * return (
 *   <div>
 *     <input
 *       value={localPromoCode}
 *       onChange={(e) => setLocalPromoCode(e.target.value)}
 *     />
 *     <button onClick={handleApplyPromo}>Apply</button>
 *     {promoApplied && (
 *       <button onClick={handleRemovePromo}>Remove</button>
 *     )}
 *   </div>
 * );
 * ```
 */
// PromoLogicReturn interface moved to @/types

export const usePromoLogic = (): PromoLogicReturn => {
  const { promoCode, promoApplied, discountAmount, applyPromoCode, removePromoCode } = useCartStore();
  const [promoError, setPromoError] = useState("");
  const [localPromoCode, setLocalPromoCode] = useState(promoCode);

  const handleApplyPromo = () => {
    if (localPromoCode.trim().toUpperCase() === "CHECK01") {
      applyPromoCode(localPromoCode);
      setPromoError("");
    } else {
      setPromoError("Der Code existiert nicht oder ist ungültig.");
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setLocalPromoCode("");
    setPromoError("");
  };

  return {
    promoApplied,
    discountAmount,
    promoError,
    localPromoCode,
    setLocalPromoCode,
    handleApplyPromo,
    handleRemovePromo,
  };
};
