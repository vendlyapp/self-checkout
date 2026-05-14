'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Package } from 'lucide-react'
import { Product } from '@/components/dashboard/products_list/data/mockProducts'
import { useCartStore } from '@/lib/stores/cartStore'
import { formatSwissPrice } from '@/lib/utils'

// Etiquetas y colores por tipo de promo (mismos tokens que Lovable)
const kindClass: Record<string, string> = {
  weekly:    'bg-amber-100 text-amber-800',
  daily:     'bg-orange-100 text-orange-800',
  flash:     'bg-red-100 text-red-700',
  seasonal:  'bg-emerald-100 text-emerald-800',
  default:   'bg-gray-100 text-gray-700',
}
const kindLabel: Record<string, string> = {
  weekly:   'Wochenangebot',
  daily:    'Tagesaktion',
  flash:    'Flash-Deal',
  seasonal: 'Saisonal',
  default:  'Aktion',
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
  const qty = cartItems.find(i => i.product.id === product.id)?.quantity ?? 0
  const kind = getKind(product)

  const onSale = !!product.originalPrice && product.originalPrice > product.price
  const percent = onSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : product.discountPercentage ?? 0
  const displayPrice = product.price

  const handleAdd = () => addToCart(product, 1)

  if (size === 'lg') {
    return (
      <article className="relative flex w-[92%] shrink-0 snap-center flex-col overflow-hidden rounded-2xl bg-white shadow-card sm:w-[420px]">
        {/* Imagen */}
        <div className="relative h-44 w-full bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="420px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
          )}
          {/* Badges top-left */}
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${kindClass[kind]}`}>
              {kindLabel[kind]}
            </span>
            {(onSale || percent > 0) && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-soft">
                −{percent}%
              </span>
            )}
          </div>
          {/* Badge cantidad */}
          {qty > 0 && (
            <span className="absolute right-3 top-3 grid h-9 min-w-9 place-items-center rounded-full bg-[#25D076] px-2 text-base font-extrabold text-white shadow-soft ring-2 ring-white">
              ×{qty}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-gray-900">{product.name}</h3>
          <p className="text-sm font-medium text-gray-400">{product.unit}</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-red-600 leading-none">
                CHF {formatSwissPrice(displayPrice)}
              </span>
              {onSale && (
                <span className="text-sm text-gray-400 line-through">
                  CHF {formatSwissPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd}
              className="flex h-12 items-center gap-1.5 rounded-full bg-[#25D076] px-5 text-base font-bold text-white shadow-soft active:scale-95 transition-transform"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
              {qty > 0 ? 'Noch eins' : 'In Korb'}
            </button>
          </div>
        </div>
      </article>
    )
  }

  // Size "sm" — card horizontal compacta
  return (
    <article className="relative flex w-[88%] shrink-0 snap-center items-center gap-3 overflow-hidden rounded-xl bg-white p-3 shadow-card sm:w-[340px]">
      {/* Imagen */}
      <div className="relative h-24 w-24 flex-shrink-0">
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        {qty > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-7 min-w-7 place-items-center rounded-full bg-[#25D076] px-1.5 text-xs font-extrabold text-white shadow-soft ring-2 ring-white">
            ×{qty}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${kindClass[kind]}`}>
            {kindLabel[kind]}
          </span>
          {(onSale || percent > 0) && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
              −{percent}%
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-base font-bold leading-tight text-gray-900">{product.name}</p>
        <p className="text-xs font-medium text-gray-400">{product.unit}</p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold text-red-600 leading-none">
            CHF {formatSwissPrice(displayPrice)}
          </span>
          {onSale && (
            <span className="text-xs text-gray-400 line-through">
              CHF {formatSwissPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Botón + */}
      <button
        onClick={handleAdd}
        className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-[#25D076] text-white shadow-soft active:scale-95 transition-transform"
        aria-label={`${product.name} hinzufügen`}
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </article>
  )
}

// Carousel con autoplay suave — igual que Lovable PromoCarousel
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

    const pause = () => { pausedRef.current = true }
    const resume = () => { pausedRef.current = false }
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('touchend', resume, { passive: true })
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)

    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null
      if (!first) return
      const cardW = first.offsetWidth + 12
      const half = el.scrollWidth / 2
      const pos = el.scrollLeft % half
      setActiveIdx(Math.round(pos / cardW) % products.length)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return
      const first = el.firstElementChild as HTMLElement | null
      if (!first) return
      const step = first.offsetWidth + 12
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
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-6 bg-gray-900' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PromoHeroCard
