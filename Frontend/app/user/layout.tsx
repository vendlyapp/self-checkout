"use client";

// app/user/layout.tsx
import { ReactNode, useLayoutEffect, useRef } from "react";
import FooterNavUser from "@/components/navigation/user/FooterNavUser";
import HeaderUser from "@/components/navigation/user/HeaderUser";
import { usePathname, useRouter } from "next/navigation";
import { useScrollReset } from "@/hooks";
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { scrollContainerRef } = useScrollReset();
  const { store } = useScannedStoreStore();
  const isScanRoute = pathname === "/user/scan";
  const previousPathnameRef = useRef<string | null>(null);
  
  // Redirigir automáticamente a /store/[slug] si hay una tienda y no estamos en /user/scan
  // Usar useLayoutEffect para ejecutar antes del renderizado, evitando montar componentes innecesarios
  useLayoutEffect(() => {
    // Solo ejecutar si tenemos store, pathname válido, no estamos en scan, y estamos en una ruta /user/*
    if (!store?.slug || !pathname || isScanRoute || !pathname.startsWith('/user')) {
      previousPathnameRef.current = null;
      return;
    }

    // Si el pathname no cambió, no hacer nada (evitar re-ejecuciones)
    if (previousPathnameRef.current === pathname) {
      return;
    }

    // Verificar que realmente estamos en la ruta /user/* (no ya redirigidos)
    if (typeof window === 'undefined' || !window.location.pathname.startsWith('/user')) {
      return;
    }

    // Mapear rutas de /user/* a /store/[slug]/*
    const routeMap: Record<string, string> = {
      '/user': `/store/${store.slug}`,
      '/user/cart': `/store/${store.slug}/cart`,
      '/user/payment': `/store/${store.slug}/payment`,
      '/user/promotion': `/store/${store.slug}/promotion`,
      '/user/search': `/store/${store.slug}/search`,
    };

    const targetRoute = routeMap[pathname];
    if (targetRoute && window.location.pathname === pathname) {
      previousPathnameRef.current = pathname;
      // Usar replace para evitar agregar al historial
      router.replace(targetRoute);
    }
  }, [store?.slug, pathname, isScanRoute, router]);
  
  // El timeout de sesión se maneja globalmente en SessionTimeoutManager
  
  // Si la tienda está cerrada, ocultar navbar y footer
  const isStoreClosed = store?.isOpen === false;

  const containerBgClass = "bg-background-cream";
  const headerBgClass = "bg-white";

  return (
    <div className={`flex flex-col h-mobile w-full ${containerBgClass} relative overflow-hidden`}>
      {/* Header principal fijo con safe area - ocultar si tienda cerrada */}
      {!isStoreClosed && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${headerBgClass} safe-area-top`}>
          <HeaderUser isDarkMode={false} />
        </div>
      )}

      {/* Contenido principal optimizado para PWA iOS */}
      <main
        ref={scrollContainerRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar ios-scroll-fix gpu-accelerated
          ${isStoreClosed ? 'pt-0 pb-0' : 'pt-[calc(85px+env(safe-area-inset-top))] pb-[calc(100px+env(safe-area-inset-bottom))]'}
        `}
      >
        <div className="w-full">{children}</div>
      </main>

      {/* Footer de navegación fijo con safe area - ocultar si tienda cerrada */}
      {!isStoreClosed && (
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <FooterNavUser />
        </div>
      )}
    </div>
  );
};

export default UserLayout;
