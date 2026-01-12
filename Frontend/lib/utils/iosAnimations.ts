/**
 * Utilidades para animaciones nativas tipo iOS
 * Proporciona funciones helper y constantes para transiciones suaves
 */

// Curvas de animación tipo iOS
export const iOS_EASING = {
  // Easing estándar de iOS (suave y natural)
  standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  // Easing para elementos que entran (más dramático)
  enter: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  // Easing para elementos que salen (más rápido)
  exit: 'cubic-bezier(0.4, 0.0, 1, 1)',
  // Easing para elementos que rebotan (spring-like)
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // Easing para interacciones táctiles (rápido y responsivo)
  touch: 'cubic-bezier(0.2, 0.0, 0, 1)',
} as const;

// Duraciones estándar de iOS
export const iOS_DURATION = {
  fast: 150,      // Micro-interacciones (botones, toques)
  normal: 250,    // Transiciones estándar
  slow: 350,      // Transiciones de página
  spring: 400,    // Animaciones con rebote
} as const;

/**
 * Genera un estilo de transición para animaciones iOS
 */
export const getTransitionStyle = (
  properties: string[],
  duration: number = iOS_DURATION.normal,
  easing: string = iOS_EASING.standard
): string => {
  return properties
    .map(prop => `${prop} ${duration}ms ${easing}`)
    .join(', ');
};

/**
 * Genera un delay escalonado para animaciones en lista (stagger)
 */
export const getStaggerDelay = (index: number, baseDelay: number = 50): number => {
  return index * baseDelay;
};

/**
 * Clases CSS para animaciones comunes
 */
export const IOS_ANIMATION_CLASSES = {
  // Fade in
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  
  // Slide in/out
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  slideOutRight: 'animate-slide-out-right',
  slideOutLeft: 'animate-slide-out-left',
  slideOutUp: 'animate-slide-out-up',
  slideOutDown: 'animate-slide-out-down',
  
  // Scale
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  
  // Spring bounce
  springBounce: 'animate-spring-bounce',
} as const;

/**
 * Hook para animaciones de entrada escalonadas (stagger)
 */
export const useStaggerAnimation = (
  itemsCount: number,
  baseDelay: number = 50
) => {
  const getItemStyle = (index: number) => ({
    animationDelay: `${getStaggerDelay(index, baseDelay)}ms`,
  });
  
  return { getItemStyle };
};

/**
 * Genera estilos inline para transiciones suaves
 */
export const createTransition = (
  properties: string | string[],
  duration?: number,
  easing?: string
): React.CSSProperties => {
  const props = Array.isArray(properties) ? properties : [properties];
  return {
    transition: getTransitionStyle(
      props,
      duration || iOS_DURATION.normal,
      easing || iOS_EASING.standard
    ),
  };
};

/**
 * Utilidad para detectar si el dispositivo soporta animaciones reducidas
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

