'use client';

import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PlanCard = () => {
  const router = useRouter();

  const handleUpgrade = () => {
    // Por ahora, mostrar un mensaje o redirigir a una página de planes
    // En el futuro, esto podría abrir un modal o redirigir a una página de upgrade
    if (window.confirm('Möchten Sie Ihren Plan upgraden? Diese Funktion wird bald verfügbar sein.')) {
      // Aquí se podría implementar la lógica de upgrade
      // Por ejemplo: router.push('/store/plans');
    }
  };

  return (
    <div className="flex items-center gap-3 bg-transparent md:bg-card px-4 py-4 lg:px-5 lg:py-5 w-full h-full min-h-[96px] lg:min-h-[112px] border border-border rounded-2xl md:shadow-sm">
      <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] lg:text-xs text-muted-foreground uppercase tracking-wide">Aktueller Plan</div>
        <div className="font-semibold text-foreground leading-snug text-sm lg:text-base mt-0.5">Premium</div>
        <div className="text-[11px] lg:text-xs text-muted-foreground mt-0.5">Ablauf: 22.11.2026</div>
      </div>
      <button
        onClick={handleUpgrade}
        className="px-3 py-2 lg:px-4 lg:py-2 bg-primary text-primary-foreground text-xs lg:text-sm font-semibold rounded-xl hover:bg-primary/90 transition-ios flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        tabIndex={0}
        aria-label="Upgrade Plan"
        type="button"
      >
        Upgrade
      </button>
    </div>
  );
};

export default PlanCard;
