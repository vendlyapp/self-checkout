import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio según las convenciones suizas
 * @param price - Precio en número o string (ej: 5.45, 5.0, 5, "5.45")
 * @returns Precio formateado (ej: "5.45", "5.–", "5")
 *
 * Ejemplos:
 * - formatSwissPrice(5.45) → "5.45"
 * - formatSwissPrice(5.00) → "5.–"
 * - formatSwissPrice(5.0) → "5.–"
 * - formatSwissPrice(5) → "5.–"
 * - formatSwissPrice(0) → "0"
 */
export function formatSwissPrice(price: number | string | null | undefined): string {
  // Convertir a número si es string, null o undefined
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  
  // Validar que sea un número válido
  if (isNaN(numPrice)) {
    return "0"
  }

  // Si el precio es 0, mostrar "0"
  if (numPrice === 0) return "0"

  // Si no tiene decimales (es un entero)
  if (Number.isInteger(numPrice)) {
    return `${numPrice}.–`
  }

  // Si tiene decimales, verificar si son .00, .0, etc.
  const [integerPart, decimalPart] = numPrice.toString().split('.')

  // Si los decimales son solo ceros (ej: 5.00, 5.0)
  if (decimalPart === '00' || decimalPart === '0') {
    return `${integerPart}.–`
  }

  // Si tiene decimales reales (ej: 5.45)
  if (decimalPart && decimalPart !== '00' && decimalPart !== '0') {
    // Asegurar que siempre tenga 2 decimales
    return numPrice.toFixed(2)
  }

  // Para casos como 5. (que debería ser 5.–)
  if (decimalPart === '') {
    return `${integerPart}.–`
  }

  // Por defecto, mostrar con 2 decimales
  return numPrice.toFixed(2)
}

/**
 * Formatea un precio suizo con el símbolo CHF
 * @param price - Precio en número o string
 * @returns Precio formateado con CHF (ej: "CHF 5.45", "CHF 5.–", "CHF 5")
 *
 * Ejemplos:
 * - formatSwissPriceWithCHF(5.45) → "CHF 5.45"
 * - formatSwissPriceWithCHF(5.00) → "CHF 5.–"
 * - formatSwissPriceWithCHF(5.0) → "CHF 5.–"
 * - formatSwissPriceWithCHF(5) → "CHF 5.–"
 * - formatSwissPriceWithCHF(0) → "CHF 0"
 */
export function formatSwissPriceWithCHF(price: number | string | null | undefined): string {
  // Convertir a número si es string, null o undefined
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  
  // Validar que sea un número válido
  if (isNaN(numPrice)) {
    return "CHF 0"
  }

  const formattedPrice = formatSwissPrice(numPrice)

  // Si es un precio redondo (sin decimales), usar .–
  if (Number.isInteger(numPrice)) {
    return `CHF ${numPrice}.–`
  }

  // Si tiene decimales reales, mostrar normalmente
  if (numPrice % 1 !== 0) {
    return `CHF ${formattedPrice}`
  }

  // Para precios redondos, usar .–
  return `CHF ${numPrice}.–`
}

// Export haptic feedback utilities
export * from './utils/hapticFeedback';

// Export visual feedback utilities
export * from './utils/visualFeedback';
