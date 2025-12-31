import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";
// Removido useMyStore - no se necesita autenticación en vista de usuario
import type { PromoCodeReturn } from "@/types";
import { discountCodeService, type DiscountCode } from "@/lib/services/discountCodeService";

/**
 * Hook para gestión avanzada de códigos promocionales
 * Incluye cálculos de totales y limpieza automática
 * Ahora usa códigos reales de la base de datos
 *
 * @returns PromoCodeReturn - Estado completo de promociones con cálculos
 *
 * @example
 * ```tsx
 * const {
 *   promoCode,
 *   setPromoCode,
 *   promoApplied,
 *   discountAmount,
 *   promoError,
 *   subtotal,
 *   total,
 *   handleApplyPromo,
 *   handleRemovePromo,
 * } = usePromoCode();
 *
 * return (
 *   <div>
 *     <p>Subtotal: {subtotal}</p>
 *     <p>Descuento: {discountAmount}</p>
 *     <p>Total: {total}</p>
 *   </div>
 * );
 * ```
 */
// PromoCodeReturn interface moved to @/types

export const usePromoCode = (): PromoCodeReturn => {
  const { getSubtotal, applyPromoCode, removePromoCode } = useCartStore();
  const { store: scannedStore } = useScannedStoreStore();
  // No usar useMyStore en vista de usuario - solo usar scannedStore que no requiere autenticación
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [validatedCode, setValidatedCode] = useState<DiscountCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const subtotal = getSubtotal();
  const total = +(subtotal - discountAmount).toFixed(2);

  const handleApplyPromo = async () => {
    const codeToValidate = promoCode.trim().toUpperCase();
    
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
      
      // Calcular descuento según el tipo
      let discount = 0;
      if (validated.discount_type === 'percentage') {
        discount = +(subtotal * (validated.discount_value / 100)).toFixed(2);
      } else if (validated.discount_type === 'fixed') {
        discount = Math.min(validated.discount_value, subtotal); // No puede exceder el subtotal
      }

      setDiscountAmount(discount);
      setPromoApplied(true);
      setValidatedCode(validated);
      
      // Aplicar en el store del carrito también con el descuento calculado
      applyPromoCode(codeToValidate, discount);
      
      setPromoError("");
    } catch (error) {
      setPromoApplied(false);
      setDiscountAmount(0);
      setValidatedCode(null);
      
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
    setPromoApplied(false);
    setDiscountAmount(0);
    setPromoCode("");
    setValidatedCode(null);
    removePromoCode();
  };

  // Limpiar promociones cuando el carrito esté vacío
  useEffect(() => {
    if (subtotal === 0) {
      handleRemovePromo();
    }
  }, [subtotal]);

  // Recalcular descuento si el subtotal cambia y hay un código aplicado
  useEffect(() => {
    if (promoApplied && validatedCode && subtotal > 0) {
      let discount = 0;
      if (validatedCode.discount_type === 'percentage') {
        discount = +(subtotal * (validatedCode.discount_value / 100)).toFixed(2);
      } else if (validatedCode.discount_type === 'fixed') {
        discount = Math.min(validatedCode.discount_value, subtotal);
      }
      setDiscountAmount(discount);
    }
  }, [subtotal, promoApplied, validatedCode]);

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
