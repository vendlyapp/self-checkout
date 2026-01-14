'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'fullscreen' | 'inline';
export type LoaderColor = 'brand' | 'white' | 'gray';

interface LoaderProps {
  /** Tamaño del loader */
  size?: LoaderSize;
  /** Variante del loader: spinner, dots, fullscreen, inline */
  variant?: LoaderVariant;
  /** Color del loader */
  color?: LoaderColor;
  /** Mensaje a mostrar (solo para fullscreen) */
  message?: string;
  /** Icono adicional (solo para fullscreen) */
  icon?: LucideIcon;
  /** Clases CSS adicionales */
  className?: string;
  /** Si es fullscreen, mostrar fondo completo */
  fullScreen?: boolean;
}

const sizeClasses: Record<LoaderSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const borderSizeClasses: Record<LoaderSize, string> = {
  xs: 'border-[2px]',
  sm: 'border-[2.5px]',
  md: 'border-[3px]',
  lg: 'border-[3px]',
  xl: 'border-[4px]',
};

const colorClasses: Record<LoaderColor, {
  border: string;
  center: string;
  glow: string;
  text: string;
  dot: string;
}> = {
  brand: {
    border: 'border-t-[#25D076] border-r-[#25D076]',
    center: 'bg-[#25D076]',
    glow: 'bg-[#25D076]',
    text: 'text-gray-600',
    dot: 'bg-[#25D076]',
  },
  white: {
    border: 'border-t-white border-r-white',
    center: 'bg-white',
    glow: 'bg-white',
    text: 'text-white',
    dot: 'bg-white',
  },
  gray: {
    border: 'border-t-gray-500 border-r-gray-500',
    center: 'bg-gray-500',
    glow: 'bg-gray-500',
    text: 'text-gray-600',
    dot: 'bg-gray-500',
  },
};

/**
 * Componente de loader estandarizado, moderno y optimizado
 * 
 * @example
 * // Spinner simple inline
 * <Loader size="md" />
 * 
 * @example
 * // Dots inline
 * <Loader variant="dots" size="sm" />
 * 
 * @example
 * // Pantalla completa con mensaje
 * <Loader variant="fullscreen" message="Cargando..." />
 */
export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'brand',
  message,
  icon: Icon,
  className = '',
  fullScreen = false,
}) => {
  const selectedSize = sizeClasses[size];
  const selectedBorderSize = borderSizeClasses[size];
  const selectedColors = colorClasses[color];
  const dotSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  // Variante: Spinner (por defecto)
  const SpinnerContent = (
    <div className={`relative ${selectedSize} ${className}`}>
      {/* Glow effect - solo para tamaños medianos y grandes */}
      {(size === 'lg' || size === 'xl') && (
        <div 
          className={`absolute inset-0 rounded-full ${selectedColors.glow} opacity-10 blur-2xl animate-pulse`}
        />
      )}
      
      {/* Círculo exterior sutil */}
      <div 
        className={`absolute inset-0 rounded-full ${selectedBorderSize} ${
          size === 'xs' || size === 'sm' 
            ? 'border-gray-200' 
            : 'border-gray-100'
        }`}
      />
      
      {/* Círculo animado con gradiente */}
      <div 
        className={`absolute inset-0 rounded-full ${selectedBorderSize} border-transparent ${selectedColors.border} border-b-transparent animate-spin`}
        style={{
          animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          ...(size === 'lg' || size === 'xl' ? {
            filter: 'drop-shadow(0 0 8px rgba(37, 208, 118, 0.3))',
          } : {}),
        }}
      />
      
      {/* Punto central - solo para tamaños medianos y grandes */}
      {(size === 'md' || size === 'lg' || size === 'xl') && (
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${dotSize} ${selectedColors.center} rounded-full`}
        />
      )}
    </div>
  );

  // Variante: Dots
  const DotsContent = (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <div 
        className={`${dotSize} ${selectedColors.dot} rounded-full animate-bounce`}
        style={{ animationDelay: '0s', animationDuration: '1.2s' }}
      />
      <div 
        className={`${dotSize} ${selectedColors.dot} rounded-full animate-bounce`}
        style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}
      />
      <div 
        className={`${dotSize} ${selectedColors.dot} rounded-full animate-bounce`}
        style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}
      />
    </div>
  );

  // Variante: Fullscreen
  if (variant === 'fullscreen' || fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 z-[99999] safe-area-top safe-area-bottom">
        <div className="flex flex-col items-center justify-center space-y-6 px-4">
          {/* Icono opcional */}
          {Icon && (
            <div className="w-12 h-12 bg-gradient-to-br from-[#25D076] to-[#22c57f] rounded-xl flex items-center justify-center shadow-md shadow-[#25D076]/20">
              <Icon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
          )}
          
          {/* Spinner */}
          <div className="relative w-14 h-14">
            {/* Glow suave */}
            <div className={`absolute inset-0 rounded-full ${selectedColors.glow} opacity-10 blur-2xl animate-pulse`} />
            
            {/* Círculo exterior sutil */}
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
            
            {/* Círculo animado con gradiente verde elegante */}
            <div 
              className={`absolute inset-0 rounded-full border-[3px] border-transparent ${selectedColors.border} border-b-transparent animate-spin`}
              style={{
                animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                filter: 'drop-shadow(0 0 8px rgba(37, 208, 118, 0.3))',
              }}
            />
            
            {/* Punto central minimalista */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 ${selectedColors.center} rounded-full`} />
          </div>
          
          {/* Texto y dots */}
          {(message || variant === 'fullscreen') && (
            <div className="flex flex-col items-center space-y-3">
              {message && (
                <p className={`${selectedColors.text} font-light text-sm tracking-wide text-center max-w-xs`}>
                  {message}
                </p>
              )}
              {variant === 'fullscreen' && (
                <div className="flex items-center justify-center gap-1.5">
                  <div 
                    className={`w-1.5 h-1.5 ${selectedColors.dot} rounded-full animate-bounce`}
                    style={{ animationDelay: '0s', animationDuration: '1.2s' }}
                  />
                  <div 
                    className={`w-1.5 h-1.5 ${selectedColors.dot} rounded-full animate-bounce`}
                    style={{ animationDelay: '0.2s', animationDuration: '1.2s' }}
                  />
                  <div 
                    className={`w-1.5 h-1.5 ${selectedColors.dot} rounded-full animate-bounce`}
                    style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variante: Inline (spinner o dots según la prop)
  if (variant === 'inline') {
    return SpinnerContent;
  }

  // Variante: Dots
  if (variant === 'dots') {
    return DotsContent;
  }

  // Por defecto: Spinner
  return SpinnerContent;
};

// Exportar también como default para compatibilidad
export default Loader;

