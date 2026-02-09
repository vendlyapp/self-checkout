import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Fecha local YYYY-MM-DD (para APIs y filtros; evita desfase por UTC) */
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Formatea la fecha y hora real de la orden/transacción para la UI.
 * Usa la zona horaria y el formato del usuario (ubicación del dispositivo),
 * no una zona fija: es la hora en que se hizo la transacción, mostrada en hora local.
 * Formato compacto: fecha corta + hora (ej. "3. Feb 2025, 14:30" o según locale del usuario).
 */
export function formatOrderDateTime(createdAt: string | Date): string {
  const d = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
  if (Number.isNaN(d.getTime())) return '–'
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
