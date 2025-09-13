"use client";

// app/user/layout.tsx
import { ReactNode } from "react";
import FooterNavUser from "@/components/navigation/user/FooterNavUser";
import HeaderUser from "@/components/navigation/user/HeaderUser";
import { usePathname } from "next/navigation";
import { useScrollReset } from "@/lib/hooks";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const pathname = usePathname();
  const { scrollContainerRef } = useScrollReset();
  const isScanRoute = pathname === "/user/scan";

  const containerBgClass = isScanRoute ? "bg-[#191F2D]" : "bg-background-cream";
  const headerBgClass = isScanRoute ? "bg-[#191F2D]" : "bg-white";

  return (
    <div className={`flex flex-col h-mobile w-full ${containerBgClass} relative overflow-hidden`}>
      {/* Header principal fijo con safe area */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${headerBgClass} safe-area-top`}>
        <HeaderUser isDarkMode={isScanRoute} />
      </div>

      {/* Contenido principal optimizado para PWA iOS */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar ios-scroll-fix pt-[calc(85px+env(safe-area-inset-top))] pb-[calc(100px+env(safe-area-inset-bottom))]"
      >
        <div className="w-full">{children}</div>
      </main>

      {/* Footer de navegación fijo con safe area */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <FooterNavUser />
      </div>
    </div>
  );
};

export default UserLayout;
