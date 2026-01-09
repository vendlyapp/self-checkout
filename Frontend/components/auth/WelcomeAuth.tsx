'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, Store, ScanBarcode } from 'lucide-react';

const WelcomeAuth: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex justify-center mb-4 sm:mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg">
              <Store className="w-9 h-9 sm:w-12 sm:h-12 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight">
            Checkout
          </h1>
          
          <p className="text-base sm:text-lg text-gray-600">
            Dein intelligentes Checkout-System
          </p>
        </div>

        {/* Card con botones */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 space-y-3 sm:space-y-4">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Willkommen!
            </h2>
            <p className="text-sm sm:text-base text-gray-500">
              Als Händler anmelden oder Produkt scannen
            </p>
          </div>

          {/* Botón de Login */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 
                     font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 
                     transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-xl
                     hover:scale-[1.02] active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            aria-label="Anmelden"
            tabIndex={0}
          >
            <LogIn className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            Anmelden
          </button>

          {/* Separador */}
          <div className="relative py-3 sm:py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 sm:px-4 text-xs sm:text-sm text-gray-500">oder</span>
            </div>
          </div>

          {/* Botón de Escanear Producto */}
          <button
            type="button"
            onClick={() => router.push('/scan')}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 
                     font-semibold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 
                     transition-all duration-200 border-2 border-gray-200 hover:border-[#25D076]
                     hover:scale-[1.02] active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:ring-offset-2"
            aria-label="Produkt scannen"
            tabIndex={0}
          >
            <ScanBarcode className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            Produkt scannen
          </button>

          {/* Información adicional */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center space-y-1.5 sm:space-y-2">
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              💼 Händler? Melde dich an
            </p>
            <p className="text-xs text-gray-500">
              🛍️ Kunde? Scanne den QR-Code eines Produkts
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © 2026 Vendly. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAuth;

