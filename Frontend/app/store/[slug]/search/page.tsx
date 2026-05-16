'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Search, X, ScanLine, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { useStoreData } from '@/hooks/data/useStoreData'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { useCartStore } from '@/lib/stores/cartStore'
import { Product, normalizeProductData } from '@/components/dashboard/products_list/data/mockProducts'
import ProductCard from '@/components/dashboard/charge/ProductCard'
import { buildApiUrl } from '@/lib/config/api'
import { devError } from '@/lib/utils/logger'

const STORAGE_KEY = 'vendly-recent-searches'
const POPULAR_TERMS = ['Äpfel', 'Brot', 'Milch', 'Käse', 'Tomaten', 'Honig']

function loadRecent(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function StoreSearchPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const { store } = useStoreData({ slug, autoLoad: true })
  const { addToCart } = useCartStore()

  const [q, setQ] = useState('')
  const [recent, setRecent] = useState<string[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setRecent(loadRecent()) }, [])

  // Foco automático al abrir
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(t)
  }, [])

  // Cargar productos de la tienda para buscar
  useEffect(() => {
    if (!store?.slug) return
    const load = async () => {
      try {
        const url = buildApiUrl(`/api/store/${store.slug}/products`)
        const res = await fetch(url)
        const result = await res.json()
        if (result.success && result.data) {
          const normalized = result.data.map((p: unknown) => normalizeProductData(p as Product))
          // Agrupar variantes
          const parentProducts: Product[] = []
          const variantsMap = new Map<string, Product[]>()
          normalized.forEach((product: Product) => {
            if (product.parentId) {
              if (!variantsMap.has(product.parentId)) variantsMap.set(product.parentId, [])
              variantsMap.get(product.parentId)!.push(product)
            } else {
              parentProducts.push(product)
            }
          })
          setAllProducts(parentProducts.map(parent => ({
            ...parent,
            variants: variantsMap.get(parent.id) || undefined
          })))
        }
      } catch (e) { devError('search load error', e) }
    }
    load()
  }, [store?.slug])

  const persistRecent = (term: string) => {
    const t = term.trim()
    if (!t) return
    const next = [t, ...recent.filter(r => r.toLowerCase() !== t.toLowerCase())].slice(0, 6)
    setRecent(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { }
  }

  const clearRecent = () => {
    setRecent([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(term))) ||
      p.variants?.some(v => v.name.toLowerCase().includes(term))
    )
  }, [q, allProducts])

  const handleAddToCart = useCallback((product: Product, quantity: number) => {
    addToCart(product, quantity)
  }, [addToCart])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    persistRecent(q)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8">
      {/* Search + scan bar */}
      <section
        className="sticky z-20 -mx-4 bg-background-cream px-4 py-3"
        style={{ top: 'var(--brand-strip-h, 0px)' }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-card focus-within:ring-2 focus-within:ring-[#25D076] transition-shadow"
        >
          <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-3">
            <Search className="h-5 w-5 text-gray-400 flex-shrink-0" strokeWidth={2.2} />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              onBlur={() => persistRecent(q)}
              placeholder="Produkte suchen …"
              className="ios-input-fix w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:text-gray-400"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} aria-label="Leeren" className="text-gray-400 flex-shrink-0">
                <X className="h-5 w-5" />
              </button>
            )}
          </label>
          <Link
            href={`/store/${slug}/scan`}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-[#25D076] px-4 py-3 text-sm font-semibold text-white shadow-soft active:scale-95"
          >
            <ScanLine className="h-5 w-5" strokeWidth={2.2} />
            Scan
          </Link>
        </form>
      </section>

      {!q.trim() ? (
        <>
          {/* Búsquedas recientes */}
          {recent.length > 0 && (
            <section className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400" /> Letzte Suchen
                </h2>
                <button onClick={clearRecent} className="text-sm font-medium text-gray-400">Löschen</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map(r => (
                  <button
                    key={r}
                    onClick={() => setQ(r)}
                    className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-soft"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Populares */}
          <section className="mt-5">
            <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-gray-700">
              <TrendingUp className="h-4 w-4 text-[#25D076]" /> Beliebte Suchen
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_TERMS.map(t => (
                <button
                  key={t}
                  onClick={() => { setQ(t); persistRecent(t) }}
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 shadow-soft"
                >
                  {t}
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="mt-3 mb-3">
            <p className="text-sm text-gray-400 font-medium">{filtered.length} Treffer</p>
          </div>

          <div className="space-y-2">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-gray-400">
              Nichts gefunden.{' '}
              <Link href={`/store/${slug}`} className="text-[#25D076] font-semibold">Zum Sortiment</Link>
            </p>
          )}
        </>
      )}
    </div>
  )
}
