'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { type BuyerProduct as Product } from '@/lib/storefront/product'
import { useCartStore } from '@/lib/stores/cartStore'
import { formatSwissPrice } from '@/lib/utils'

const PROMO_RED = '#E53935'

const kindBadgeClass: Record<string, string> = {
  weekly: 'bg-[#8B5E3C]',
  daily: 'bg-[#B45309]',
  flash: 'bg-[#B91C1C]',
  seasonal: 'bg-[#047857]',
  default: 'bg-warm-800',
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
    width: 'w-[156px]',
    imageSizes: '156px',
    imageFlex: 'flex-[1.18]',
    content: 'px-3 pb-3 pt-2.5',
    title: 'text-[12px] leading-[1.15] tracking-tight',
    unit: 'text-[10px]',
    subtitle: 'text-[9px] leading-snug',
    chf: 'text-[8px] tracking-wide',
    price: 'text-[15px]',
    originalPrice: 'text-[9px]',
    badge: 'px-2 py-[3px] text-[7.5px] tracking-[0.06em]',
    fab: 'h-10 w-10',
    plus: 'h-[18px] w-[18px]',
    carouselGap: 12,
  },
  lg: {
    width: 'w-[252px]',
    imageSizes: '252px',
    imageFlex: 'flex-[1.2]',
    content: 'px-4 pb-4 pt-3.5',
    title: 'text-[15px] leading-[1.18] tracking-tight',
    unit: 'text-[12px]',
    subtitle: 'text-[11px] leading-snug',
    chf: 'text-[10px] tracking-wide',
    price: 'text-[22px]',
    originalPrice: 'text-[11px]',
    badge: 'px-2.5 py-1 text-[9px] tracking-[0.05em]',
    button: 'h-10 px-3.5',
    buttonText: 'text-[11px]',
    plus: 'h-4 w-4',
    qty: 'h-7 min-w-7 text-[11px]',
    carouselGap: 16,
  },
} as const

const cardShell =
  'relative flex shrink-0 snap-center flex-col overflow-hidden rounded-[18px] bg-white aspect-square ' +
  'shadow-[0_2px_10px_rgba(118,107,106,0.07),0_0_0_1px_rgba(118,107,106,0.05)] ' +
  'transition-[box-shadow,transform] duration-300 ease-out'

const addBtnBase =
  'rounded-full bg-brand-500 text-white transition-[transform,background-color,box-shadow] duration-200 ' +
  'hover:bg-brand-600 active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2'

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
  const isLg = size === 'lg'
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
      className={`${cardShell} ${cfg.width} ${isLg ? 'shadow-[0_10px_32px_rgba(118,107,106,0.1),0_0_0_1px_rgba(118,107,106,0.06)]' : ''}`}
    >
      {/* Bild */}
      <div className={`relative min-h-0 ${cfg.imageFlex} w-full bg-warm-300/40`}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes={cfg.imageSizes}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-warm-300/30">
            <Package className="h-8 w-8 text-warm-500/60" strokeWidth={1.5} />
          </div>
        )}

        {/* Tiefe + Lesbarkeit der Badges */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10"
          aria-hidden
        />

        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-1rem)] items-center gap-1">
          <span
            className={`max-w-[68%] shrink-0 truncate rounded-full font-extrabold uppercase text-white shadow-sm ${cfg.badge} ${kindBadgeClass[kind]}`}
          >
            {badgeLabel}
          </span>
          {(onSale || percent > 0) && (
            <span
              className={`shrink-0 rounded-full bg-[#EF4444] font-extrabold text-white shadow-sm ${cfg.badge}`}
            >
              −{percent}%
            </span>
          )}
        </div>

        {qty > 0 && isLg && (
          <span
            className={`absolute right-2.5 top-2.5 grid place-items-center rounded-full bg-brand-500 px-1.5 font-extrabold text-white shadow-md ring-2 ring-white ${'qty' in cfg ? cfg.qty : ''}`}
          >
            ×{qty}
          </span>
        )}
      </div>

      {/* sm: FAB auf der Naht Bild/Inhalt — mittig rechts */}
      {!isLg && (
        <button
          type="button"
          onClick={handleAdd}
          className={`absolute right-2.5 top-[52%] z-20 grid -translate-y-1/2 place-items-center shadow-[0_6px_18px_rgba(37,208,118,0.42)] ring-[3px] ring-white ${addBtnBase} ${'fab' in cfg ? cfg.fab : ''}`}
          aria-label={addLabel}
        >
          <Plus className={`${cfg.plus} shrink-0`} strokeWidth={2.75} />
          {qty > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-warm-800 px-1 text-[9px] font-extrabold text-white ring-2 ring-white">
              {qty}
            </span>
          )}
        </button>
      )}

      {/* Inhalt */}
      <div
        className={`flex min-h-0 flex-1 flex-col justify-between border-t border-warm-300/70 bg-[#FAF8F6] ${cfg.content} ${!isLg ? 'pr-12' : ''}`}
      >
        <div className="min-w-0 space-y-0.5">
          <h3 className={`line-clamp-2 font-extrabold text-warm-900 ${cfg.title}`}>
            {product.name}
          </h3>
          {product.unit && (
            <p className={`truncate font-semibold text-warm-700/80 ${cfg.unit}`}>{product.unit}</p>
          )}
          <p className={`truncate text-warm-600/70 ${cfg.subtitle}`}>{subtitle}</p>
        </div>

        <div className={isLg ? 'mt-2 grid grid-cols-[1fr_auto] items-end gap-2.5' : 'mt-2'}>
          <div className="min-w-0">
            <div className="flex items-end gap-2">
              <div className="flex flex-col leading-none">
                <span
                  className={`font-bold uppercase ${cfg.chf}`}
                  style={{ color: PROMO_RED }}
                >
                  CHF
                </span>
                <span
                  className={`font-extrabold leading-none tabular-nums tracking-tight ${cfg.price}`}
                  style={{ color: PROMO_RED }}
                >
                  {formatSwissPrice(displayPrice)}
                </span>
              </div>
              {onSale && (
                <span
                  className={`pb-0.5 tabular-nums text-warm-600/55 line-through decoration-warm-600/40 whitespace-nowrap ${cfg.originalPrice}`}
                >
                  CHF {formatSwissPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {isLg && (
            <button
              type="button"
              onClick={handleAdd}
              className={`flex shrink-0 items-center justify-center gap-1.5 shadow-[0_6px_18px_rgba(37,208,118,0.38)] ${addBtnBase} ${'button' in cfg ? cfg.button : ''}`}
              aria-label={addLabel}
            >
              <Plus className={`${cfg.plus} shrink-0`} strokeWidth={2.75} />
              <span className={`whitespace-nowrap font-extrabold leading-none tracking-tight ${sizeConfig.lg.buttonText}`}>
                In Korb
              </span>
            </button>
          )}
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
  const isLg = size === 'lg'

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
    <div className={isLg ? 'relative' : undefined}>
      {isLg && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-background-cream to-transparent"
          aria-hidden
        />
      )}
      {isLg && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-background-cream to-transparent"
          aria-hidden
        />
      )}

      <div
        ref={scrollerRef}
        className={`-mx-4 flex snap-x snap-mandatory overflow-x-auto px-4 scrollbar-none ${isLg ? 'gap-4 pb-3 pt-1' : 'gap-3 pb-2'}`}
      >
        {items.map((product, i) => (
          <PromoHeroCard key={`${product.id}-${i}`} product={product} size={size} />
        ))}
      </div>

      {showDots && products.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {products.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                i === activeIdx
                  ? 'w-6 bg-brand-500'
                  : 'w-1.5 bg-warm-500/35'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PromoHeroCard
