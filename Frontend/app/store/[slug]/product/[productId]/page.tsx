'use client'

import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Minus, Tag, MapPin, Package, Leaf, Check, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { useCartStore } from '@/lib/stores/cartStore'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { normalizeProductData, Product } from '@/components/dashboard/products_list/data/mockProducts'
import { toast } from 'sonner'

const formatPrice = (price: number | string | undefined | null) => {
  const n = typeof price === 'string' ? parseFloat(price) : (price || 0)
  if (isNaN(n)) return '0.–'
  const r = Math.round(n * 100) / 100
  return r % 1 !== 0 ? `CHF ${r.toFixed(2)}` : `CHF ${Math.round(r)}.–`
}

export default function ProductDetailPage() {
  const { slug, productId } = useParams<{ slug: string; productId: string }>()
  const router = useRouter()
  const { store } = useScannedStoreStore()
  const { cartItems, addToCart } = useCartStore()

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

  const handleAdd = () => {
    if (!product) return
    const newQty = qty + 1
    if (newQty > product.stock) return
    addToCart(product, newQty)
    if (qty === 0) toast.success('Zum Warenkorb hinzugefügt', { description: product.name, duration: 2200 })
  }

  const handleRemove = () => {
    if (!product || qty === 0) return
    addToCart(product, qty - 1)
  }

  if (!product || !baseProduct) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <Package className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Produkt nicht gefunden</p>
        <button onClick={() => router.back()} className="text-sm font-semibold text-[#25D076]">Zurück</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-[100px]">
      {/* Hero imagen */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}

        {/* Botón volver */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur shadow-md active:scale-90 transition-transform"
          aria-label="Zurück"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>

        {/* Badge descuento */}
        {onSale && (
          <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-md">
            −{discountPct}%
          </span>
        )}

        {/* Badge cantidad en carrito */}
        {qty > 0 && (
          <span className="absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full bg-[#25D076] px-3 py-1.5 text-sm font-bold text-white shadow-md">
            ×{qty} im Korb
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-col gap-5 px-4 pt-5">

        {/* Nombre + precio */}
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-gray-900">{baseProduct.name}</h1>
          {product.unit && <p className="mt-1 text-sm font-medium text-gray-400">{product.unit}</p>}

          <div className="mt-3 flex items-end gap-3">
            <span className={`text-[32px] font-extrabold leading-none ${onSale ? 'text-red-500' : 'text-gray-900'}`}>
              {formatPrice(price)}
            </span>
            {onSale && (
              <>
                <span className="pb-1 text-base text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-500">
                  <Tag className="h-3.5 w-3.5" /> Spare {formatPrice(originalPrice - price)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Selector variantes */}
        {baseProduct.variants && baseProduct.variants.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm active:scale-[0.98] transition-transform"
            >
              <span>{product.name !== baseProduct.name ? product.name : (product.unit || 'Variante wählen')}</span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showVariants ? 'rotate-180' : ''}`} />
            </button>
            {showVariants && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
                {baseProduct.variants.map((v: Product) => (
                  <button
                    key={v.id}
                    onClick={() => { setSelectedVariantId(v.id); setShowVariants(false) }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${selectedVariantId === v.id ? 'bg-[#25D076]/10 text-[#25D076]' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>{v.name || v.unit}</span>
                    <span className="tabular-nums text-gray-400">{formatPrice(v.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {baseProduct.tags && baseProduct.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {baseProduct.tags.slice(0, 4).map((tag: string) => (
              <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-[#25D076]/10 px-3 py-1.5 text-xs font-semibold text-[#25D076] capitalize">
                <Leaf className="h-3.5 w-3.5" strokeWidth={2.2} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Descripción */}
        {product.description && (
          <p className="text-base leading-relaxed text-gray-600">{product.description}</p>
        )}

        {/* Info bullets */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">Produktinfo</h2>
          <ul className="mt-3 space-y-3">
            <li className="flex items-center gap-3 text-sm text-gray-700">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#25D076]/10 text-[#25D076]">
                <Package className="h-4 w-4" strokeWidth={2.2} />
              </span>
              Kategorie: {baseProduct.category}
            </li>
            {baseProduct.location && (
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#25D076]/10 text-[#25D076]">
                  <MapPin className="h-4 w-4" strokeWidth={2.2} />
                </span>
                {baseProduct.location}
              </li>
            )}
            {product.stock > 0 && (
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#25D076]/10 text-[#25D076]">
                  <Check className="h-4 w-4" strokeWidth={2.2} />
                </span>
                {product.stock} auf Lager
              </li>
            )}
            {baseProduct.barcode && (
              <li className="flex items-center gap-3 text-sm text-gray-700">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-500">
                  <Tag className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span>Barcode: <span className="font-mono text-gray-500">{baseProduct.barcode}</span></span>
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Sticky Add-to-Cart bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center gap-3 px-4 py-3">
          {qty > 0 && (
            <div className="flex h-14 items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-1.5">
              <button
                onClick={handleRemove}
                className="grid h-11 w-11 place-items-center rounded-full bg-white text-gray-700 shadow-sm active:scale-95 transition-transform"
                aria-label="Weniger"
              >
                <Minus className="h-5 w-5" strokeWidth={2.5} />
              </button>
              <span className="min-w-9 text-center text-lg font-extrabold tabular-nums">{qty}</span>
              <button
                onClick={handleAdd}
                disabled={qty >= product.stock}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#25D076] text-white shadow-sm disabled:opacity-40 active:scale-95 transition-transform"
                aria-label="Mehr"
              >
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#25D076] px-5 text-base font-bold text-white shadow-md disabled:opacity-40 active:scale-[0.98] transition-transform"
          >
            {qty > 0 ? (
              <>
                <Check className="h-5 w-5" strokeWidth={2.5} />
                Im Korb · {formatPrice(price * qty)}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" strokeWidth={2.5} />
                In den Warenkorb · {formatPrice(price)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
