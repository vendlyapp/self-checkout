import { Crown } from 'lucide-react';

const PlanCard = () => (
  <div className="flex items-center bg-background-cream px-5 py-4 lg:px-6 lg:py-5 w-full h-full">
    <div className="flex items-center gap-3 lg:gap-4 flex-1">
      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white flex items-center justify-center">
        <Crown className="w-6 h-6 lg:w-7 lg:h-7" />
      </div>
      <div className="flex-1">
        <div className="text-xs lg:text-sm text-gray-500">Aktueller Plan:</div>
        <div className="font-semibold text-gray-900 leading-tight lg:text-lg">Premium</div>
        <div className="text-xs lg:text-sm text-gray-400 mt-0.5 lg:mt-1">Ablauf: 22.11.2026</div>
      </div>
    </div>
    <button
      className="ml-4 px-4 py-2 lg:px-5 lg:py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm lg:text-base font-semibold rounded-xl shadow hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
      tabIndex={0}
      aria-label="Upgrade Plan"
    >
      Upgrade
    </button>
  </div>
);

export default PlanCard;
