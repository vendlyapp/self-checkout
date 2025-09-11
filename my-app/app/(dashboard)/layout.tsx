// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import FooterNav from "@/components/navigation/FooterNav";
import Header from "@/components/navigation/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-mobile w-full bg-background-cream relative overflow-hidden">
      {/* Header fijo con safe area */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white safe-area-top">
        <Header />
      </div>

      {/* Contenido principal optimizado para móviles */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar pt-[calc(85px+env(safe-area-inset-top))] pb-[calc(80px+env(safe-area-inset-bottom))]">
        <div className="w-full">{children}</div>
      </main>

      {/* Footer fijo con safe area */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <FooterNav />
      </div>
    </div>
  );
}
