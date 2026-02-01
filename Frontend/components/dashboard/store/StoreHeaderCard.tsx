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
    <div className="flex items-center justify-between bg-background-cream px-4 py-4 lg:px-6 lg:py-5 w-full h-full">
      <div className="flex-1">
        <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">Heiniger&apos;s Hofladen</h1>
        <p className="text-sm lg:text-base text-gray-500 mt-0.5 lg:mt-1">Einstellungen & Funktionen</p>
      </div>
      <button
        onClick={handleProfileClick}
        className="flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-brand-500 hover:bg-brand-600 transition-ios-fast focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        tabIndex={0}
        aria-label="Profil öffnen"
        type="button"
      >
        <User className="w-6 h-6 lg:w-7 lg:h-7 text-white" aria-hidden="true" />
      </button>
    </div>
  );
};

export default StoreHeaderCard;
