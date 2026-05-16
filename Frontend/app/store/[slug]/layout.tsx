'use client'

import React, { ReactNode, useState, useEffect, useCallback, useMemo } from "react"
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
import { useCartStore } from "@/lib/stores/cartStore"
import { normalizeProductData, Product } from "@/components/dashboard/products_list/data/mockProducts"
import { Plus, Minus, ShoppingCart, Check } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

// ── Barra add-to-cart para página de producto ─────────────────────────────────
function ProductAddBar({ slug, productId }: { slug: string; productId: string }) {
  const { data: rawProducts = [] } = useStoreProducts({ slug, enabled: !!slug })
  const { cartItems, addToCart } = useCartStore()

  const product = useMemo(() => {
    const all = rawProducts.map(normalizeProductData)
    return all.find((p: Product) => p.id === productId) ?? null
  }, [rawProducts, productId])

  const cartItem = cartItems.find(i => i.product.id === productId)
  const qty = cartItem?.quantity ?? 0
  const cartTotal = cartItems.reduce((s, i) => s + i.quantity * i.product.price, 0)

  const fmt = (n: number) => {
    const r = Math.round(n * 100) / 100
    return r % 1 !== 0 ? `CHF ${r.toFixed(2)}` : `CHF ${Math.round(r)}.–`
  }

  if (!product) return null

  const handleAdd = () => {
    if (qty >= product.stock) return
    addToCart(product, qty + 1)
    if (qty === 0) toast.success('Zum Warenkorb hinzugefügt', { description: product.name })
  }
  const handleRemove = () => {
    if (qty === 0) return
    addToCart(product, qty - 1)
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-gray-100 bg-white/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {qty === 0 ? (
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D076] text-base font-bold text-white shadow-[0_4px_16px_rgba(37,208,118,0.35)] disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
            In den Warenkorb · {fmt(product.price)}
          </button>
        ) : (
          <>
            {/* Qty controls */}
            <div className="flex h-14 items-center gap-1 rounded-2xl border border-gray-200 bg-gray-50 px-1.5">
              <button
                onClick={handleRemove}
                className="grid h-11 w-11 place-items-center rounded-xl bg-white text-gray-700 shadow-sm active:scale-95 transition-transform"
                aria-label="Weniger"
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="min-w-10 text-center text-lg font-extrabold tabular-nums">{qty}</span>
              <button
                onClick={handleAdd}
                disabled={qty >= product.stock}
                className="grid h-11 w-11 place-items-center rounded-xl bg-[#25D076] text-white disabled:opacity-40 active:scale-95 transition-transform"
                aria-label="Mehr"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            {/* Ir al carrito */}
            <Link
              href={`/store/${slug}/cart`}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-900 text-sm font-bold text-white active:scale-[0.98] transition-transform"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
              Warenkorb · {fmt(cartTotal)}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

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
  const productMatch = pathname?.match(/\/store\/[^/]+\/product\/([^/?#]+)/)
  const isProductPage = !!productMatch
  const currentProductId = productMatch?.[1] ?? ''

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
        <div className="store-pwa flex-1 min-h-0" key={pathname}>{children}</div>
      ) : (
        <div className="store-pwa flex flex-col flex-1 min-h-0 h-full w-full bg-background-cream relative">
          <main
            ref={mainRef}
            className="flex-1 overflow-x-hidden overflow-y-auto no-scrollbar ios-scroll-fix ios-scroll-smooth"
            style={{
              paddingBottom: isStoreClosed ? 0 : 'calc(118px + env(safe-area-inset-bottom))',
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
            isProductPage
              ? <ProductAddBar slug={slug} productId={currentProductId} />
              : <div className="fixed bottom-0 left-0 right-0 z-[9999]"><FooterNavUser /></div>
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
