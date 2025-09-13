"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook personalizado para resetear scroll al cambiar de ruta
 * Optimizado específicamente para PWA iOS y Safari
 */
export const useScrollReset = () => {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const previousPathnameRef = useRef<string | undefined>(undefined);

  const scrollToTop = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Método 1: Scroll nativo optimizado para iOS
    const scrollToTopNative = () => {
      try {
        // Para iOS Safari - usar scrollTo con options para mejor control
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto' // 'auto' es más rápido que 'smooth' para navegación
        });
      } catch (error) {
        // Fallback para navegadores más antiguos
        container.scrollTop = 0;
        container.scrollLeft = 0;
      }
    };

    // Método 2: Usando requestAnimationFrame para mejor rendimiento
    const performScroll = () => {
      requestAnimationFrame(() => {
        scrollToTopNative();

        // Double-check para iOS (a veces necesita un segundo intento)
        requestAnimationFrame(() => {
          if (container.scrollTop > 0) {
            container.scrollTop = 0;
          }
        });
      });
    };

    // Ejecutar scroll inmediatamente para navegación rápida
    performScroll();
  }, []);

  // Efecto principal para detectar cambios de ruta
  useEffect(() => {
    // Solo ejecutar si realmente cambió la ruta (evitar re-renders innecesarios)
    if (previousPathnameRef.current !== undefined &&
        previousPathnameRef.current !== pathname) {
      scrollToTop();
    }

    previousPathnameRef.current = pathname;
  }, [pathname, scrollToTop]);

  // Método manual para casos especiales
  const resetScroll = useCallback(() => {
    scrollToTop();
  }, [scrollToTop]);

  return {
    scrollContainerRef,
    resetScroll
  };
};

/**
 * Hook simplificado para casos donde solo necesitas resetear scroll
 */
export const useScrollToTop = (dependency?: string) => {
  const pathname = usePathname();
  const targetDependency = dependency || pathname;

  useEffect(() => {
    // Scroll del elemento raíz (body/html)
    const scrollToTop = () => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      } catch (error) {
        // Fallback
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    // Usar requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      scrollToTop();

      // Double-check para iOS
      requestAnimationFrame(() => {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
      });
    });
  }, [targetDependency]);
};
