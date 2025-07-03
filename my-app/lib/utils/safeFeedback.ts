/**
 * Safe Feedback Utility
 * 
 * Una solución simple que combina haptic feedback y visual feedback
 * para máxima compatibilidad con Chrome y otros navegadores.
 */

interface FeedbackOptions {
  type?: 'light' | 'medium' | 'strong' | 'success' | 'error';
  element?: HTMLElement | null;
}

/**
 * Proporcionar feedback táctil y visual de manera segura
 */
export const safeFeedback = (options: FeedbackOptions = {}): void => {
  const { type = 'light', element } = options;
  
  // Intentar vibración háptica directamente si estamos en el cliente
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      const patterns = {
        light: 10,
        medium: 50,
        strong: [50, 50, 50],
        success: [20, 50, 20],
        error: [50, 100, 50, 100, 50]
      };
      
      // Intentar vibración - fallará silenciosamente si no hay user activation
      navigator.vibrate(patterns[type]);
    } catch (error) {
      // Vibración falló, continuar con visual feedback
    }
  }
  
  // SIEMPRE proporcionar feedback visual como respaldo/suplemento
  if (typeof window !== 'undefined' && document) {
    try {
      let targetElement = element;
      
      // Si no hay elemento específico, usar el elemento activo
      if (!targetElement) {
        targetElement = document.activeElement as HTMLElement;
        if (!targetElement || targetElement === document.body) {
          // Usar todo el viewport como último recurso
          targetElement = document.documentElement;
        }
      }
      
      if (targetElement) {
        const animationClass = `animate-pulse-${type}`;
        
        // Agregar clase de animación
        targetElement.classList.add(animationClass);
        
        // Remover después de la animación
        const duration = type === 'error' ? 300 : type === 'success' ? 300 : 200;
        setTimeout(() => {
          targetElement?.classList.remove(animationClass);
        }, duration);
      }
    } catch (error) {
      console.warn('Visual feedback failed:', error);
    }
  }
};

// Funciones de conveniencia
export const lightFeedback = (element?: HTMLElement | null) => 
  safeFeedback({ type: 'light', element });

export const mediumFeedback = (element?: HTMLElement | null) => 
  safeFeedback({ type: 'medium', element });

export const strongFeedback = (element?: HTMLElement | null) => 
  safeFeedback({ type: 'strong', element });

export const successFeedback = (element?: HTMLElement | null) => 
  safeFeedback({ type: 'success', element });

export const errorFeedback = (element?: HTMLElement | null) => 
  safeFeedback({ type: 'error', element }); 