'use client'

import { ReactNode } from "react"
import FooterNavUser from "@/components/navigation/user/FooterNavUser"
import HeaderUser from "@/components/navigation/user/HeaderUser"
import { usePathname } from "next/navigation"
import { useScrollReset } from "@/hooks"
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore"

interface StoreLayoutProps {
  children: ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const pathname = usePathname()
  const { scrollContainerRef } = useScrollReset()
  const { store } = useScannedStoreStore()
  const isScanRoute = pathname?.includes('/scan')
  
  // Si la tienda está cerrada, ocultar navbar y footer
  const isStoreClosed = store?.isOpen === false

  const containerBgClass = isScanRoute ? "bg-[#191F2D]" : "bg-background-cream"
  const headerBgClass = isScanRoute ? "bg-[#191F2D]" : "bg-white"

  return (
    <div className={`flex flex-col h-mobile w-full ${containerBgClass} relative overflow-hidden`}>
      {/* Header principal fijo con safe area - ocultar si tienda cerrada */}
      {!isStoreClosed && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${headerBgClass} safe-area-top`}>
          <HeaderUser isDarkMode={isScanRoute} />
        </div>
      )}

      {/* Contenido principal optimizado para PWA iOS */}
      <main
        ref={scrollContainerRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar ios-scroll-fix
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
  )
}
