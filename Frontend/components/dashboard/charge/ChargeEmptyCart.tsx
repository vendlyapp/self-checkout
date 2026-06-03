'use client';

import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChargeEmptyCart() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-card">
        <ShoppingBag className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-base font-semibold text-gray-900">Warenkorb ist leer</p>
      <p className="mt-1 max-w-xs text-sm text-gray-500">
        Wählen Sie Produkte aus, um den Verkauf zu starten.
      </p>
      <button
        type="button"
        onClick={() => router.push('/charge')}
        className="mt-6 rounded-2xl bg-[#25D076] px-6 py-3.5 text-base font-bold text-white shadow-[0_4px_16px_rgba(37,208,118,0.35)] active:scale-[0.98]"
      >
        Produkte wählen
      </button>
    </div>
  );
}
