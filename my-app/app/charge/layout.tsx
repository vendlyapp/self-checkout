"use client";
// app/charge/layout.tsx
import { ReactNode } from "react";
import Header from "@/components/navigation/Header";
import HeaderNav from "@/components/navigation/HeaderNav";

export default function ChargeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full w-full bg-background-cream">
      {/* Header principal fijo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Header />
        <HeaderNav title="Warenkorb" />
      </div>

      {/* Contenido principal con scroll y padding para el header fijo */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  );
}
