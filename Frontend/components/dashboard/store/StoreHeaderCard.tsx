'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

const StoreHeaderCard = () => {
  const router = useRouter();

  const handleProfileClick = () => {
    // Navegar a la página de perfil o configuración
    router.push('/store/profile');
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-transparent md:bg-card p-4 lg:p-5 w-full h-full min-h-[96px] lg:min-h-[112px] md:shadow-sm">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg lg:text-lg font-bold text-foreground leading-snug break-words">Heiniger&apos;s Hofladen</h2>
        <p className="text-sm lg:text-sm text-muted-foreground mt-0.5">Einstellungen & Funktionen</p>
      </div>
      <button
        onClick={handleProfileClick}
        className="flex items-center justify-center w-11 h-11 lg:w-11 lg:h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-ios flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        tabIndex={0}
        aria-label="Profil öffnen"
        type="button"
      >
        <User className="w-6 h-6 lg:w-6 lg:h-6" aria-hidden="true" />
      </button>
    </div>
  );
};

export default StoreHeaderCard;
