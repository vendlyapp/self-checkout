'use client';

import { ChevronRight } from 'lucide-react';

export type ChargePaymentMethodItem = {
  code: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
};

export default function ChargePaymentMethods({
  methods,
  onSelect,
}: {
  methods: ChargePaymentMethodItem[];
  onSelect: (code: string) => void;
}) {
  if (methods.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-card">
        <p className="text-sm font-medium text-gray-500">
          Keine Zahlungsmethoden verfügbar
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Aktivieren Sie Zahlungsarten in den Geschäftseinstellungen.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {methods.map((payment) => {
        const Icon = payment.icon;
        return (
          <button
            key={payment.code}
            type="button"
            onClick={() => onSelect(payment.code)}
            className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left font-bold text-white shadow-card transition-transform active:scale-[0.98]"
            style={{ backgroundColor: payment.bgColor }}
            aria-label={payment.label}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/20">
              <Icon className="h-6 w-6" />
            </span>
            <span className="flex-1 text-lg">{payment.label}</span>
            <ChevronRight className="h-5 w-5 shrink-0 opacity-80" strokeWidth={2.5} />
          </button>
        );
      })}
    </div>
  );
}
