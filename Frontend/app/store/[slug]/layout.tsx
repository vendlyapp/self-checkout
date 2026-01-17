'use client'

import { ReactNode, useState, useEffect } from "react"
import FooterNavUser from "@/components/navigation/user/FooterNavUser"
import HeaderUser from "@/components/navigation/user/HeaderUser"
import { useScrollReset } from "@/hooks"
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore"
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext"
import { useParams, useRouter, usePathname } from "next/navigation"
import { useStoreData } from "@/hooks/data/useStoreData"
import { InitialLoadingScreen } from "@/components/ui"
import { StoreProvider, useStoreContext } from "./StoreContext"
import StoreFixedHeader from "@/components/user/StoreFixedHeader"
import StoreInfoHeader from "@/components/user/StoreInfoHeader"
import HeaderNav from "@/components/navigation/HeaderNav"

interface StoreLayoutContentProps {
  children: ReactNode
}

function StoreLayoutContent({ children }: StoreLayoutContentProps) {
  const { scrollContainerRef } = useScrollReset()
  const { store } = useScannedStoreStore()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const slug = params.slug as string
  const { isLoading: isStoreLoading } = useStoreData({ slug, autoLoad: true })
  const [modalContainer, setModalContainer] = useState<HTMLDivElement | null>(null)
  const storeContext = useStoreContext()
  
  // Determinar si estamos en la página principal de productos (no en cart, payment, etc.)
  const isMainProductsPage = pathname === `/store/${slug}` || pathname === `/store/${slug}/`
  
  // Determinar si estamos en la página de scan
  const isScanPage = pathname?.includes('/scan')
  
  // Determinar el título del HeaderNav según la ruta (solo para páginas que no son la principal)
  const getHeaderNavTitle = (): string | null => {
    if (isMainProductsPage) return null
    
    if (pathname?.includes('/cart')) return 'Warenkorb'
    if (pathname?.includes('/payment')) return 'Bezahlung'
    if (pathname?.includes('/promotion')) return 'Aktionen'
    if (pathname?.includes('/search')) return 'Suchen'
    if (pathname?.includes('/scan')) return 'QR Scanner'
    
    return null
  }
  
  const headerNavTitle = getHeaderNavTitle()
  const shouldShowHeaderNav = !isMainProductsPage && headerNavTitle !== null
  
  // Si la tienda está cerrada, ocultar navbar y footer
  const isStoreClosed = store?.isOpen === false
  
  // En la página de scan, mostrar HeaderNav y FooterNavUser (ya no ocultamos)
  const shouldHideNavigation = false // Mostrar navegación en todas las páginas incluyendo scan
  const shouldHideFooter = false // Mostrar footer en todas las páginas incluyendo scan

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

  // Calcular altura total de headers fijos (optimizado para móvil):
  // Solo en la página principal de productos:
  // - HeaderUser: ~85px (con safe area)
  // - StoreInfoHeader (título tienda + Kontakt): ~65px (py-2.5 = 10px + contenido ~55px)
  // - Barra de búsqueda: ~60px (44px altura input/botón + py-2 = 16px padding total)
  // - Filtros de categorías: ~60px (altura variable, padding responsive)
  // En otras páginas:
  // - HeaderUser: ~85px (con safe area)
  // - HeaderNav: ~60px (con flecha de navegación)
  // En scan:
  // - HeaderUser: ~85px (con safe area)
  // - HeaderNav: ~60px (con flecha de navegación)
  const fixedHeadersHeight = isScanPage && shouldShowHeaderNav
    ? 'calc(85px + env(safe-area-inset-top) + 60px)'
    : isMainProductsPage && store && store.isOpen !== false && storeContext.categoryFilters.length > 0
    ? 'calc(85px + env(safe-area-inset-top) + 65px + 60px + 60px)'
    : isMainProductsPage && store && store.isOpen !== false
    ? 'calc(85px + env(safe-area-inset-top) + 65px + 60px)'
    : isMainProductsPage && store
    ? 'calc(85px + env(safe-area-inset-top) + 65px)'
    : shouldShowHeaderNav
    ? 'calc(85px + env(safe-area-inset-top) + 60px)'
    : 'calc(85px + env(safe-area-inset-top))'

  return (
    <LoadingProductsModalProvider>
      {/* Pantalla de carga inicial - solo en recarga completa, no en navegación */}
      {showInitialLoading && <InitialLoadingScreen message="Cargando..." />}
      
      <div className={`flex flex-col h-mobile w-full ${containerBgClass} relative overflow-hidden`}>
        {/* Header principal fijo con safe area - mostrar siempre excepto si tienda cerrada */}
        {!isStoreClosed && (
          <div className={`fixed top-0 left-0 right-0 z-[100] ${headerBgClass} safe-area-top`}>
            <HeaderUser isDarkMode={false} />
          </div>
        )}

        {/* Header de información de la tienda (título + Kontakt) - Solo en página principal */}
        {!isStoreClosed && !shouldHideNavigation && store && isMainProductsPage && (
          <StoreInfoHeader isFixed={true} />
        )}

        {/* Headers fijos de búsqueda y filtros - Solo en página principal y si la tienda está abierta */}
        {!isStoreClosed && !shouldHideNavigation && store && store.isOpen !== false && isMainProductsPage && (
          <StoreFixedHeader
            searchQuery={storeContext.searchQuery}
            onSearch={storeContext.onSearch}
            selectedFilters={storeContext.selectedFilters}
            onFilterChange={storeContext.onFilterChange}
            onScanQR={storeContext.onScanQR}
            categoryFilters={storeContext.categoryFilters}
            isFixed={true}
          />
        )}

        {/* HeaderNav fijo - Solo en páginas que no son la principal (cart, payment, promotion, search, scan) */}
        {!isStoreClosed && !shouldHideNavigation && shouldShowHeaderNav && headerNavTitle && (
          <div 
            className="fixed left-0 right-0 z-40 bg-white"
            style={{ top: 'calc(85px + env(safe-area-inset-top))' }}
          >
            <HeaderNav title={headerNavTitle} isFixed={false} />
          </div>
        )}

        {/* Contenido principal optimizado para PWA iOS y móvil */}
        <main
          ref={scrollContainerRef}
          className={`flex-1 overflow-x-hidden relative no-scrollbar ios-scroll-fix ios-scroll-smooth ${
            isScanPage ? 'overflow-y-hidden' : 'overflow-y-auto'
          }`}
          style={{
            paddingTop: isStoreClosed ? 0 : fixedHeadersHeight,
            paddingBottom: isStoreClosed || shouldHideFooter ? 0 : 'calc(100px + env(safe-area-inset-bottom))',
            paddingLeft: 'env(safe-area-inset-left, 0px)',
            paddingRight: 'env(safe-area-inset-right, 0px)',
          }}
        >
          <div 
            className="w-full max-w-full animate-fade-in" 
            style={isScanPage ? { height: '100%' } : {}}
            key={pathname}
          >
            {children}
          </div>
        </main>

        {/* Footer de navegación fijo con safe area - ocultar solo si tienda cerrada */}
        {!isStoreClosed && !shouldHideFooter && (
          <div className="fixed bottom-0 left-0 right-0 z-[9999]">
            <FooterNavUser />
          </div>
        )}
      </div>
    </LoadingProductsModalProvider>
  )
}

interface StoreLayoutProps {
  children: ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const router = useRouter()
  const { store } = useScannedStoreStore()

  const handleScanQR = () => {
    if (store?.slug) {
      router.push(`/store/${store.slug}/scan`)
    }
  }

  return (
    <StoreProvider onScanQR={handleScanQR}>
      <StoreLayoutContent>{children}</StoreLayoutContent>
    </StoreProvider>
  )
}
