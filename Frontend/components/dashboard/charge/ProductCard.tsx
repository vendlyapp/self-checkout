'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Minus, ChevronDown, Package } from 'lucide-react'
import { Product } from '../products_list/data/mockProducts'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/stores/cartStore'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  isCartView?: boolean
}

const ProductCard = React.memo(function ProductCard({ product, onAddToCart, isCartView = false }: ProductCardProps) {
  const { cartItems } = useCartStore()
  const params = useParams()
  const slug = params?.slug as string | undefined
  const [showVariantOptions, setShowVariantOptions] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null
  )

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      if (selectedVariantId) {
        const variantExists = product.variants.some(v => v.id === selectedVariantId)
        if (!variantExists) setSelectedVariantId(null)
      }
    } else {
      setSelectedVariantId(null)
    }
  }, [product.variants, product.id, selectedVariantId])

  const currentProduct = useMemo(() => {
    if (selectedVariantId && product.variants) {
      return product.variants.find(v => v.id === selectedVariantId) || product
    }
    return product
  }, [selectedVariantId, product])

  const currentQuantity = useMemo(() => {
    const cartItem = cartItems.find(item => item.product.id === currentProduct.id)
    return cartItem?.quantity || 0
  }, [cartItems, currentProduct.id])

  const getBaseProductName = useMemo(() => {
    if (!product.name) return ''
    if (!product.variants || product.variants.length === 0) return product.name
    const firstVariant = product.variants[0]
    if (firstVariant.name && product.name) {
      const productWords = product.name.split(' ')
      const variantWords = firstVariant.name.split(' ')
      let commonPrefix = ''
      const minLength = Math.min(productWords.length, variantWords.length)
      for (let i = 0; i < minLength; i++) {
        if (productWords[i] === variantWords[i]) commonPrefix += (commonPrefix ? ' ' : '') + productWords[i]
        else break
      }
      if (commonPrefix) return commonPrefix
    }
    return product.name
  }, [product.name, product.variants])

  const getVariantName = (variant: Product | null): string => {
    if (!variant) {
      if (!product.variants || product.variants.length === 0) return ''
      if (!product.name) return ''
      if (getBaseProductName && product.name.startsWith(getBaseProductName)) {
        return product.name.substring(getBaseProductName.length).trim()
      }
      return ''
    }
    if (!variant.name) return ''
    if (getBaseProductName && variant.name.startsWith(getBaseProductName)) {
      return variant.name.substring(getBaseProductName.length).trim()
    }
    if (product.name && variant.name.startsWith(product.name)) {
      return variant.name.substring(product.name.length).trim()
    }
    return variant.name
  }

  const getSelectorText = (): string => {
    if (!product.variants || product.variants.length === 0) return currentProduct.unit || ''
    if (selectedVariantId) {
      const variant = product.variants.find(v => v.id === selectedVariantId)
      if (variant) return getVariantName(variant) || variant.unit || ''
    }
    return getVariantName(null) || currentProduct.unit || ''
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > currentProduct.stock) return
    const prev = currentQuantity
    onAddToCart(currentProduct, newQuantity)
    if (newQuantity === 1 && prev === 0) {
      toast.success(`Zum Warenkorb hinzugefügt`, {
        description: getBaseProductName,
        duration: 2200,
      })
    } else if (newQuantity === 0) {
      toast(`Entfernt`, {
        description: getBaseProductName,
        duration: 1800,
      })
    }
  }

  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    if (showVariantOptions && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 200)
      })
    } else {
      setDropdownPosition(null)
    }
  }, [showVariantOptions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (!buttonRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setShowVariantOptions(false)
      }
    }
    if (showVariantOptions) {
      const id = setTimeout(() => document.addEventListener('mousedown', handleClickOutside, true), 10)
      return () => { clearTimeout(id); document.removeEventListener('mousedown', handleClickOutside, true) }
    }
  }, [showVariantOptions])

  const formatPrice = (price: number | string | undefined | null) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0)
    if (isNaN(numPrice)) return '0.–'
    const rounded = Math.round(numPrice * 100) / 100
    return rounded % 1 !== 0 ? rounded.toFixed(2) : `${Math.round(rounded)}.–`
  }

  const onSale = !!currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price

  const detailHref = slug ? `/store/${slug}/product/${product.id}` : null

  // Diseño horizontal (1 columna) — igual para vista normal y carrito
  return (
    <article className="flex items-center gap-2.5 rounded-xl bg-white p-2.5 shadow-card">
      {/* Imagen — tappable al detalle */}
      <div className="relative flex-shrink-0">
        {detailHref ? (
          <Link href={detailHref} className="block h-[72px] w-[72px] overflow-hidden rounded-lg bg-gray-100 active:opacity-80 transition-opacity">
            {product.image ? (
              <Image src={product.image} alt={getBaseProductName} width={72} height={72} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </Link>
        ) : (
          <div className="h-[72px] w-[72px] overflow-hidden rounded-lg bg-gray-100">
            {product.image ? (
              <Image src={product.image} alt={getBaseProductName} width={72} height={72} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>
        )}
        {/* Badge descuento */}
        {(currentProduct.discountPercentage || onSale) && (
          <span className="absolute -left-1.5 -top-1.5 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white shadow-soft">
            <span className="text-[10px] font-bold">%</span>
          </span>
        )}
        {/* Badge cantidad */}
        {currentQuantity > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-7 min-w-7 place-items-center rounded-full bg-[#25D076] px-1.5 text-xs font-extrabold text-white shadow-soft ring-2 ring-white">
            ×{currentQuantity}
          </span>
        )}
      </div>

      {/* Info — tappable al detalle */}
      <div className="min-w-0 flex-1">
        {detailHref ? (
          <Link href={detailHref} className="block active:opacity-70 transition-opacity">
            <p className="truncate text-sm font-bold leading-tight text-gray-900">{getBaseProductName}</p>
          </Link>
        ) : (
          <p className="truncate text-sm font-bold leading-tight text-gray-900">{getBaseProductName}</p>
        )}

        {/* Variante / unidad */}
        {product.variants && product.variants.length > 0 ? (
          <button
            ref={buttonRef}
            onClick={(e) => { e.stopPropagation(); setShowVariantOptions(!showVariantOptions) }}
            className="mt-1 inline-flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 shadow-soft active:scale-95 transition-all"
          >
            <span className="max-w-[80px] truncate">{getSelectorText()}</span>
            <ChevronDown className={`h-3 w-3 flex-shrink-0 text-gray-400 transition-transform duration-150 ${showVariantOptions ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <p className="mt-0.5 truncate text-xs text-gray-400">{currentProduct.unit || ''}</p>
        )}
      </div>

      {/* Precio + controles — ancho fijo para evitar salto al agregar */}
      <div className="flex w-[84px] flex-shrink-0 flex-col items-end justify-between gap-1.5 self-stretch py-0.5">
        {/* Precio */}
        <div className="text-right leading-none">
          {onSale ? (
            <>
              <p className="text-sm font-bold text-red-600">CHF {formatPrice(currentProduct.price)}</p>
              <p className="text-[11px] text-gray-400 line-through">CHF {formatPrice(currentProduct.originalPrice)}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-gray-900">CHF {formatPrice(currentProduct.price)}</p>
          )}
        </div>

        {/* Controles */}
        {currentQuantity === 0 ? (
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={currentProduct.stock <= 0}
            className="grid h-9 w-9 place-items-center rounded-full bg-[#25D076] text-white shadow-soft disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-transform"
            aria-label={`${getBaseProductName} hinzufügen`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="flex h-9 items-center gap-0.5 rounded-full border border-gray-200 bg-gray-50 px-1">
            <button
              onClick={() => handleQuantityChange(currentQuantity - 1)}
              className="grid h-7 w-7 place-items-center rounded-full bg-white text-gray-700 shadow-soft active:scale-95"
              aria-label="Weniger"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
            <span className="min-w-6 text-center text-sm font-extrabold text-gray-900">{currentQuantity}</span>
            <button
              onClick={() => handleQuantityChange(currentQuantity + 1)}
              disabled={currentQuantity >= currentProduct.stock}
              className="grid h-7 w-7 place-items-center rounded-full bg-[#25D076] text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              aria-label="Mehr"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Dropdown variantes — Portal */}
      {showVariantOptions && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[99999] overflow-hidden rounded-2xl bg-white shadow-card border border-gray-100 py-1"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px`, width: `${Math.max(dropdownPosition.width, 180)}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {getVariantName(null) !== '' && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVariantId(null); setShowVariantOptions(false) }}
              className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${selectedVariantId === null ? 'bg-[#25D076]/8 text-[#25D076]' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span>{getVariantName(null)}</span>
              <span className={`tabular-nums ${selectedVariantId === null ? 'text-[#25D076]/70' : 'text-gray-400'}`}>CHF {formatPrice(product.price)}</span>
            </button>
          )}
          {product.variants && product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedVariantId(variant.id); setShowVariantOptions(false) }}
              className={`flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${selectedVariantId === variant.id ? 'bg-[#25D076]/8 text-[#25D076]' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span>{getVariantName(variant) || variant.unit || ''}</span>
              <span className={`tabular-nums ${selectedVariantId === variant.id ? 'text-[#25D076]/70' : 'text-gray-400'}`}>CHF {formatPrice(variant.price)}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </article>
  )
})

export default ProductCard
