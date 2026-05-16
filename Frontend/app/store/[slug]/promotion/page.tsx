'use client'

import { useParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { Percent } from 'lucide-react'
import { useStoreData } from '@/hooks/data/useStoreData'
import { useStorePromotions } from '@/hooks/queries/useStorePromotions'
import { useCartStore } from '@/lib/stores/cartStore'
import { Product } from '@/components/dashboard/products_list/data/mockProducts'
import ProductCard from '@/components/dashboard/charge/ProductCard'
import { PromoCarousel } from '@/components/user/PromoHeroCard'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'
import { Loader } from '@/components/ui/Loader'

export default function StorePromotionPage() {
  const params = useParams()
  const slug = params.slug as string
  const { store, isLoading: storeLoading } = useStoreData({ slug, autoLoad: true })
  const { data: products = [], isLoading, isFetching } = useStorePromotions({
    slug: store?.slug || '',
    enabled: !!store?.slug,
  })
  const { addToCart } = useCartStore()
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    addToCart(product, quantity)
  }, [addToCart])

  // Solo bloquear si no hay datos en absoluto
  const loading = isLoading && products.length === 0

  // Categorías derivadas de productos en promoción
  const categoryFilters = useMemo(() => {
    if (products.length === 0) return []
    const seen = new Map<string, { name: string; count: number }>()
    for (const p of products) {
      if (!p.categoryId) continue
      const entry = seen.get(p.categoryId)
      if (entry) entry.count++
      else seen.set(p.categoryId, { name: p.category || p.categoryId, count: 1 })
    }
    if (seen.size === 0) return []
    return [
      { id: 'all', label: 'Alle', count: products.length },
      ...Array.from(seen.entries()).map(([id, { name, count }]) => ({ id, label: name, count })),
    ]
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return products
    return products.filter((p: Product) => p.categoryId === activeFilter)
  }, [products, activeFilter])

  if (storeLoading || !store) {
    return <DashboardLoadingState mode="page" message="Aktionen werden geladen..." className="animate-page-enter" />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-10">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-extrabold text-gray-900">Aktionen</h1>
        {products.length > 0 && (
          <span className="text-sm font-medium text-gray-400">{products.length} reduziert</span>
        )}
      </div>

      {/* Carousel hero */}
      {products.length > 0 && (
        <section className="mt-4 -mx-4">
          <PromoCarousel products={products} size="sm" showDots />
        </section>
      )}

      {/* Sección lista */}
      {products.length > 0 && (
        <>
          <div className="mt-6 flex items-baseline justify-between">
            <h2 className="text-base font-bold text-gray-900">Weitere Aktionen</h2>
            <span className="text-xs font-medium text-gray-400">{filteredProducts.length} Artikel</span>
          </div>

          {/* Chips filtro categoría */}
          {categoryFilters.length > 0 && (
            <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryFilters.map(({ id, label, count }) => {
                const active = activeFilter === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(active && id !== 'all' ? 'all' : id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 ${
                      active
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Lista */}
      {loading ? (
        <div className="mt-6 py-12 text-center">
          <Loader size="md" className="mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Percent className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-700">Keine Aktionen verfügbar</p>
          <p className="max-w-xs text-sm text-gray-400">Derzeit gibt es keine Produkte im Angebot.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-gray-500">Keine Aktionen in dieser Kategorie.</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-bold text-white"
          >
            Alle Aktionen zeigen
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
