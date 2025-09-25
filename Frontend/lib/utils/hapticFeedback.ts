/**
 * Haptic Feedback Utility
 * 
 * Proporciona vibración háptica segura respetando las políticas del navegador.
 * Solo funciona después de interacciones del usuario válidas (click, tap, touch).
 */

interface HapticOptions {
  pattern?: number | number[];
  fallback?: () => void;
  force?: boolean;
}

class HapticFeedbackManager {
  private hasUserInteracted = false;
  private isSupported = false;
  private isInitialized = false;
  private isClient = false;

  constructor() {
    // Verificar si estamos en el cliente
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      // Verificar soporte del navegador solo en el cliente
      this.isSupported = 'vibrate' in navigator;
    }
  }

  /**
   * Detecta la primera interacción del usuario para habilitar haptic feedback
   * Solo se ejecuta en el cliente después de la hidratación
   */
  private initializeUserInteractionDetection() {
    // Solo inicializar en el cliente
    if (!this.isClient || this.isInitialized) return;

    const markUserInteraction = () => {
      this.hasUserInteracted = true;
      // Remover listeners después de la primera interacción
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', markUserInteraction, true);
        document.removeEventListener('touchstart', markUserInteraction, true);
        document.removeEventListener('keydown', markUserInteraction, true);
      }
    };

    // Escuchar eventos de interacción del usuario solo en el cliente
    if (typeof document !== 'undefined') {
      document.addEventListener('click', markUserInteraction, true);
      document.addEventListener('touchstart', markUserInteraction, true);
      document.addEventListener('keydown', markUserInteraction, true);
      this.isInitialized = true;
    }
  }

  /**
   * Ejecuta vibración háptica si es seguro hacerlo
   */
  public vibrate(options: HapticOptions = {}): boolean {
    const { pattern = 10, fallback } = options;

    // Inicializar lazy si no se ha hecho
    if (!this.isInitialized) {
      this.initializeUserInteractionDetection();
    }

    // Verificaciones de seguridad
    if (!this.isClient || !this.isSupported) {
      if (fallback) fallback();
      return false;
    }

    // Marcar como interactuado si se está llamando (asumimos que es por interacción válida)
    if (!this.hasUserInteracted) {
      this.hasUserInteracted = true;
    }

    try {
      // Ejecutar vibración solo si navigator está disponible
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const success = navigator.vibrate(pattern);
        
        if (!success && fallback) {
          fallback();
        }
        
        return success;
      } else {
        if (fallback) fallback();
        return false;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      if (fallback) fallback();
      return false;
    }
  }

  /**
   * Vibración suave para feedback de botones
   */
  public lightTap(): boolean {
    return this.vibrate({ pattern: 10 });
  }

  /**
   * Vibración media para confirmaciones
   */
  public mediumTap(): boolean {
    return this.vibrate({ pattern: 50 });
  }

  /**
   * Vibración fuerte para errores o alertas
   */
  public strongTap(): boolean {
    return this.vibrate({ pattern: [50, 50, 50] });
  }

  /**
   * Vibración de éxito (dos toques cortos)
   */
  public successPattern(): boolean {
    return this.vibrate({ pattern: [20, 50, 20] });
  }

  /**
   * Vibración de error (tres toques)
   */
  public errorPattern(): boolean {
    return this.vibrate({ pattern: [50, 100, 50, 100, 50] });
  }

  /**
   * Verificar si el usuario ha interactuado
   */
  public hasInteracted(): boolean {
    return this.hasUserInteracted;
  }

  /**
   * Verificar soporte de vibración
   */
  public isHapticSupported(): boolean {
    return this.isClient && this.isSupported;
  }

  /**
   * Forzar marca de interacción (usar con cuidado)
   */
  public markAsInteracted(): void {
    this.hasUserInteracted = true;
  }

  /**
   * Manejar evento de interacción y ejecutar vibración
   * Esta función debe llamarse en event handlers
   */
  public handleInteractionAndVibrate(options: HapticOptions = {}): boolean {
    // Marcar como interactuado inmediatamente
    this.hasUserInteracted = true;
    
    // Verificar que estemos en el cliente
    if (!this.isClient || !this.isSupported) {
      if (options.fallback) options.fallback();
      return false;
    }

    try {
      // Ejecutar vibración directamente - Chrome debe permitirlo si viene de evento válido
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const pattern = options.pattern || 10;
        const success = navigator.vibrate(pattern);
        
        if (!success && options.fallback) {
          options.fallback();
        }
        
        return success;
      } else {
        if (options.fallback) options.fallback();
        return false;
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      if (options.fallback) options.fallback();
      return false;
    }
  }
}

// Instancia singleton
const hapticFeedback = new HapticFeedbackManager();

// Exports para uso fácil
export default hapticFeedback;

// Funciones de conveniencia
export const vibrate = (pattern?: number | number[]) => 
  hapticFeedback.vibrate({ pattern });

// Funciones con fallback visual
export const lightHaptic = () => {
  const success = hapticFeedback.handleInteractionAndVibrate({ 
    pattern: 10,
    fallback: () => {
      // Fallback a feedback visual
      import('./visualFeedback').then(({ lightPulse }) => {
        lightPulse();
      }).catch(() => {});
    }
  });
  return success;
};

export const mediumHaptic = () => {
  const success = hapticFeedback.handleInteractionAndVibrate({ 
    pattern: 50,
    fallback: () => {
      import('./visualFeedback').then(({ mediumPulse }) => {
        mediumPulse();
      }).catch(() => {});
    }
  });
  return success;
};

export const strongHaptic = () => {
  const success = hapticFeedback.handleInteractionAndVibrate({ 
    pattern: [50, 50, 50],
    fallback: () => {
      import('./visualFeedback').then(({ strongPulse }) => {
        strongPulse();
      }).catch(() => {});
    }
  });
  return success;
};

export const successHaptic = () => {
  const success = hapticFeedback.handleInteractionAndVibrate({ 
    pattern: [20, 50, 20],
    fallback: () => {
      import('./visualFeedback').then(({ successFlash }) => {
        successFlash();
      }).catch(() => {});
    }
  });
  return success;
};

export const errorHaptic = () => {
  const success = hapticFeedback.handleInteractionAndVibrate({ 
    pattern: [50, 100, 50, 100, 50],
    fallback: () => {
      import('./visualFeedback').then(({ errorFlash }) => {
        errorFlash();
      }).catch(() => {});
    }
  });
  return success;
};

// Verificadores
export const hasUserInteracted = () => hapticFeedback.hasInteracted();
export const isHapticSupported = () => hapticFeedback.isHapticSupported();

// Verificar si estamos en el cliente (útil para componentes)
export const isClient = () => typeof window !== 'undefined'; 