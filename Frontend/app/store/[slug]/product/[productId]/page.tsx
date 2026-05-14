'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, Tag, MapPin, Package, Leaf, Check, ChevronDown, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/lib/stores/cartStore'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { normalizeProductData, Product } from '@/components/dashboard/products_list/data/mockProducts'

const fmt = (n: number | string | undefined | null) => {
  const v = typeof n === 'string' ? parseFloat(n) : (n || 0)
  if (isNaN(v)) return 'CHF 0.–'
  const r = Math.round(v * 100) / 100
  return r % 1 !== 0 ? `CHF ${r.toFixed(2)}` : `CHF ${Math.round(r)}.–`
}

export default function ProductDetailPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>()
  const router = useRouter()
  const { cartItems } = useCartStore()

  const { data: rawProducts = [] } = useStoreProducts({ slug, enabled: !!slug })
  const allProducts = useMemo(() => rawProducts.map(normalizeProductData), [rawProducts])

  const baseProduct = useMemo(
    () => allProducts.find((p: Product) => p.id === productId) ?? null,
    [allProducts, productId]
  )

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    baseProduct?.variants?.[0]?.id ?? null
  )
  const [showVariants, setShowVariants] = useState(false)

  const product: Product | null = useMemo(() => {
    if (!baseProduct) return null
    if (selectedVariantId && baseProduct.variants) {
      return baseProduct.variants.find((v: Product) => v.id === selectedVariantId) ?? baseProduct
    }
    return baseProduct
  }, [baseProduct, selectedVariantId])

  const cartItem = cartItems.find(i => i.product.id === product?.id)
  const qty = cartItem?.quantity ?? 0

  const onSale = !!product?.originalPrice && product.originalPrice > (product?.price ?? 0)
  const price = product?.price ?? 0
  const originalPrice = product?.originalPrice ?? 0
  const discountPct = onSale ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  if (!product || !baseProduct) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <Package className="h-12 w-12 text-gray-300" />
        <p className="font-semibold text-gray-500">Produkt nicht gefunden</p>
        <button onClick={() => router.back()} className="text-sm font-semibold text-[#25D076]">Zurück</button>
      </div>
    )
  }

  return (
    // No padding-bottom fijo — el contenido termina naturalmente, el nav del layout da espacio
    <div className="flex flex-col bg-background-cream">

      {/* ── Hero imagen full-width ── */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <Package className="h-20 w-20 text-gray-200" strokeWidth={1.2} />
          </div>
        )}

        {/* Gradiente top para botón volver */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />

        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow-md backdrop-blur active:scale-90 transition-transform"
          aria-label="Zurück"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>

        {/* Badge descuento */}
        {onSale && (
          <span className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full bg-red-500 px-3 py-1 text-sm font-extrabold text-white shadow-md">
            −{discountPct}%
          </span>
        )}
      </div>

      {/* ── Card principal — pegada a la imagen, bordes redondeados top ── */}
      <div className="relative -mt-5 rounded-t-[28px] bg-white px-5 pt-5 pb-2 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">

        {/* Nombre + unidad */}
        <h1 className="text-xl font-extrabold leading-tight text-gray-900">{baseProduct.name}</h1>
        {product.unit && <p className="mt-0.5 text-sm text-gray-400">{product.unit}</p>}

        {/* Precio */}
        <div className="mt-3 flex items-end gap-2.5">
          <span className={`text-3xl font-extrabold leading-none tabular-nums ${onSale ? 'text-red-500' : 'text-gray-900'}`}>
            {fmt(price)}
          </span>
          {onSale && (
            <span className="pb-0.5 text-sm font-medium text-gray-400 line-through">{fmt(originalPrice)}</span>
          )}
          {onSale && (
            <span className="ml-auto rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-500">
              spare {fmt(originalPrice - price)}
            </span>
          )}
        </div>

      </div>

      {/* ── Selector variantes ── */}
      {baseProduct.variants && baseProduct.variants.length > 0 && (
        <div className="relative mx-4 mt-3">
          <button
            onClick={() => setShowVariants(!showVariants)}
            className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm active:scale-[0.98] transition-transform"
          >
            <span>{product.name !== baseProduct.name ? product.name : (product.unit || 'Variante wählen')}</span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showVariants ? 'rotate-180' : ''}`} />
          </button>
          {showVariants && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
              {baseProduct.variants.map((v: Product) => (
                <button
                  key={v.id}
                  onClick={() => { setSelectedVariantId(v.id); setShowVariants(false) }}
                  className={`flex w-full items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors ${selectedVariantId === v.id ? 'bg-[#25D076]/10 text-[#25D076]' : 'text-gray-700 active:bg-gray-50'}`}
                >
                  <span>{v.name || v.unit}</span>
                  <span className="tabular-nums">{fmt(v.price)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tags ── */}
      {baseProduct.tags && baseProduct.tags.length > 0 && (
        <div className="mx-4 mt-4 flex flex-wrap gap-2">
          {baseProduct.tags.slice(0, 5).map((tag: string) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#25D076]/10 px-3 py-1.5 text-xs font-semibold text-[#25D076] capitalize">
              <Leaf className="h-3 w-3" strokeWidth={2.2} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Descripción ── */}
      {product.description && (
        <p className="mx-4 mt-4 text-sm leading-relaxed text-gray-600">{product.description}</p>
      )}

      {/* ── Info bullets ── */}
      <section className="mx-4 mt-4 mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">Produktinfo</h2>
        <ul className="mt-3 divide-y divide-gray-50">
          {baseProduct.category && (
            <li className="flex items-center gap-3 py-2.5 text-sm text-gray-700">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#25D076]/10 text-[#25D076]">
                <Package className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="text-gray-400">Kategorie</span>
              <span className="ml-auto font-semibold">{baseProduct.category}</span>
            </li>
          )}
          {baseProduct.location && (
            <li className="flex items-center gap-3 py-2.5 text-sm text-gray-700">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#25D076]/10 text-[#25D076]">
                <MapPin className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="text-gray-400">Standort</span>
              <span className="ml-auto font-semibold">{baseProduct.location}</span>
            </li>
          )}
          <li className="flex items-center gap-3 py-2.5 text-sm">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${product.stock > 0 ? 'bg-[#25D076]/10 text-[#25D076]' : 'bg-red-50 text-red-400'}`}>
              <Check className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="text-gray-400">Lager</span>
            <span className={`ml-auto font-semibold ${product.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} verfügbar` : 'Nicht verfügbar'}
            </span>
          </li>
          {baseProduct.barcode && (
            <li className="flex items-center gap-3 py-2.5 text-sm text-gray-700">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-400">
                <Tag className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="text-gray-400">Barcode</span>
              <span className="ml-auto font-mono text-xs text-gray-500">{baseProduct.barcode}</span>
            </li>
          )}
        </ul>
      </section>

      {/* Espacio para el FooterNav del layout */}
      <div className="h-4" />
    </div>
  )
}
