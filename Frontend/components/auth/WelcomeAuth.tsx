'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Store } from 'lucide-react';
import Image from 'next/image';

const WelcomeAuth: React.FC = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background-cream to-brand-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center shadow-lg">
              <Store className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Vendly
          </h1>
          
          <p className="text-lg text-gray-600">
            Dein intelligentes Checkout-System
          </p>
        </div>

        {/* Card con botones */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Willkommen zurück!
            </h2>
            <p className="text-gray-500">
              Melde dich an oder erstelle ein Konto
            </p>
          </div>

          {/* Botón de Login */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-2xl px-6 py-4 
                     font-semibold text-lg flex items-center justify-center gap-3 
                     transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-xl
                     hover:scale-[1.02] active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            aria-label="Anmelden"
            tabIndex={0}
          >
            <LogIn className="w-6 h-6" strokeWidth={2.5} />
            Anmelden
          </button>

          {/* Separador */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">oder</span>
            </div>
          </div>

          {/* Botón de Registro */}
          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 rounded-2xl px-6 py-4 
                     font-semibold text-lg flex items-center justify-center gap-3 
                     transition-all duration-200 border-2 border-gray-200 hover:border-brand-500
                     hover:scale-[1.02] active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            aria-label="Konto erstellen"
            tabIndex={0}
          >
            <UserPlus className="w-6 h-6" strokeWidth={2.5} />
            Konto erstellen
          </button>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Für Geschäfte und Einzelhändler
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Vendly. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAuth;

