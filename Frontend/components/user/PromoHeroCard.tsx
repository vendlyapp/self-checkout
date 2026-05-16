'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Package } from 'lucide-react'
import { Product } from '@/components/dashboard/products_list/data/mockProducts'
import { useCartStore } from '@/lib/stores/cartStore'
import { formatSwissPrice } from '@/lib/utils'

const kindClass: Record<string, string> = {
  weekly: 'bg-amber-100 text-amber-800',
  daily: 'bg-orange-100 text-orange-800',
  flash: 'bg-red-100 text-red-700',
  seasonal: 'bg-emerald-100 text-emerald-800',
  default: 'bg-gray-100 text-gray-700',
}
const kindLabel: Record<string, string> = {
  weekly: 'Wochenangebot',
  daily: 'Tagesaktion',
  flash: 'Flash-Deal',
  seasonal: 'Saisonal',
  default: 'Aktion',
}

function getKind(product: Product): string {
  const title = (product.promotionTitle || '').toLowerCase()
  if (title.includes('flash')) return 'flash'
  if (title.includes('tag') || title.includes('daily')) return 'daily'
  if (title.includes('week') || title.includes('woche')) return 'weekly'
  if (title.includes('saison') || title.includes('season')) return 'seasonal'
  return 'default'
}

type Size = 'sm' | 'lg'

function PromoHeroCard({
  product,
  size = 'sm',
}: {
  product: Product
  size?: Size
}) {
  const { addToCart, cartItems } = useCartStore()
  const qty = cartItems.find((i) => i.product.id === product.id)?.quantity ?? 0
  const kind = getKind(product)

  const onSale = !!product.originalPrice && product.originalPrice > product.price
  const percent = onSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : product.discountPercentage ?? 0
  const displayPrice = product.price

  const handleAdd = () => addToCart(product, 1)

  const addLabel =
    qty > 0 ? `${product.name}, noch eins hinzufügen` : `${product.name} in den Warenkorb`

  if (size === 'lg') {
    return (
      <article className="relative flex w-[85%] shrink-0 snap-center flex-col overflow-hidden rounded-xl bg-white shadow-card sm:w-[300px]">
        <div className="relative h-32 w-full bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="300px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          )}
          <div className="absolute left-2 top-2 flex max-w-[calc(100%-3rem)] items-center gap-1">
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${kindClass[kind]}`}>
              {kindLabel[kind]}
            </span>
            {(onSale || percent > 0) && (
              <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-soft">
                −{percent}%
              </span>
            )}
          </div>
          {qty > 0 && (
            <span className="absolute right-2 top-2 grid h-7 min-w-7 place-items-center rounded-full bg-brand-500 px-1.5 text-xs font-extrabold text-white shadow-soft ring-2 ring-white">
              ×{qty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 p-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-gray-900">{product.name}</h3>
            <p className="truncate text-xs text-gray-400">{product.unit}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-red-600 leading-none tabular-nums">
                CHF {formatSwissPrice(displayPrice)}
              </span>
              {onSale && (
                <span className="text-[11px] text-gray-400 line-through tabular-nums">
                  CHF {formatSwissPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-500 text-white shadow-soft active:scale-95 transition-transform"
            aria-label={addLabel}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="relative flex w-[82%] shrink-0 snap-center items-center gap-2.5 overflow-hidden rounded-xl bg-white p-2.5 shadow-card sm:w-[300px]">
      <div className="relative h-[72px] w-[72px] flex-shrink-0">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="72px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-7 w-7 text-gray-300" />
            </div>
          )}
        </div>
        {qty > 0 && (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-extrabold text-white shadow-soft ring-2 ring-white">
            ×{qty}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 overflow-hidden">
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${kindClass[kind]}`}>
            {kindLabel[kind]}
          </span>
          {(onSale || percent > 0) && (
            <span className="shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              −{percent}%
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm font-bold text-gray-900">{product.name}</p>
        <p className="truncate text-[11px] text-gray-400">{product.unit}</p>
        <div className="mt-0.5 flex items-baseline gap-1">
          <span className="text-sm font-extrabold text-red-600 leading-none tabular-nums">
            CHF {formatSwissPrice(displayPrice)}
          </span>
          {onSale && (
            <span className="text-[10px] text-gray-400 line-through tabular-nums">
              CHF {formatSwissPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-brand-500 text-white shadow-soft active:scale-95 transition-transform"
        aria-label={addLabel}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </article>
  )
}

export function PromoCarousel({
  products,
  size = 'sm',
  autoPlayMs = 4500,
  showDots = false,
}: {
  products: Product[]
  size?: Size
  autoPlayMs?: number
  showDots?: boolean
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const loop = products.length > 1
  const items = loop ? [...products, ...products] : products

  useEffect(() => {
    const el = scrollerRef.current
    if (!el || !loop) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pause = () => {
      pausedRef.current = true
    }
    const resume = () => {
      pausedRef.current = false
    }
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('touchend', resume, { passive: true })
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)

    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null
      if (!first) return
      const cardW = first.offsetWidth + 10
      const half = el.scrollWidth / 2
      const pos = el.scrollLeft % half
      setActiveIdx(Math.round(pos / cardW) % products.length)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return
      const first = el.firstElementChild as HTMLElement | null
      if (!first) return
      const step = first.offsetWidth + 10
      const half = el.scrollWidth / 2
      if (el.scrollLeft + step >= half - 4) {
        el.scrollTo({ left: el.scrollLeft - half, behavior: 'auto' })
        requestAnimationFrame(() => {
          el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' })
        })
      } else {
        el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' })
      }
    }, autoPlayMs)

    return () => {
      window.clearInterval(id)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend', resume)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('scroll', onScroll)
    }
  }, [loop, autoPlayMs, products.length])

  if (products.length === 0) return null

  return (
    <div>
      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product, i) => (
          <PromoHeroCard key={`${product.id}-${i}`} product={product} size={size} />
        ))}
      </div>
      {showDots && products.length > 1 && (
        <div className="mt-1.5 flex justify-center gap-1.5">
          {products.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-5 bg-gray-900' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PromoHeroCard
