'use client';

import { useState, useEffect, useRef } from 'react';
import type { ResponsiveState } from '@/types';

/**
 * Hook para manejo de responsive design y breakpoints
 *
 * @returns ResponsiveState - Estado de responsive con breakpoints y controles
 *
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, screenWidth, isCollapsed, setIsCollapsed } = useResponsive();
 *
 * return (
 *   <div>
 *     {isMobile && <MobileComponent />}
 *     {isTablet && <TabletComponent />}
 *     {isDesktop && <DesktopComponent />}
 *   </div>
 * );
 * ```
 */
// ResponsiveState interface moved to @/types

export function useResponsive(): ResponsiveState {
  const [screenWidth, setScreenWidth] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);

    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Calcular breakpoints
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  // Auto-colapsar sidebar en móvil solo en la inicialización
  useEffect(() => {
    if (!hasInitialized.current && screenWidth > 0) {
      hasInitialized.current = true;
      if (isMobile) {
        setIsCollapsed(true);
      }
    }
  }, [isMobile, screenWidth]);

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    isCollapsed,
    setIsCollapsed,
  };
}
