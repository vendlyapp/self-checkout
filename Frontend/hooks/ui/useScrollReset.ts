"use client";

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import type { ScrollResetReturn } from '@/types';

/**
 * Hook para resetear scroll al cambiar de ruta
 * Optimizado específicamente para PWA iOS y Safari
 *
 * @returns ScrollResetReturn - Referencia del contenedor y función de reset
 *
 * @example
 * ```tsx
 * const { scrollContainerRef, resetScroll } = useScrollReset();
 *
 * return (
 *   <main ref={scrollContainerRef}>
 *     <button onClick={resetScroll}>Reset Scroll</button>
 *   </main>
 * );
 * ```
 */
// ScrollResetReturn interface moved to @/types

export const useScrollReset = (): ScrollResetReturn => {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const previousPathnameRef = useRef<string | undefined>(undefined);

  const scrollToTop = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToTopNative = () => {
      try {
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      } catch (error) {
        console.error('Scroll error:', error);
        container.scrollTop = 0;
        container.scrollLeft = 0;
      }
    };

    const performScroll = () => {
      requestAnimationFrame(() => {
        scrollToTopNative();

        requestAnimationFrame(() => {
          if (container.scrollTop > 0) {
            container.scrollTop = 0;
          }
        });
      });
    };

    performScroll();
  }, []);

  useEffect(() => {
    if (previousPathnameRef.current !== undefined &&
        previousPathnameRef.current !== pathname) {
      scrollToTop();
    }

    previousPathnameRef.current = pathname;
  }, [pathname, scrollToTop]);

  const resetScroll = useCallback(() => {
    scrollToTop();
  }, [scrollToTop]);

  return {
    scrollContainerRef,
    resetScroll
  };
};

/**
 * Hook simplificado para resetear scroll del window
 *
 * @param dependency - Dependencia que triggerea el reset (default: pathname)
 *
 * @example
 * ```tsx
 * // Reset automático al cambiar de ruta
 * useScrollToTop();
 *
 * // Reset cuando cambie una dependencia específica
 * useScrollToTop(searchQuery);
 * ```
 */
export const useScrollToTop = (dependency?: string) => {
  const pathname = usePathname();
  const targetDependency = dependency || pathname;

  useEffect(() => {
    const scrollToTop = () => {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
      } catch (error) {
        console.error('Window scroll error:', error);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    requestAnimationFrame(() => {
      scrollToTop();

      requestAnimationFrame(() => {
        if (window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
      });
    });
  }, [targetDependency]);
};
