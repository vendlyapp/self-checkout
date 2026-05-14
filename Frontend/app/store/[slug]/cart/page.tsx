'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import {
  ArrowLeft, ArrowRight, ShoppingBag, ScanLine, Minus, Plus,
  Sparkles, Tag, X, Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

import { useCartStore } from '@/lib/stores/cartStore'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { formatSwissPriceWithCHF, formatSwissPrice } from '@/lib/utils'
import { usePromoLogic } from '@/hooks'
import { Product, normalizeProductData } from '@/components/dashboard/products_list/data/mockProducts'

// Línea de carrito individual (estilo Lovable)
function CartLine({
  product,
  quantity,
  onDelete,
  onMinus,
  onPlus,
}: {
  product: Product
  quantity: number
  onDelete: () => void
  onMinus: () => void
  onPlus: () => void
}) {
  const price = product.originalPrice && product.originalPrice > product.price
    ? product.price
    : product.price
  const line = price * quantity

  return (
    <li className="border-b border-gray-100 bg-white p-3 last:border-0">
      <div className="flex gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} width={64} height={64} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-gray-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight text-gray-900">{product.name}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatSwissPriceWithCHF(price)} · {product.unit}
              </p>
            </div>
            <button
              onClick={onDelete}
              className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              aria-label="Entfernen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex h-9 items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-1">
              <button
                onClick={onMinus}
                className="grid h-7 w-7 place-items-center rounded-full bg-white text-gray-700 active:scale-95 shadow-soft"
                aria-label="Weniger"
              >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              <span className="min-w-6 text-center text-sm font-extrabold text-gray-900">{quantity}</span>
              <button
                onClick={onPlus}
                className="grid h-7 w-7 place-items-center rounded-full bg-[#25D076] text-white active:scale-95"
                aria-label="Mehr"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-base font-extrabold tabular-nums text-gray-900">{formatSwissPriceWithCHF(line)}</p>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function StoreCartPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { cartItems, updateQuantity, removeFromCart, addToCart, getTotalWithDiscount, getSubtotal, promoInfo } = useCartStore()
  const { store } = useScannedStoreStore()

  const { data: rawProducts = [] } = useStoreProducts({ slug, enabled: !!slug })
  const allProducts = useMemo(() => rawProducts.map(normalizeProductData), [rawProducts])

  const {
    promoApplied, discountAmount, promoError,
    localPromoCode, setLocalPromoCode,
    handleApplyPromo, handleRemovePromo,
  } = usePromoLogic()

  const [promoOpen, setPromoOpen] = useState(false)

  const total = getTotalWithDiscount()
  const itemCount = cartItems.reduce((s, { quantity }) => s + quantity, 0)
  const savings = promoApplied ? discountAmount : 0

  // Sugerencias: productos activos no en carrito, priorizando los en oferta
  const suggestions = useMemo(() => {
    const inCart = new Set(cartItems.map(i => i.product.id))
    const notInCart = allProducts.filter((p: Product) => !inCart.has(p.id) && p.stock > 0)
    const onSale = notInCart.filter((p: Product) => p.originalPrice && p.originalPrice > p.price)
    const rest = notInCart.filter((p: Product) => !p.originalPrice || p.originalPrice <= p.price)
    return [...onSale, ...rest].slice(0, 8)
  }, [allProducts, cartItems])

  const handleDelete = (productId: string, name: string) => {
    removeFromCart(productId)
    toast(`${name} entfernt`)
  }

  const handleMinus = (product: Product, quantity: number) => {
    updateQuantity(product.id, quantity - 1)
  }

  const handlePlus = (product: Product, quantity: number) => {
    updateQuantity(product.id, quantity + 1)
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-card">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-base font-semibold text-gray-900">Noch nichts im Korb</p>
          <p className="mt-1 text-sm text-gray-400">Scanne ein Produkt oder stöbere im Sortiment.</p>
          <Link
            href={`/store/${slug}/scan`}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D076] px-6 py-3.5 text-base font-semibold text-white shadow-soft"
          >
            <ScanLine className="h-5 w-5" /> Jetzt scannen
          </Link>
          <div className="mt-3">
            <Link href={`/store/${slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#25D076]">
              Sortiment ansehen <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-4 pb-36">
        {/* Nav top */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/store/${slug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 text-sm font-bold text-gray-700 shadow-soft"
          >
            <ArrowLeft className="h-4 w-4" /> Weiter einkaufen
          </Link>
          <Link
            href={`/store/${slug}/payment`}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#25D076] px-3.5 text-sm font-bold text-white shadow-soft active:scale-95"
          >
            Bezahlen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Resumen total */}
        <section className="relative mt-3 overflow-hidden rounded-3xl bg-white p-5 shadow-card">
          <ShoppingBag className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-[#25D076]/[0.06]" strokeWidth={1.2} />
          <p className="relative text-xs font-semibold uppercase tracking-wide text-gray-400">Dein Warenkorb</p>
          <p className="relative mt-0.5 text-sm text-gray-400">{itemCount} Artikel</p>
          <p className="relative mt-4 text-5xl font-extrabold leading-none tracking-tight tabular-nums text-gray-900">
            {formatSwissPriceWithCHF(total)}
          </p>
          <div className="relative mt-3 flex items-center justify-between gap-2">
            {savings > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                <Sparkles className="h-3 w-3" /> Du sparst {formatSwissPriceWithCHF(savings)}
              </span>
            ) : <span />}
            <span className="text-[11px] text-gray-400">inkl. MwSt.</span>
          </div>
        </section>

        {/* Promo code */}
        <section className="mt-3">
          {promoApplied ? (
            <div className="flex items-center justify-between gap-2 rounded-full bg-green-500 px-3.5 py-2 shadow-soft">
              <span className="flex items-center gap-2 text-sm font-bold text-white">
                <Tag className="h-4 w-4" />
                {localPromoCode}
                {promoInfo?.discountType === 'percentage' ? ` −${Math.round(promoInfo.discountValue)}%` : ''}
              </span>
              <button
                onClick={() => { handleRemovePromo(); toast('Code entfernt') }}
                className="grid h-7 w-7 place-items-center rounded-full text-white/80 hover:bg-white/10"
                aria-label="Code entfernen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : !promoOpen ? (
            <button
              onClick={() => setPromoOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#25D076]"
            >
              <Tag className="h-4 w-4" /> Gutscheincode einlösen
            </button>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-2.5">
              <div className="flex gap-2">
                <input
                  value={localPromoCode}
                  onChange={e => setLocalPromoCode(e.target.value.toUpperCase().slice(0, 20))}
                  onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="z.B. SUNNE10"
                  maxLength={20}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                  className="h-10 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-bold uppercase tracking-wide outline-none focus:border-[#25D076]"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={localPromoCode.trim().length < 3}
                  className="h-10 rounded-lg bg-[#25D076] px-4 text-sm font-bold text-white shadow-soft disabled:opacity-50"
                >
                  Einlösen
                </button>
                <button
                  onClick={() => { setPromoOpen(false); setLocalPromoCode('') }}
                  className="grid h-10 w-10 place-items-center rounded-lg text-gray-400 hover:bg-gray-100"
                  aria-label="Abbrechen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {promoError && <p className="mt-2 text-xs font-semibold text-red-500">{promoError}</p>}
            </div>
          )}
        </section>

        {/* Lista artículos */}
        <h2 className="mt-5 text-xs font-bold uppercase tracking-wide text-gray-400">Artikel</h2>
        <ul className="mt-2 overflow-hidden rounded-2xl bg-white shadow-card">
          {cartItems.map(({ product, quantity }) => (
            <CartLine
              key={product.id}
              product={product}
              quantity={quantity}
              onDelete={() => handleDelete(product.id, product.name)}
              onMinus={() => handleMinus(product, quantity)}
              onPlus={() => handlePlus(product, quantity)}
            />
          ))}
        </ul>

        {/* Vorschläge */}
        {suggestions.length > 0 && (
          <section className="-mx-4 mt-6 bg-gray-50 px-4 py-4">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Vorschläge
            </h2>
            <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestions.map((p: Product) => {
                const onSale = !!p.originalPrice && p.originalPrice > p.price
                const discountPct = onSale ? Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100) : 0
                return (
                  <article key={p.id} className="w-32 shrink-0 snap-start">
                    <Link href={`/store/${slug}/product/${p.id}`} className="block active:opacity-75">
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="128px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                        {onSale && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-soft">
                            −{discountPct}%
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-tight text-gray-900">{p.name}</p>
                    </Link>
                    <div className="mt-1 flex items-center justify-between gap-1">
                      <p className={`text-xs font-extrabold tabular-nums ${onSale ? 'text-red-500' : 'text-gray-900'}`}>
                        CHF {p.price % 1 !== 0 ? p.price.toFixed(2) : `${Math.round(p.price)}.–`}
                      </p>
                      <button
                        onClick={() => {
                          addToCart(p, 1)
                          toast.success('Zum Warenkorb hinzugefügt', { description: p.name, duration: 2200 })
                        }}
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#25D076] text-white shadow-soft active:scale-95"
                        aria-label={`${p.name} hinzufügen`}
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>

    </>
  )
}
