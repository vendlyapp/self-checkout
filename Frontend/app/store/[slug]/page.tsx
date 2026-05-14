'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useEffect, useRef } from 'react'
import { Search, ScanLine, Flame, ShoppingBag, ScanBarcode, Store as StoreIcon } from 'lucide-react'
import Link from 'next/link'

import { useStoreData } from '@/hooks/data/useStoreData'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { useStorePromotions } from '@/hooks/queries/useStorePromotions'
import { useAuth } from '@/lib/auth/AuthContext'
import { useCartStore } from '@/lib/stores/cartStore'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { useStoreContext } from './StoreContext'
import { getIcon } from '@/components/dashboard/products_list/data/iconMap'
import { Product, normalizeProductData } from '@/components/dashboard/products_list/data/mockProducts'
import ProductCard from '@/components/dashboard/charge/ProductCard'
import { PromoCarousel } from '@/components/user/PromoHeroCard'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StoreProductsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { store, isLoading: storeLoading } = useStoreData({ slug, autoLoad: true })
  const { loading: authLoading, session } = useAuth()
  const { addToCart } = useCartStore()
  const { store: scannedStore } = useScannedStoreStore()
  const storeContext = useStoreContext()

  const { data: rawProducts = [], isLoading: productsLoading, isFetching: productsFetching } = useStoreProducts({
    slug: store?.slug || '',
    enabled: !!store?.slug,
  })
  const { data: promoProducts = [] } = useStorePromotions({
    slug: store?.slug || '',
    enabled: !!store?.slug,
  })

  const isCategoriesPending = !authLoading && !!session && (false) // categories already cached
  const isProductsPending = !!store?.slug && (productsLoading || productsFetching)
  const shouldShowPageLoader = storeLoading || !store || isProductsPending

  // Agrupar variantes
  const groupProductsWithVariants = useCallback((products: Product[]): Product[] => {
    const parentProducts: Product[] = []
    const variantsMap = new Map<string, Product[]>()
    products.forEach(product => {
      if (product.parentId) {
        if (!variantsMap.has(product.parentId)) variantsMap.set(product.parentId, [])
        variantsMap.get(product.parentId)!.push(product)
      } else {
        parentProducts.push(product)
      }
    })
    return parentProducts.map(parent => ({
      ...parent,
      variants: variantsMap.get(parent.id) || undefined
    }))
  }, [])

  const allProducts = useMemo(() => {
    if (!rawProducts || rawProducts.length === 0) return []
    return groupProductsWithVariants(rawProducts)
  }, [rawProducts, groupProductsWithVariants])

  // Derivar categorías directamente de los productos — sin auth requerida
  const categoryFilters = useMemo(() => {
    if (allProducts.length === 0) return []
    const seen = new Map<string, { name: string; count: number }>()
    for (const p of allProducts) {
      if (!p.categoryId) continue
      const entry = seen.get(p.categoryId)
      if (entry) entry.count++
      else seen.set(p.categoryId, { name: p.category || p.categoryId, count: 1 })
    }
    if (seen.size === 0) return []
    return [
      { id: 'all', label: 'Alle', icon: getIcon('ShoppingCart'), count: allProducts.length },
      ...Array.from(seen.entries()).map(([id, { name, count }]) => ({
        id,
        label: name,
        icon: getIcon('Package'),
        count,
      })),
    ]
  }, [allProducts])

  const prevFiltersRef = useRef<string>('')
  useEffect(() => {
    const str = JSON.stringify(categoryFilters)
    if (prevFiltersRef.current !== str) {
      prevFiltersRef.current = str
      storeContext.setCategoryFilters(categoryFilters)
    }
  }, [categoryFilters, storeContext])

  // Productos filtrados
  const products = useMemo(() => {
    if (!scannedStore || allProducts.length === 0) return []
    let filtered = [...allProducts]
    const activeCategoryFilters = storeContext.selectedFilters.filter(id => id !== 'all')
    if (activeCategoryFilters.length > 0) {
      filtered = filtered.filter(p => activeCategoryFilters.includes(p.categoryId))
    }
    if (storeContext.searchQuery.trim()) {
      const q = storeContext.searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q))) ||
        p.variants?.some(v => v.name.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [scannedStore, allProducts, storeContext.selectedFilters, storeContext.searchQuery])

  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    addToCart(product, quantity)
  }, [addToCart])

  const isMainCategory = storeContext.selectedFilters.includes('all') && !storeContext.searchQuery

  if (shouldShowPageLoader) {
    return <DashboardLoadingState mode="page" message="Produkte werden geladen..." className="animate-page-enter" />
  }

  // Tienda cerrada
  if (store?.isOpen === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <StoreIcon className="w-12 h-12 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Geschäft geschlossen</h2>
        <p className="text-gray-500 max-w-sm">{store.name} ist zur Zeit geschlossen.</p>
      </div>
    )
  }

  // Sin tienda
  if (!scannedStore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Kein Geschäft ausgewählt</h2>
        <button
          onClick={storeContext.onScanQR}
          className="flex items-center gap-2 px-6 py-3 bg-[#25D076] text-white rounded-xl font-semibold shadow-soft"
        >
          <ScanBarcode className="w-5 h-5" />
          Jetzt scannen
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Sticky search + scan bar */}
      <section
        className="sticky z-20 -mx-0 bg-background-cream px-4 py-3"
        style={{ top: 'var(--brand-strip-h, 0px)' }}
      >
        <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-card focus-within:ring-2 focus-within:ring-[#25D076] transition-shadow">
          <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-3">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" strokeWidth={2.2} />
            <input
              type="text"
              inputMode="search"
              value={storeContext.searchQuery}
              placeholder="Produkte suchen …"
              onChange={(e) => storeContext.onSearch(e.target.value)}
              onFocus={() => router.push(`/store/${slug}/search`)}
              className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
              readOnly
            />
          </label>
          <Link
            href={`/store/${slug}/scan`}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-[#25D076] px-4 py-3 text-sm font-semibold text-white shadow-soft active:scale-95 transition-transform"
          >
            <ScanLine className="h-5 w-5" strokeWidth={2.2} />
            Scan
          </Link>
        </div>
      </section>

      {/* Promociones carousel — solo en "Alle" sin búsqueda */}
      {isMainCategory && promoProducts.length > 0 && (
        <section className="mt-1 mb-2">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
              <Flame className="h-4 w-4 text-red-500" /> Aktionen
            </h2>
            <Link href={`/store/${slug}/promotion`} className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-gray-700 shadow-soft">
              Alle →
            </Link>
          </div>
          <div className="px-4">
            <PromoCarousel products={promoProducts} size="sm" />
          </div>
        </section>
      )}

      {/* Contador productos */}
      <div className="flex items-center justify-between px-4 mb-2 mt-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
          {products.length} {products.length === 1 ? 'Produkt' : 'Produkte'}
        </h2>
        {!isMainCategory && (
          <button
            onClick={() => { storeContext.onSearch(''); storeContext.onFilterChange(['all']) }}
            className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-gray-700 shadow-soft"
          >
            Alle anzeigen
          </button>
        )}
      </div>

      {/* Lista productos */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center py-16 px-8 text-center">
          <StoreIcon className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            {storeContext.searchQuery ? `Keine Produkte für "${storeContext.searchQuery}"` : 'Keine Produkte verfügbar'}
          </p>
        </div>
      ) : (
        <div className="px-4 pb-32 space-y-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
