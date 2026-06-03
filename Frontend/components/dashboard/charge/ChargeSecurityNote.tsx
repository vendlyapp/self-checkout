'use client';

import { Lock } from 'lucide-react';

export default function ChargeSecurityNote({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white text-center shadow-card ${
        compact ? 'px-4 py-3' : 'px-5 py-4'
      }`}
    >
      <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        <span className="h-2 w-2 rounded-full bg-[#25D076]" aria-hidden />
        256-Bit SSL-Verschlüsselung
        <Lock className="h-3.5 w-3.5 text-gray-400" aria-hidden />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        Ihre Daten werden sicher in ISO-zertifizierten Rechenzentren verarbeitet.
      </p>
    </div>
  );
}
