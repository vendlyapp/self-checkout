'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

/**
 * Componente de pantalla de bienvenida
 * Muestra un mensaje de bienvenida y redirige al dashboard
 */
const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  const handleNavigateToDashboard = (): void => {
    router.push('/dashboard');
  };
  const handleNavigateToUser = (): void => {
    router.push('/user');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        {/* Emoji de saludo */}
        <div className="text-5xl mb-6">👋</div>
        
        {/* Título */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Willkommen!
        </h1>
        
        {/* Descripción */}
        <p className="text-muted-foreground mb-8">
          Bereit für deinen Shop? Lass uns starten.
        </p>
        {/* Botones de acción organizados */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            aria-label="Zum Dashboard"
            tabIndex={0}
            onClick={handleNavigateToDashboard}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNavigateToDashboard(); }}
            className="w-full bg-primary text-primary-foreground rounded-xl px-6 py-4 font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Zum Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Zum User"
            tabIndex={0}
            onClick={handleNavigateToUser}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleNavigateToUser(); }}
            className="w-full bg-secondary text-secondary-foreground rounded-xl px-6 py-4 font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
          >
            Zum User
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;