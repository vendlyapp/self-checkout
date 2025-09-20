'use client';

import { useState, useEffect, useRef } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function useResponsive(): ResponsiveState {
  const [screenWidth, setScreenWidth] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Función para actualizar el tamaño de pantalla
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    // Establecer el tamaño inicial
    updateScreenWidth();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', updateScreenWidth);

    // Cleanup
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
