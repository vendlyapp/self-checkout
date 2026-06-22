'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { type BuyerProduct as Product } from '@/lib/storefront/product'
import { useCartStore } from '@/lib/stores/cartStore'
import { formatSwissPrice } from '@/lib/utils'

const kindBadgeClass: Record<string, string> = {
  weekly: 'bg-[#8B5E3C]',
  daily: 'bg-[#B45309]',
  flash: 'bg-[#B91C1C]',
  seasonal: 'bg-[#047857]',
  default: 'bg-[#766B6A]',
}

const kindBadgeLabel: Record<string, string> = {
  weekly: 'WOCHEN-HIT',
  daily: 'TAGES-HIT',
  flash: 'FLASH',
  seasonal: 'SAISON',
  default: 'AKTION',
}

const kindSubtitle: Record<string, string> = {
  weekly: 'Wochen-Hit',
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

const cardWidth: Record<Size, string> = {
  sm: 'w-[158px]',
  lg: 'w-[200px] sm:w-[220px]',
}

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

  const badgeLabel = product.promotionBadge?.trim() || kindBadgeLabel[kind]
  const subtitle =
    product.promotionTitle?.trim() ||
    `${kindSubtitle[kind]} · direkt vom Hof`
  const actionLabel = product.promotionActionLabel?.trim() || 'In Korb'
  const [actionTop, actionBottom] = actionLabel.includes(' ')
    ? actionLabel.split(' ', 2)
    : [actionLabel, '']

  const handleAdd = () => {
    addToCart(product, 1)
    toast.success('Zum Warenkorb hinzugefügt', {
      id: `promo-add-${product.id}-${Date.now()}`,
      description: product.name,
      duration: 2200,
    })
  }

  const addLabel =
    qty > 0 ? `${product.name}, noch eins hinzufügen` : `${product.name} in den Warenkorb`

  return (
    <article
      className={`relative flex ${cardWidth[size]} shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-gray-100/90 bg-white shadow-card aspect-square`}
    >
      {/* Bild oben */}
      <div className="relative min-h-0 flex-[1.12] w-full bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes={size === 'sm' ? '158px' : '220px'}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex max-w-[calc(100%-0.5rem)] items-center gap-1">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white ${kindBadgeClass[kind]}`}
          >
            {badgeLabel}
          </span>
          {(onSale || percent > 0) && (
            <span className="shrink-0 rounded-full bg-[#EF4444] px-2 py-0.5 text-[8px] font-extrabold text-white">
              −{percent}%
            </span>
          )}
        </div>

        {qty > 0 && (
          <span className="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand-500 px-1.5 text-[10px] font-extrabold text-white shadow-soft ring-2 ring-white">
            ×{qty}
          </span>
        )}
      </div>

      {/* Inhalt unten */}
      <div className="flex min-h-0 flex-1 flex-col justify-between px-3 pb-3 pt-2">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-extrabold leading-tight text-gray-900">
            {product.name}
          </h3>
          {product.unit && (
            <p className="mt-0.5 truncate text-[11px] font-medium text-gray-500">{product.unit}</p>
          )}
          <p className="mt-0.5 truncate text-[10px] text-gray-400">{subtitle}</p>
        </div>

        <div className="mt-1.5 flex items-end justify-between gap-1">
          <div className="flex min-w-0 items-end gap-1">
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-bold text-[#EF4444]">CHF</span>
              <span className="text-[17px] font-extrabold leading-none tabular-nums text-[#EF4444]">
                {formatSwissPrice(displayPrice)}
              </span>
            </div>
            {onSale && (
              <span className="pb-0.5 text-[10px] tabular-nums text-gray-400 line-through whitespace-nowrap">
                CHF {formatSwissPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex h-[38px] shrink-0 items-center gap-0.5 rounded-full bg-brand-500 pl-2 pr-2.5 text-white shadow-[0_4px_14px_rgba(37,208,118,0.38)] transition-transform active:scale-95"
            aria-label={addLabel}
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
            <span className="text-left text-[10px] font-extrabold leading-[1.05]">
              {actionBottom ? (
                <>
                  {actionTop}
                  <br />
                  {actionBottom}
                </>
              ) : (
                actionTop
              )}
            </span>
          </button>
        </div>
      </div>
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
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-5 bg-gray-900' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PromoHeroCard
