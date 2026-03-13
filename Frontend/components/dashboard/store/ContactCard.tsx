'use client';

import { MessageCircle } from 'lucide-react';

const ContactCard = () => {
  const handleContact = () => {
    // Open email client with mailto
    window.location.href = 'mailto:hilfe@self-checkout.ch?subject=Kontaktanfrage&body=Hallo,%0D%0A%0D%0A';
  };

  return (
    <div className="flex items-center gap-3 bg-transparent md:bg-card rounded-2xl border border-border p-4 lg:p-5 md:shadow-sm">
      <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs lg:text-xs text-muted-foreground uppercase tracking-wide">Kontaktieren</div>
        <div className="font-semibold text-foreground leading-snug text-base mt-0.5">Schreiben Sie uns</div>
        <div className="text-xs lg:text-xs text-muted-foreground mt-0.5 break-all">hilfe@self-checkout.ch</div>
      </div>
      <button
        onClick={handleContact}
        className="cursor-pointer px-3 py-2 lg:px-4 lg:py-2 bg-primary text-primary-foreground text-sm lg:text-sm font-semibold rounded-xl hover:bg-primary/90 transition-ios flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        tabIndex={0}
        aria-label="Kontakt aufnehmen"
        type="button"
      >
        Kontakt
      </button>
    </div>
  );
};

export default ContactCard;
