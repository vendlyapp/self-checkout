import { useMemo } from 'react';

// Presets de smoothing más comunes
export const SQUIRCLE_PRESETS = {
  none: 0,
  subtle: 0.3,
  medium: 0.5,
  ios: 0.6,
  strong: 0.8,
  full: 1,
} as const;

export type SquirclePreset = keyof typeof SQUIRCLE_PRESETS;

interface UseSquircleOptions {
  preset?: SquirclePreset;
  customSmoothing?: number;
  scale?: number; // Factor de escala para smoothing anidado
}

interface SquircleValues {
  smoothing: number;
  scaledSmoothing: number;
  presetName: string;
  isDefault: boolean;
}

/**
 * Hook personalizado para manejar valores de squircle
 * 
 * @param options - Opciones de configuración
 * @returns Valores calculados para squircle
 * 
 * @example
 * ```tsx
 * const { smoothing, scaledSmoothing } = useSquircle({
 *   preset: 'ios',
 *   scale: 0.8
 * });
 * 
 * return (
 *   <Squircle smoothing={smoothing}>
 *     <Squircle smoothing={scaledSmoothing}>
 *       Contenido anidado
 *     </Squircle>
 *   </Squircle>
 * );
 * ```
 */
export const useSquircle = (options: UseSquircleOptions = {}): SquircleValues => {
  const {
    preset = 'ios',
    customSmoothing,
    scale = 0.8,
  } = options;

  const values = useMemo(() => {
    // Usar smoothing personalizado o preset
    const baseSmoothing = customSmoothing ?? SQUIRCLE_PRESETS[preset];
    
    // Clamp entre 0 y 1
    const clampedSmoothing = Math.max(0, Math.min(1, baseSmoothing));
    
    // Smoothing escalado para elementos anidados
    const scaledSmoothing = clampedSmoothing * scale;
    
    return {
      smoothing: clampedSmoothing,
      scaledSmoothing,
      presetName: preset,
      isDefault: preset === 'ios' && !customSmoothing,
    };
  }, [preset, customSmoothing, scale]);

  return values;
};

/**
 * Utilidad para generar clases CSS con squircle
 * 
 * @param preset - Preset de smoothing a usar
 * @returns Clase CSS correspondiente
 */
export const getSquircleClass = (preset: SquirclePreset = 'ios'): string => {
  return `squircle-${preset}`;
};

/**
 * Utilidad para validar valores de smoothing
 * 
 * @param smoothing - Valor a validar
 * @returns Valor clamped entre 0 y 1
 */
export const clampSmoothing = (smoothing: number): number => {
  return Math.max(0, Math.min(1, smoothing));
};

/**
 * Utilidad para convertir smoothing a porcentaje
 * 
 * @param smoothing - Valor de smoothing (0-1)
 * @returns Porcentaje como string
 */
export const smoothingToPercentage = (smoothing: number): string => {
  return `${Math.round(clampSmoothing(smoothing) * 100)}%`;
};

export default useSquircle; 