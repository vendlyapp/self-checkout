import { useState } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
// Removido useMyStore - no se necesita autenticación en vista de usuario
import type { PromoLogicReturn } from "@/types";
import { discountCodeService, type DiscountCode } from "@/lib/services/discountCodeService";

/**
 * Hook centralizado para lógica de códigos promocionales
 * Maneja la aplicación y remoción de códigos de descuento
 * Ahora usa códigos reales de la base de datos
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
  const { promoCode, promoApplied, discountAmount, applyPromoCode, removePromoCode, getSubtotal } = useCartStore();
  const { store: scannedStore } = useScannedStoreStore();
  // No usar useMyStore en vista de usuario - solo usar scannedStore que no requiere autenticación
  const [promoError, setPromoError] = useState("");
  const [localPromoCode, setLocalPromoCode] = useState(promoCode);
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyPromo = async () => {
    const codeToValidate = localPromoCode.trim().toUpperCase();
    
    if (!codeToValidate) {
      setPromoError("Bitte geben Sie einen Code ein.");
      return;
    }

    setIsValidating(true);
    setPromoError("");

    try {
      // Obtener storeId solo del store escaneado (no requiere autenticación)
      const storeId = scannedStore?.id;
      
      // Validar código desde la base de datos con storeId
      const validated = await discountCodeService.validateCode(codeToValidate, storeId || undefined);
      
      // Verificar que el código no haya alcanzado el límite de usos
      if (validated.current_redemptions >= validated.max_redemptions) {
        throw new Error('Este código de descuento ha alcanzado su límite de usos');
      }
      
      // Verificar que el código esté activo
      if (!validated.is_active || validated.status !== 'active') {
        throw new Error('Este código de descuento no está activo');
      }
      
      const subtotal = getSubtotal();
      
      // Calcular descuento según el tipo
      let discount = 0;
      if (validated.discount_type === 'percentage') {
        discount = +(subtotal * (validated.discount_value / 100)).toFixed(2);
      } else if (validated.discount_type === 'fixed') {
        discount = Math.min(validated.discount_value, subtotal); // No puede exceder el subtotal
      }

      // Aplicar en el store del carrito con el descuento calculado
      applyPromoCode(codeToValidate, discount);
      setPromoError("");
    } catch (error) {
      // Mensaje de error amigable
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Der Code existiert nicht oder ist ungültig.";
      
      // Traducir algunos errores comunes
      if (errorMessage.includes('no encontrado') || errorMessage.includes('inválido')) {
        setPromoError("Der Code existiert nicht oder ist ungültig.");
      } else if (errorMessage.includes('no está activo') || errorMessage.includes('expirado') || errorMessage.includes('nicht aktiv')) {
        setPromoError("Der Code ist nicht aktiv oder abgelaufen.");
      } else if (errorMessage.includes('límite de usos') || errorMessage.includes('alcanzado su límite')) {
        setPromoError("Dieser Code hat sein Nutzungslimit erreicht.");
      } else {
        setPromoError(errorMessage);
      }
    } finally {
      setIsValidating(false);
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
