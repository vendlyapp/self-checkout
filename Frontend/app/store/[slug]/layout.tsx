'use client'

import React, { ReactNode, useState, useEffect, useCallback } from "react"
import FooterNavUser from "@/components/navigation/user/FooterNavUser"
import HeaderUser from "@/components/navigation/user/HeaderUser"
import { CategoryChips } from "@/components/user/CategoryChips"
import { useScrollReset } from "@/hooks"
import { useScannedStoreStore } from "@/lib/stores/scannedStoreStore"
import { LoadingProductsModalProvider } from "@/lib/contexts/LoadingProductsModalContext"
import { useParams, useRouter, usePathname } from "next/navigation"
import { useStoreData } from "@/hooks/data/useStoreData"
import { useStoreProducts } from "@/hooks/queries/useStoreProducts"
import { usePaymentMethods } from "@/hooks/queries/usePaymentMethods"
import { DashboardLoadingState } from "@/components/ui/DashboardLoadingState"
import { StoreProvider, useStoreContext } from "./StoreContext"
import { Toaster } from "sonner"

function StoreLayoutContent({ children }: { children: ReactNode }) {
  const { scrollContainerRef } = useScrollReset()
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
  const mainRef = useCallback((el: HTMLElement | null) => {
    ;(scrollContainerRef as React.MutableRefObject<HTMLElement | null>).current = el
    setScrollEl(el)
  }, [scrollContainerRef])
  const { store } = useScannedStoreStore()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const slug = params.slug as string
  const { isLoading: isStoreLoading } = useStoreData({ slug, autoLoad: true })
  // Prefetch productos y métodos de pago en layout — listos antes de que el usuario navegue
  useStoreProducts({ slug, enabled: !!slug })
  usePaymentMethods({ storeId: store?.id ?? '', activeOnly: true })

  const storeContext = useStoreContext()

  const isMainProductsPage = pathname === `/store/${slug}` || pathname === `/store/${slug}/`
  const isScanPage = pathname?.includes('/scan')

const isStoreClosed = store?.isOpen === false
  const hasStoreLoaded = !!(store && store.slug === slug)
  const showInitialLoading = !hasStoreLoaded && isStoreLoading
  const showCategoryChips = isMainProductsPage && store && store.isOpen !== false && storeContext.categoryFilters.length > 0

  useEffect(() => {
    if (typeof window !== 'undefined' && !document.getElementById('global-modals-container')) {
      const container = document.createElement('div')
      container.id = 'global-modals-container'
      container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;overflow:hidden;'
      document.body.appendChild(container)
    }
  }, [])

  return (
    <LoadingProductsModalProvider>
      {showInitialLoading && (
        <DashboardLoadingState mode="page" message="Wird geladen..." className="animate-page-enter" />
      )}

      {/* Scan page — render solo children, sin chrome */}
      {isScanPage ? (
        <div className="flex-1 min-h-0" key={pathname}>{children}</div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 h-full w-full bg-background-cream relative">
          <main
            ref={mainRef}
            className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar ios-scroll-fix ios-scroll-smooth"
            style={{
              paddingBottom: isStoreClosed ? 0 : 'calc(140px + env(safe-area-inset-bottom))',
              paddingLeft: 'env(safe-area-inset-left, 0px)',
              paddingRight: 'env(safe-area-inset-right, 0px)',
            }}
          >
            {!isStoreClosed && (
              <>
                <HeaderUser isDarkMode={false} scrollContainer={scrollEl} />
                {showCategoryChips && (
                  <CategoryChips
                    filters={storeContext.categoryFilters}
                    selectedFilters={storeContext.selectedFilters}
                    onFilterChange={storeContext.onFilterChange}
                  />
                )}
              </>
            )}
            <div className="w-full max-w-full animate-fade-in" key={pathname}>
              {children}
            </div>
          </main>

          {!isStoreClosed && (
            <div className="fixed bottom-0 left-0 right-0 z-[9999]">
              <FooterNavUser />
            </div>
          )}
        </div>
      )}
      <Toaster
        position="top-center"
        offset={16}
        gap={8}
        visibleToasts={3}
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100vw - 32px)',
          maxWidth: '360px',
        }}
        toastOptions={{
          duration: 2200,
          classNames: {
            toast: '!rounded-2xl !border-0 !bg-[#25D076] !text-white !shadow-[0_8px_32px_rgba(37,208,118,0.3),0_2px_8px_rgba(0,0,0,0.08)] !text-[13px] !font-semibold !px-4 !py-3 !w-full',
            icon: '!shrink-0',
            title: '!font-semibold !text-[13px] !text-white',
            description: '!text-[11.5px] !text-white/80 !font-normal',
            success: '![--toast-icon-color:#ffffff]',
            error: '!bg-[#EF4444] ![--toast-icon-color:#ffffff]',
            info: '!bg-[#3B82F6] ![--toast-icon-color:#ffffff]',
          },
        }}
      />
    </LoadingProductsModalProvider>
  )
}

export default function StoreLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { store } = useScannedStoreStore()

  const handleScanQR = () => {
    if (store?.slug) router.push(`/store/${store.slug}/scan`)
  }

  return (
    <StoreProvider onScanQR={handleScanQR}>
      <StoreLayoutContent>{children}</StoreLayoutContent>
    </StoreProvider>
  )
}
