import { User } from 'lucide-react';

const StoreHeaderCard = () => (
  <div className="flex items-center justify-between bg-background-cream px-4 py-4 lg:px-6 lg:py-5 w-full h-full">
    <div className="flex-1">
      <h1 className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">Heiniger&apos;s Hofladen</h1>
      <p className="text-sm lg:text-base text-gray-500 mt-0.5 lg:mt-1">Einstellungen & Funktionen</p>
    </div>
    <div className="flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-brand-500 hover:bg-brand-600 transition-ios-fast">
      <User className="w-6 h-6 lg:w-7 lg:h-7 text-white" aria-label="Profil" />
    </div>
  </div>
);

export default StoreHeaderCard;
