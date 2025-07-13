import { User } from 'lucide-react';

const StoreHeaderCard = () => (
  <div className="flex items-center justify-between bg-background-cream rounded-2xl  px-5 py-4 mb-5">
    <div>
      <h1 className="text-lg font-bold text-gray-900 leading-tight">Heiniger’s Hofladen</h1>
      <p className="text-sm text-gray-500 mt-0.5">Einstellungen & Funktionen</p>
    </div>
    <div className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-500">
      <User className="w-6 h-6 text-white" aria-label="Profil" />
    </div>
  </div>
);

export default StoreHeaderCard; 