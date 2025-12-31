'use client'

import { ReactNode, useState, useEffect } from "react"
import FooterNavUser from "@/components/navigation/user/FooterNavUser"
import HeaderUser from "@/components/navigation/user/HeaderUser"
import { useScrollReset } from "@/hooks"
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore"
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext"
import { useParams } from "next/navigation"
import { useStoreData } from "@/hooks/data/useStoreData"
import { InitialLoadingScreen } from "@/components/ui"

interface StoreLayoutProps {
  children: ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const { scrollContainerRef } = useScrollReset()
  const { store } = useScannedStoreStore()
  const params = useParams()
  const slug = params.slug as string
  const { isLoading: isStoreLoading } = useStoreData({ slug, autoLoad: true })
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(null)
  
  // Si la tienda está cerrada, ocultar navbar y footer
  const isStoreClosed = store?.isOpen === false

  const containerBgClass = "bg-background-cream"
  const headerBgClass = "bg-white"

  // Verificar si ya tenemos la tienda correcta cargada
  // Si el store ya está cargado, nunca mostrar pantalla de carga (navegación entre páginas)
  const hasStoreLoaded = !!(store && store.slug === slug)
  
  // Mostrar pantalla de carga inicial SOLO si:
  // - NO tenemos el store cargado (recarga completa de página)
  // - Y está cargando activamente
  // NO mostrar si ya tenemos el store cargado (navegación entre páginas)
  const showInitialLoading = !hasStoreLoaded && isStoreLoading

  // Crear contenedor de modales global (igual que en admin)
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('global-modals-container')) {
      const container = document.createElement('div')
      container.id = 'global-modals-container'
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '99999'
      container.style.overflow = 'hidden'
      document.body.appendChild(container)
      setModalContainer(container)
    } else if (typeof window !== 'undefined') {
      const existingContainer = document.getElementById('global-modals-container')
      if (existingContainer) {
        setModalContainer(existingContainer as HTMLDivElement)
      }
    }
  }, [])

  return (
    <LoadingProductsModalProvider>
      {/* Pantalla de carga inicial - solo en recarga completa, no en navegación */}
      {showInitialLoading && <InitialLoadingScreen message="Cargando..." />}
      
      <div className={`flex flex-col h-mobile w-full ${containerBgClass} relative overflow-hidden`}>
        {/* Header principal fijo con safe area - ocultar si tienda cerrada */}
        {!isStoreClosed && (
          <div className={`fixed top-0 left-0 right-0 z-[100] ${headerBgClass} safe-area-top`}>
            <HeaderUser isDarkMode={false} />
          </div>
        )}

        {/* Contenido principal optimizado para PWA iOS */}
        <main
          ref={scrollContainerRef}
          className={`
            flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar ios-scroll-fix
            transition-opacity duration-200 ease-in-out
            ${isStoreClosed ? 'pt-0 pb-0' : 'pt-[calc(85px+env(safe-area-inset-top))] pb-[calc(100px+env(safe-area-inset-bottom))]'}
          `}
        >
          <div className="w-full animate-fade-in">{children}</div>
        </main>

        {/* Footer de navegación fijo con safe area - ocultar si tienda cerrada */}
        {!isStoreClosed && (
          <div className="fixed bottom-0 left-0 right-0 z-[9999]">
            <FooterNavUser />
          </div>
        )}
      </div>
    </LoadingProductsModalProvider>
  )
}
