'use client';

import React from 'react';

interface InitialLoadingScreenProps {
  message?: string;
}

/**
 * Pantalla de carga inicial con fondo verde y tres puntos animados
 * Reutiliza el diseño del AuthGuard para mantener consistencia
 */
const InitialLoadingScreen: React.FC<InitialLoadingScreenProps> = ({ 
  message = "Cargando..." 
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 z-[99999]">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Spinner minimalista y elegante */}
        <div className="relative w-14 h-14">
          {/* Glow suave */}
          <div className="absolute inset-0 rounded-full bg-[#25d076] opacity-10 blur-2xl animate-pulse"></div>
          
          {/* Círculo exterior sutil */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100"></div>
          
          {/* Círculo animado con gradiente verde elegante */}
          <div 
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#25d076] border-r-[#25d076] border-b-transparent animate-spin"
            style={{ 
              animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              filter: 'drop-shadow(0 0 8px rgba(37, 208, 118, 0.3))'
            }}
          ></div>
          
          {/* Punto central minimalista */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#25d076] rounded-full"></div>
        </div>
        
        {/* Texto elegante */}
        <div className="flex flex-col items-center space-y-3">
          <p className="text-gray-600 font-light text-sm tracking-wide">{message}</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.4s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
            <div className="w-1.5 h-1.5 bg-[#25d076] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialLoadingScreen;

