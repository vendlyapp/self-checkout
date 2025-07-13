import { Crown } from 'lucide-react';

const PlanCard = () => (
  <div className="flex items-center bg-background-cream rounded-2xl shadow-sm border border-gray-100 px-5 py-4 mb-5">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
        <Crown className="w-6 h-6 text-brand-500" />
      </div>
      <div>
        <div className="text-xs text-gray-500">Aktueller Plan:</div>
        <div className="font-semibold text-gray-900 leading-tight">Premium</div>
        <div className="text-xs text-gray-400 mt-0.5">Ablauf: 22.11.2026</div>
      </div>
    </div>
    <button
      className="ml-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500"
      tabIndex={0}
      aria-label="Upgrade Plan"
    >
      Upgrade
    </button>
  </div>
);

export default PlanCard; 