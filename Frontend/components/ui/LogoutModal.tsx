"use client";

import React from 'react';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop con blur elegante */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-200"
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300 border border-gray-200 dark:border-gray-800">
        {/* Icono animado */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Glow suave de fondo */}
          <div className="absolute inset-0 rounded-full bg-[#25d076] opacity-10 blur-2xl animate-pulse" />
          
          {/* Círculo exterior */}
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 dark:border-gray-700" />
          
          {/* Spinner animado */}
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#25d076] border-r-[#25d076] animate-spin" 
               style={{ 
                 animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                 filter: 'drop-shadow(0 0 8px rgba(37, 208, 118, 0.3))'
               }} 
          />
          
          {/* Icono central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <LogOut className="w-8 h-8 text-[#25d076] animate-pulse" strokeWidth={2.5} />
          </div>
        </div>
        
        {/* Texto */}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Cerrando sesión...
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
            Limpiando datos y finalizando tu sesión de forma segura
          </p>
        </div>
        
        {/* Indicadores de carga */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <div 
            className="w-2 h-2 bg-[#25d076] rounded-full animate-bounce" 
            style={{ animationDelay: '0s', animationDuration: '1.4s' }} 
          />
          <div 
            className="w-2 h-2 bg-[#25d076] rounded-full animate-bounce" 
            style={{ animationDelay: '0.2s', animationDuration: '1.4s' }} 
          />
          <div 
            className="w-2 h-2 bg-[#25d076] rounded-full animate-bounce" 
            style={{ animationDelay: '0.4s', animationDuration: '1.4s' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;

