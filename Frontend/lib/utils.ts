import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un precio según las convenciones suizas (formato visual para usuarios)
 * @param price - Precio en número o string (ej: 5.45, 5.0, 5, "5.45")
 * @returns Precio formateado (ej: "5.45", "5.–", "0.–")
 *
 * Formato visual para usuario:
 * - formatSwissPrice(5.45) → "5.45"
 * - formatSwissPrice(5.00) → "5.–"
 * - formatSwissPrice(5.0) → "5.–"
 * - formatSwissPrice(5) → "5.–"
 * - formatSwissPrice(0) → "0.–"
 */
export function formatSwissPrice(price: number | string | null | undefined): string {
  // Convertir a número si es string, null o undefined
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  
  // Validar que sea un número válido
  if (isNaN(numPrice)) {
    return "0.–"
  }

  // Si el precio es 0, mostrar "0.–"
  if (numPrice === 0) return "0.–"

  // Verificar si tiene decimales reales (no .00)
  const rounded = Math.round(numPrice * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;

  // Si no tiene decimales o son .00, mostrar con .–
  if (!hasDecimals) {
    return `${Math.round(rounded)}.–`
  }

  // Si tiene decimales reales, mostrar con 2 decimales
  return rounded.toFixed(2)
}

/**
 * Formatea un precio suizo con el símbolo CHF (formato visual para usuarios)
 * @param price - Precio en número o string
 * @returns Precio formateado con CHF (ej: "CHF 5.45", "CHF 5.–")
 *
 * Ejemplos:
 * - formatSwissPriceWithCHF(5.45) → "CHF 5.45"
 * - formatSwissPriceWithCHF(5.00) → "CHF 5.–"
 * - formatSwissPriceWithCHF(5.0) → "CHF 5.–"
 * - formatSwissPriceWithCHF(5) → "CHF 5.–"
 * - formatSwissPriceWithCHF(0) → "CHF 0.–"
 */
export function formatSwissPriceWithCHF(price: number | string | null | undefined): string {
  const formattedPrice = formatSwissPrice(price);
  return `CHF ${formattedPrice}`;
}

/**
 * Formatea un precio suizo para sistema/contabilidad (siempre con .00)
 * @param price - Precio en número o string
 * @returns Precio formateado con 2 decimales (ej: "5.45", "5.00", "0.00")
 *
 * Formato para configuración y contabilidad del sistema:
 * - formatSwissPriceForSystem(5.45) → "5.45"
 * - formatSwissPriceForSystem(5.00) → "5.00"
 * - formatSwissPriceForSystem(5) → "5.00"
 * - formatSwissPriceForSystem(0) → "0.00"
 */
export function formatSwissPriceForSystem(price: number | string | null | undefined): string {
  // Convertir a número si es string, null o undefined
  const numPrice = typeof price === 'string' ? parseFloat(price) : (price ?? 0);
  
  // Validar que sea un número válido
  if (isNaN(numPrice)) {
    return "0.00"
  }

  // Siempre mostrar con 2 decimales para sistema/contabilidad
  return numPrice.toFixed(2)
}

// Export haptic feedback utilities
export * from './utils/hapticFeedback';

// Export visual feedback utilities
export * from './utils/visualFeedback';
