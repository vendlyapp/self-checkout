/**
 * Visual Feedback Utility
 * 
 * Proporciona feedback visual cuando haptic feedback no está disponible
 * o falla debido a políticas del navegador.
 */

export interface VisualFeedbackOptions {
  type?: 'light' | 'medium' | 'strong' | 'success' | 'error';
  element?: HTMLElement;
  duration?: number;
}

class VisualFeedbackManager {
  private isClient = false;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Crear efecto de pulso en un elemento
   */
  public pulse(options: VisualFeedbackOptions = {}): boolean {
    if (!this.isClient) return false;

    const { type = 'light', element, duration = 150 } = options;
    
    let targetElement = element;
    
    // Si no se proporciona elemento, usar el que está en foco o documento
    if (!targetElement) {
      targetElement = document.activeElement as HTMLElement;
      if (!targetElement || targetElement === document.body) {
        return false;
      }
    }

    try {
      // Agregar clase de animación
      const pulseClass = this.getPulseClass(type);
      targetElement.classList.add(pulseClass);
      
      // Remover después de la duración
      setTimeout(() => {
        targetElement.classList.remove(pulseClass);
      }, duration);
      
      return true;
    } catch (error) {
      console.warn('Visual feedback failed:', error);
      return false;
    }
  }

  /**
   * Crear efecto de flash en pantalla
   */
  public screenFlash(options: VisualFeedbackOptions = {}): boolean {
    if (!this.isClient) return false;

    const { type = 'light', duration = 100 } = options;
    
    try {
      // Crear overlay temporal
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity ${duration}ms ease-out;
        ${this.getFlashStyle(type)}
      `;
      
      document.body.appendChild(overlay);
      
      // Trigger flash
      requestAnimationFrame(() => {
        overlay.style.opacity = '0.3';
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, duration);
        }, 50);
      });
      
      return true;
    } catch (error) {
      console.warn('Screen flash failed:', error);
      return false;
    }
  }

  /**
   * Obtener clase CSS para efecto de pulso
   */
  private getPulseClass(type: string): string {
    switch (type) {
      case 'light':
        return 'animate-pulse-light';
      case 'medium':
        return 'animate-pulse-medium';
      case 'strong':
        return 'animate-pulse-strong';
      case 'success':
        return 'animate-pulse-success';
      case 'error':
        return 'animate-pulse-error';
      default:
        return 'animate-pulse-light';
    }
  }

  /**
   * Obtener estilo CSS para flash de pantalla
   */
  private getFlashStyle(type: string): string {
    switch (type) {
      case 'light':
        return 'background-color: rgba(255, 255, 255, 0.5);';
      case 'medium':
        return 'background-color: rgba(34, 197, 94, 0.3);'; // Verde primario
      case 'strong':
        return 'background-color: rgba(34, 197, 94, 0.5);';
      case 'success':
        return 'background-color: rgba(16, 185, 129, 0.4);'; // Verde éxito
      case 'error':
        return 'background-color: rgba(239, 68, 68, 0.4);'; // Rojo error
      default:
        return 'background-color: rgba(255, 255, 255, 0.3);';
    }
  }
}

// Instancia singleton
const visualFeedback = new VisualFeedbackManager();

// Exports
export default visualFeedback;

// Funciones de conveniencia
export const lightPulse = (element?: HTMLElement) => 
  visualFeedback.pulse({ type: 'light', element });

export const mediumPulse = (element?: HTMLElement) => 
  visualFeedback.pulse({ type: 'medium', element });

export const strongPulse = (element?: HTMLElement) => 
  visualFeedback.pulse({ type: 'strong', element });

export const successPulse = (element?: HTMLElement) => 
  visualFeedback.pulse({ type: 'success', element });

export const errorPulse = (element?: HTMLElement) => 
  visualFeedback.pulse({ type: 'error', element });

// Flash effects
export const lightFlash = () => visualFeedback.screenFlash({ type: 'light' });
export const successFlash = () => visualFeedback.screenFlash({ type: 'success' });
export const errorFlash = () => visualFeedback.screenFlash({ type: 'error' }); 