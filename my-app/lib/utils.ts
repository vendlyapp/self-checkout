import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio según las convenciones suizas
 * @param price - Precio en número (ej: 5.45, 5.0, 5)
 * @returns Precio formateado (ej: "5.45", "5.–", "5")
 *
 * Ejemplos:
 * - formatSwissPrice(5.45) → "5.45"
 * - formatSwissPrice(5.00) → "5.–"
 * - formatSwissPrice(5.0) → "5.–"
 * - formatSwissPrice(5) → "5.–"
 * - formatSwissPrice(0) → "0"
 */
export function formatSwissPrice(price: number): string {
  // Si el precio es 0, mostrar "0"
  if (price === 0) return "0"

  // Si no tiene decimales (es un entero)
  if (Number.isInteger(price)) {
    return `${price}.–`
  }

  // Si tiene decimales, verificar si son .00, .0, etc.
  const [integerPart, decimalPart] = price.toString().split('.')

  // Si los decimales son solo ceros (ej: 5.00, 5.0)
  if (decimalPart === '00' || decimalPart === '0') {
    return `${integerPart}.–`
  }

  // Si tiene decimales reales (ej: 5.45)
  if (decimalPart && decimalPart !== '00' && decimalPart !== '0') {
    // Asegurar que siempre tenga 2 decimales
    return price.toFixed(2)
  }

  // Para casos como 5. (que debería ser 5.–)
  if (decimalPart === '') {
    return `${integerPart}.–`
  }

  // Por defecto, mostrar con 2 decimales
  return price.toFixed(2)
}

/**
 * Formatea un precio suizo con el símbolo CHF
 * @param price - Precio en número
 * @returns Precio formateado con CHF (ej: "CHF 5.45", "CHF 5.–", "CHF 5")
 *
 * Ejemplos:
 * - formatSwissPriceWithCHF(5.45) → "CHF 5.45"
 * - formatSwissPriceWithCHF(5.00) → "CHF 5.–"
 * - formatSwissPriceWithCHF(5.0) → "CHF 5.–"
 * - formatSwissPriceWithCHF(5) → "CHF 5.–"
 * - formatSwissPriceWithCHF(0) → "CHF 0"
 */
export function formatSwissPriceWithCHF(price: number): string {
  const formattedPrice = formatSwissPrice(price)

  // Si es un precio redondo (sin decimales), usar .–
  if (Number.isInteger(price)) {
    return `${price}.–`
  }

  // Si tiene decimales reales, mostrar normalmente
  if (price % 1 !== 0) {
    return `${formattedPrice}`
  }

  // Para precios redondos, usar .–
  return `${price}.–`
}

// Export haptic feedback utilities
export * from './utils/hapticFeedback';

// Export visual feedback utilities
export * from './utils/visualFeedback';
