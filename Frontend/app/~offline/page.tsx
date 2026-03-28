import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline | SelfCheckout",
  description: "Keine Netzwerkverbindung",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col w-full min-h-dvh items-center justify-center px-6 py-12 bg-[#F2EDE8] text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#25D076]/15 flex items-center justify-center mb-6">
        <WifiOff className="w-8 h-8 text-[#25D076]" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Keine Verbindung</h1>
      <p className="text-sm text-neutral-600 max-w-sm mb-8">
        Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut. Bereits geladene Seiten
        können eingeschränkt verfügbar sein.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-[#25D076] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1fb868] transition-colors"
      >
        Erneut versuchen
      </Link>
    </div>
  );
}
