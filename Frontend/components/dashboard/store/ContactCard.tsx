import { MessageCircle } from 'lucide-react';

const ContactCard = () => (
  <div className="flex items-center bg-background-cream rounded-2xl shadow-sm border border-gray-100 px-4 py-4 ">
    <div className="w-10 h-10  bg-white rounded-lg p-2 flex items-center justify-center mr-3">
      <MessageCircle className="w-5 h-5 text-brand-700 " />
    </div>
    <div className="flex-1">
      <div className="text-xs text-gray-500">Kontaktieren</div>
      <div className="font-semibold text-gray-900 leading-tight">Schreiben Sie uns</div>
      <div className="text-xs text-gray-400">hilfe@self-checkout.ch</div>
    </div>
    <button
      className="ml-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow transition-ios-fast focus:outline-none focus:ring-2 focus:ring-brand-500"
      tabIndex={0}
      aria-label="Kontakt aufnehmen"
    >
      Kontakt
    </button>
  </div>
);

export default ContactCard;
