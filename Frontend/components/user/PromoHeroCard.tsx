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

const sizeConfig = {
  sm: {
    width: 'w-[152px]',
    imageSizes: '152px',
    content: 'px-2.5 pb-2.5 pt-2',
    title: 'text-[12px] leading-[1.12]',
    unit: 'text-[10px]',
    subtitle: 'text-[9px]',
    chf: 'text-[9px]',
    price: 'text-[16px]',
    originalPrice: 'text-[9px]',
    badge: 'px-2 py-0.5 text-[8px]',
    button: 'h-9 w-9',
    plus: 'h-4 w-4',
    qty: 'h-6 min-w-6 text-[10px]',
    carouselGap: 12,
  },
  lg: {
    width: 'w-[248px]',
    imageSizes: '248px',
    content: 'px-4 pb-4 pt-3',
    title: 'text-[15px] leading-[1.15]',
    unit: 'text-[12px]',
    subtitle: 'text-[11px]',
    chf: 'text-[11px]',
    price: 'text-[22px]',
    originalPrice: 'text-[11px]',
    badge: 'px-2.5 py-1 text-[9px]',
    button: 'h-10 px-3',
    buttonText: 'text-[11px]',
    plus: 'h-4 w-4',
    qty: 'h-7 min-w-7 text-[11px]',
    carouselGap: 16,
  },
} as const

function PromoHeroCard({
  product,
  size = 'sm',
}: {
  product: Product
  size?: Size
}) {
  const { addToCart, cartItems } = useCartStore()
  const qty = cartItems.find((i) => i.product.id === product.id)?.quantity ?? 0
  const cfg = sizeConfig[size]
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
      className={`relative flex ${cfg.width} shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-gray-100/90 bg-white shadow-card aspect-square ${size === 'lg' ? 'shadow-[0_8px_24px_rgba(17,24,39,0.08)]' : ''}`}
    >
      {/* Bild oben */}
      <div className="relative min-h-0 flex-[1.12] w-full bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes={cfg.imageSizes}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
        )}

        <div className="absolute left-2 top-2 flex max-w-[calc(100%-0.5rem)] items-center gap-1">
          <span
            className={`max-w-[72%] shrink-0 truncate rounded-full font-extrabold uppercase tracking-wide text-white ${cfg.badge} ${kindBadgeClass[kind]}`}
          >
            {badgeLabel}
          </span>
          {(onSale || percent > 0) && (
            <span className={`shrink-0 rounded-full bg-[#EF4444] font-extrabold text-white ${cfg.badge}`}>
              −{percent}%
            </span>
          )}
        </div>

        {qty > 0 && (
          <span className={`absolute right-2 top-2 grid place-items-center rounded-full bg-brand-500 px-1.5 font-extrabold text-white shadow-soft ring-2 ring-white ${cfg.qty}`}>
            ×{qty}
          </span>
        )}
      </div>

      {/* Inhalt unten */}
      <div className={`flex min-h-0 flex-1 flex-col justify-between ${cfg.content}`}>
        <div className="min-w-0">
          <h3 className={`truncate font-extrabold text-gray-900 ${cfg.title}`}>
            {product.name}
          </h3>
          {product.unit && (
            <p className={`mt-0.5 truncate font-medium text-gray-500 ${cfg.unit}`}>{product.unit}</p>
          )}
          <p className={`mt-0.5 truncate text-gray-400 ${cfg.subtitle}`}>{subtitle}</p>
        </div>

        <div className="mt-1.5 grid grid-cols-[1fr_auto] items-end gap-2">
          <div className="min-w-0">
            <div className="flex items-end gap-2">
              <div className="flex flex-col leading-none">
                <span className={`font-bold text-[#EF4444] ${cfg.chf}`}>CHF</span>
                <span className={`font-extrabold leading-none tabular-nums text-[#EF4444] ${cfg.price}`}>
                  {formatSwissPrice(displayPrice)}
                </span>
              </div>
              {onSale && (
                <span className={`pb-0.5 tabular-nums text-gray-400 line-through whitespace-nowrap ${cfg.originalPrice}`}>
                  CHF {formatSwissPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`shrink-0 rounded-full bg-brand-500 text-white shadow-[0_4px_14px_rgba(37,208,118,0.38)] transition-transform active:scale-95 ${
              size === 'lg'
                ? `flex items-center justify-center gap-1 ${cfg.button}`
                : `grid place-items-center ${cfg.button}`
            }`}
            aria-label={addLabel}
          >
            <Plus className={`${cfg.plus} shrink-0`} strokeWidth={2.5} />
            {size === 'lg' && (
              <span className={`whitespace-nowrap font-extrabold leading-none ${sizeConfig.lg.buttonText}`}>
                In Korb
              </span>
            )}
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
  const gap = sizeConfig[size].carouselGap

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
      const cardW = first.offsetWidth + gap
      const half = el.scrollWidth / 2
      const pos = el.scrollLeft % half
      setActiveIdx(Math.round(pos / cardW) % products.length)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    const id = window.setInterval(() => {
      if (pausedRef.current || document.hidden) return
      const first = el.firstElementChild as HTMLElement | null
      if (!first) return
      const step = first.offsetWidth + gap
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
  }, [loop, autoPlayMs, products.length, gap])

  if (products.length === 0) return null

  return (
    <div>
      <div
        ref={scrollerRef}
        className={`-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 pb-2 scrollbar-none ${size === 'lg' ? 'gap-4 pt-1' : 'gap-3'}`}
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
