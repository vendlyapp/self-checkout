'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Plus, Minus, ChevronDown, Package, Percent } from 'lucide-react'
import { Product } from '../products_list/data/mockProducts';
import Image from 'next/image';
import { useCartStore } from '@/lib/stores/cartStore';

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  initialQuantity?: number
}

export default function ProductCard({ product, onAddToCart, initialQuantity = 0 }: ProductCardProps) {
  const { cartItems } = useCartStore()
  const [showVariantOptions, setShowVariantOptions] = useState(false)
  // Por defecto, null = producto padre seleccionado
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  // Actualizar selectedVariantId cuando cambian las variantes del producto o el producto mismo
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      // Si la variante seleccionada ya no existe, volver al padre (null)
      if (selectedVariantId) {
        const variantExists = product.variants.some(v => v.id === selectedVariantId)
        if (!variantExists) {
          setSelectedVariantId(null)
        }
      }
    } else {
      setSelectedVariantId(null)
    }
  }, [product.variants, product.id])

  // Obtener el producto/variante actualmente seleccionado para el precio
  // Si selectedVariantId es null, usar el producto padre
  const currentProduct = useMemo(() => {
    if (selectedVariantId && product.variants) {
      return product.variants.find(v => v.id === selectedVariantId) || product
    }
    return product // Producto padre por defecto
  }, [selectedVariantId, product.variants, product])

  // Calcular cantidad inicial basándose en la variante seleccionada
  const currentQuantity = useMemo(() => {
    const cartItem = cartItems.find(item => item.product.id === currentProduct.id)
    return cartItem?.quantity || 0
  }, [cartItems, currentProduct.id])

  // Extraer el nombre de la variante del nombre completo (ej: "Coca Cola 500g" -> "500g")
  const getVariantName = (variant: Product | null): string => {
    if (!variant) return 'Padre' // Si es null, es el producto padre
    if (!product.name || !variant.name) return variant.name || ''
    // Si el nombre de la variante contiene el nombre del producto, extraer solo la parte de la variante
    if (variant.name.startsWith(product.name)) {
      return variant.name.substring(product.name.length).trim()
    }
    return variant.name
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= currentProduct.stock) {
      onAddToCart(currentProduct, newQuantity)
    }
  }

  // Cerrar dropdown al hacer click fuera - usar dos refs para mobile y desktop
  const dropdownRefMobile = useRef<HTMLDivElement>(null)
  const dropdownRefDesktop = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideMobile = dropdownRefMobile.current?.contains(target)
      const isInsideDesktop = dropdownRefDesktop.current?.contains(target)
      
      // Solo cerrar si el click está fuera de ambos dropdowns
      if (!isInsideMobile && !isInsideDesktop) {
        setShowVariantOptions(false)
      }
    }

    if (showVariantOptions) {
      // Usar un pequeño delay para evitar que se cierre inmediatamente
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true)
      }, 10)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }
  }, [showVariantOptions])

  const formatPrice = (price: number | string | undefined | null) => {
    // Convertir a número si es string o undefined
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0);
    if (isNaN(numPrice)) return '0.00';
    if (numPrice % 1 === 0) {
      return `${numPrice}.-`
    }
    return `${numPrice.toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-[20px] lg:rounded-xl h-[130px] lg:h-[140px] p-4 lg:p-4 relative 
                    shadow-sm hover:shadow-md lg:border lg:border-gray-100 
                    transition-interactive gpu-accelerated hover:scale-[1.01] active:scale-[0.98] group">
      {/* Badge de precio - usar currentProduct para mostrar precio de la variante seleccionada */}
      <div className="absolute top-3 right-3 lg:top-3 lg:right-3">
        {currentProduct.originalPrice ? (
          <div className="flex flex-col items-end gap-1">
            {/* Precio nuevo en rojo */}
            <span className="text-[15px] lg:text-[14px] bg-[#F2EDE8] rounded-lg px-2 py-1 lg:px-2.5 lg:py-1 font-bold text-red-600">
              <span className="text-[10px] font-semibold">CHF</span> {formatPrice(currentProduct.price)}
            </span>
            {/* Precio original tachado */}
            <span className="text-[12px] text-gray-500 line-through">
            <span className="text-[10px] font-semibold">CHF</span> {formatPrice(currentProduct.originalPrice)}
            </span>
          </div>
        ) : (
          <span className="text-[15px] lg:text-[14px] bg-[#F2EDE8] rounded-lg px-2 py-1 lg:px-2.5 lg:py-1 font-bold text-gray-800">
            <span className="text-[10px] font-semibold">CHF</span> {formatPrice(currentProduct.price)}
          </span>
        )}
      </div>

      {/* Badge de descuento - usar currentProduct para mostrar descuento de la variante seleccionada */}
      {currentProduct.discountPercentage && (
        <div className="absolute top-3 left-3 lg:top-3 lg:left-3 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10">
          <div className="flex items-center justify-center">
            <Percent className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Mobile: Layout horizontal */}
      <div className="flex lg:hidden items-start gap-4 mt-2">
        {/* Icono del producto - siempre mostrar imagen del padre */}
        <div className='flex items-center gap-2 w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[16px] lg:rounded-2xl overflow-hidden mr-4'>
            {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={100}
              height={100}
              className="rounded-[16px] lg:rounded-2xl object-cover w-full h-full"
            />
        ) : (
          <div className="w-[80px] h-[80px] lg:w-[100px] lg:h-[100px] rounded-[16px] lg:rounded-2xl bg-gray-100 flex items-center justify-center">
            <Package className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400" />
          </div>
        )}
      </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-between min-h-[80px] lg:min-h-[100px]">
          {/* Título del producto - siempre mostrar nombre del padre */}
          <div className="pr-20 lg:pr-24 mb-4">
            <h3 className="text-gray-900 text-[16px] lg:text-[18px] leading-[1.3] w-[90%] tracking-tight font-semibold">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center justify-between h-[25px] lg:h-[30px]">
            {/* Selector de variantes - si tiene variantes */}
            {product.variants && product.variants.length > 0 ? (
              <div className="relative bg-[#F7F4F1] rounded-lg text-center min-w-[70px] h-[30px] lg:min-w-[80px] lg:h-[35px] flex items-center justify-center px-2" ref={dropdownRefMobile}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowVariantOptions(!showVariantOptions)
                  }}
                  className="flex items-center gap-1.5 text-[14px] lg:text-[15px] text-gray-700 hover:text-gray-900 transition-colors py-1 w-full justify-center"
                >
                  <span className="font-medium truncate">
                    {selectedVariantId 
                      ? getVariantName(product.variants.find(v => v.id === selectedVariantId) || null)
                      : 'Padre'}
                  </span>
                  <ChevronDown className={`w-4 h-4 lg:w-5 lg:h-5 text-gray-500 transition-transform flex-shrink-0 ${showVariantOptions ? 'rotate-180' : ''}`} />
                </button>
                {showVariantOptions && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 min-w-[120px] max-w-[150px] lg:min-w-[140px] lg:max-w-[180px] max-h-48 overflow-y-auto">
                    {/* Opción del producto padre */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedVariantId(null)
                        setShowVariantOptions(false)
                      }}
                      className={`block w-full text-left px-4 py-2 text-[14px] lg:text-[15px] font-medium transition-colors ${
                        selectedVariantId === null 
                          ? 'bg-brand-50 text-brand-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">Padre</span>
                        <span className="text-gray-500 font-medium text-xs flex-shrink-0">
                          CHF {formatPrice(product.price)}
                        </span>
                      </div>
                    </button>
                    {/* Variantes */}
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedVariantId(variant.id)
                          setShowVariantOptions(false)
                        }}
                        className={`block w-full text-left px-4 py-2 text-[14px] lg:text-[15px] font-medium transition-colors ${
                          selectedVariantId === variant.id 
                            ? 'bg-brand-50 text-brand-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{getVariantName(variant)}</span>
                          <span className="text-gray-500 font-medium text-xs flex-shrink-0">
                            CHF {formatPrice(variant.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[14px] lg:text-[15px] text-gray-500">
                Unidad
              </div>
            )}

            {/* Controles de cantidad */}
            <div className="flex items-center h-full pt-4">
              {currentQuantity > 0 && (
                <>
                  <button
                    onClick={() => handleQuantityChange(currentQuantity - 1)}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] text-white flex items-center justify-center transition-all duration-200"
                    disabled={currentQuantity <= 0}
                  >
                    <Minus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                  </button>
                  <span className="text-[16px] lg:text-[18px] font-bold text-gray-900 min-w-[24px] lg:min-w-[28px] text-center select-none">
                    {currentQuantity}
                  </span>
                </>
              )}
              <button
                onClick={() => handleQuantityChange(currentQuantity + 1)}
                disabled={currentQuantity >= currentProduct.stock}
                className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#25D076] hover:bg-[#25D076]/80 disabled:bg-[#25D076]/50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Plus className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet: Layout horizontal compacto */}
      <div className="hidden lg:flex items-start gap-4">
        {/* Imagen del producto - izquierda más pequeña - siempre mostrar imagen del padre */}
        <div className="w-[100px] h-[100px] rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={100}
              height={100}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Contenido - derecha */}
        <div className="flex-1 flex flex-col justify-between min-h-[100px]">
          {/* Título del producto - siempre mostrar nombre del padre */}
          <div className="pr-20">
            <h3 className="text-gray-900 text-[15px] leading-tight tracking-tight font-semibold line-clamp-2">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center justify-between">
            {/* Selector de variantes - si tiene variantes */}
            {product.variants && product.variants.length > 0 ? (
              <div className="relative bg-gray-50 rounded-lg min-w-[75px] h-[32px] flex items-center justify-center px-2" ref={dropdownRefDesktop}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowVariantOptions(!showVariantOptions)
                  }}
                  className="flex items-center gap-1 text-[14px] text-gray-700 hover:text-gray-900 transition-colors w-full justify-center"
                >
                  <span className="font-medium truncate">
                    {selectedVariantId 
                      ? getVariantName(product.variants.find(v => v.id === selectedVariantId) || null)
                      : 'Padre'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform flex-shrink-0 ${showVariantOptions ? 'rotate-180' : ''}`} />
                </button>
                {showVariantOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20 min-w-[140px] max-w-[180px] max-h-48 overflow-y-auto">
                    {/* Opción del producto padre */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedVariantId(null)
                        setShowVariantOptions(false)
                      }}
                      className={`block w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${
                        selectedVariantId === null 
                          ? 'bg-brand-50 text-brand-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">Padre</span>
                        <span className="text-gray-500 font-medium text-xs flex-shrink-0">
                          CHF {formatPrice(product.price)}
                        </span>
                      </div>
                    </button>
                    {/* Variantes */}
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedVariantId(variant.id)
                          setShowVariantOptions(false)
                        }}
                        className={`block w-full text-left px-3 py-2 text-[14px] font-medium transition-colors ${
                          selectedVariantId === variant.id 
                            ? 'bg-brand-50 text-brand-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{getVariantName(variant)}</span>
                          <span className="text-gray-500 font-medium text-xs flex-shrink-0">
                            CHF {formatPrice(variant.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[14px] text-gray-500 font-medium">
                Unidad
              </div>
            )}

            {/* Controles de cantidad */}
            <div className="flex items-center gap-2">
              {currentQuantity > 0 && (
                <>
                  <button
                    onClick={() => handleQuantityChange(currentQuantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-all duration-200"
                    disabled={currentQuantity <= 0}
                  >
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                  <span className="text-[16px] font-bold text-gray-900 min-w-[24px] text-center select-none">
                    {currentQuantity}
                  </span>
                </>
              )}
              <button
                onClick={() => handleQuantityChange(currentQuantity + 1)}
                disabled={currentQuantity >= currentProduct.stock}
                className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
