'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, Package, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  category: string;
  categoryId: string;
  image?: string;
  images?: string[];
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
  isPromotional?: boolean;
  rating?: number;
  reviews?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
  unit?: string;
  availableWeights?: string[];
  hasWeight?: boolean;
  discountPercentage?: number;
  parentId?: string;
  variants?: Product[];
}

interface ProductCardListProps {
  product: Product
  onClick?: (product: Product) => void
}

export default function ProductCardList({ product, onClick }: ProductCardListProps) {
  const router = useRouter()
  // Por defecto, null = producto padre seleccionado
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false)

  const formatPrice = (price: number): string => {
    // Usar formato suizo: .– cuando es exacto, .45 cuando tiene decimales
    const rounded = Math.round(price * 100) / 100;
    const hasDecimals = rounded % 1 !== 0;
    
    if (!hasDecimals) {
      return `CHF ${Math.round(rounded)}.–`;
    }
    return `CHF ${rounded.toFixed(2)}`;
  }
  
  // Obtener el texto del selector de variantes
  const getSelectorText = (): string => {
    if (!product.variants || product.variants.length === 0) {
      // Si no hay variantes, no mostrar nada (retornar cadena vacía)
      return ''
    }
    if (selectedVariantId) {
      const variant = product.variants.find(v => v.id === selectedVariantId)
      if (variant) {
        // Extraer el peso/unidad de la variante (ej: "500g", "1 KG")
        const variantName = getVariantName(variant)
        return variantName || ''
      }
    }
    // Si no hay variante seleccionada, mostrar el nombre de la variante padre
    // Usar getVariantName con null para obtener el nombre de la variante del producto padre
    return getVariantName(null)
  }

  // Obtener el producto/variante actualmente seleccionado para el precio
  // Si selectedVariantId es null, usar el producto padre
  const currentProduct = useMemo(() => {
    if (selectedVariantId && product.variants) {
      return product.variants.find(v => v.id === selectedVariantId) || product
    }
    return product // Producto padre por defecto
  }, [selectedVariantId, product])

  // Obtener el nombre base del producto (sin la parte de la variante)
  const getBaseProductName = useMemo(() => {
    if (!product.name) return ''
    
    // Si no hay variantes, retornar el nombre completo
    if (!product.variants || product.variants.length === 0) {
      return product.name
    }
    
    // Si hay variantes, encontrar el nombre base común
    const firstVariant = product.variants[0]
    if (firstVariant.name && product.name) {
      // Encontrar el prefijo común entre el producto padre y la primera variante
      const productWords = product.name.split(' ')
      const variantWords = firstVariant.name.split(' ')
      
      // Encontrar palabras comunes al inicio (el nombre base del producto)
      let commonPrefix = ''
      const minLength = Math.min(productWords.length, variantWords.length)
      for (let i = 0; i < minLength; i++) {
        if (productWords[i] === variantWords[i]) {
          commonPrefix += (commonPrefix ? ' ' : '') + productWords[i]
        } else {
          break
        }
      }
      
      // Si encontramos un prefijo común, usar ese como nombre base
      if (commonPrefix) {
        return commonPrefix
      }
    }
    
    // Si no se puede extraer, retornar el nombre completo
    return product.name
  }, [product.name, product.variants])

  // Extraer el nombre de la variante del nombre completo (ej: "Coca Cola 500g" -> "500g")
  const getVariantName = (variant: Product | null): string => {
    if (!variant) {
      // Si es null, es el producto padre - extraer el nombre de la variante del nombre del producto
      // Si el producto NO tiene variantes, retornar cadena vacía (no mostrar nada)
      if (!product.variants || product.variants.length === 0) {
        return ''
      }
      
      if (!product.name) return ''
      
      // Extraer la parte de la variante del nombre del producto padre
      if (getBaseProductName && product.name.startsWith(getBaseProductName)) {
        const variantPart = product.name.substring(getBaseProductName.length).trim()
        return variantPart || ''
      }
      
      return ''
    }
    
    if (!variant.name) return ''
    
    // Si el nombre de la variante contiene el nombre base, extraer solo la parte de la variante
    if (getBaseProductName && variant.name.startsWith(getBaseProductName)) {
      return variant.name.substring(getBaseProductName.length).trim()
    }
    
    // Si el nombre de la variante contiene el nombre completo del producto padre, extraer solo la parte de la variante
    if (product.name && variant.name.startsWith(product.name)) {
      return variant.name.substring(product.name.length).trim()
    }
    
    return variant.name
  }

  const handleProductClick = () => {
    if (onClick) {
      onClick(currentProduct)
    } else {
      router.push(`/products_list/view/${currentProduct.id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleProductClick()
    }
  }


  // Refs para el botón y dropdown
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null)

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isVariantDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Ancho mínimo más grande para mejor legibilidad
      const minWidth = 220
      const calculatedWidth = Math.max(rect.width, minWidth)
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: calculatedWidth
      })
    } else {
      setDropdownPosition(null)
    }
  }, [isVariantDropdownOpen])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideButton = buttonRef.current?.contains(target)
      const isInsideDropdown = dropdownRef.current?.contains(target)
      
      // Solo cerrar si el click está fuera del botón y del dropdown
      if (!isInsideButton && !isInsideDropdown) {
        setIsVariantDropdownOpen(false)
      }
    }

    if (isVariantDropdownOpen) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true)
      }, 10)
      
      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside, true)
      }
    }
  }, [isVariantDropdownOpen])

  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer 
                 transition-interactive gpu-accelerated group
                 hover:shadow-lg hover:scale-[1.02] hover:border-brand-200
                 active:scale-[0.98] active:shadow-md relative"
      onClick={handleProductClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Produkt anzeigen: ${currentProduct.name}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center relative
                        transition-interactive gpu-accelerated
                        group-hover:scale-110">
          {product.image || (product.images && product.images.length > 0) ? (
            <img
              src={product.image || product.images?.[0]}
              alt={currentProduct.name}
              className="w-full h-full object-cover transition-interactive gpu-accelerated
                         group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center transition-interactive ${(product.image || product.images?.[0]) ? 'hidden' : ''}`}>
            <Package className="w-8 h-8 text-gray-600 transition-interactive" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 text-[16px] font-semibold leading-tight mb-2 truncate">
            {getBaseProductName}
          </h3>
          
          {/* Selector de variantes y precio en la misma línea */}
          <div className="flex items-center gap-3">
            {/* Selector de variantes - solo si hay variantes, o espacio invisible para mantener layout */}
            {product.variants && product.variants.length > 0 ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsVariantDropdownOpen(!isVariantDropdownOpen)
                  }}
                  className="flex items-center justify-between gap-2 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors min-w-[80px]"
                  aria-label="Variante auswählen"
                >
                  <span className="truncate text-xs">
                    {getSelectorText()}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform flex-shrink-0 ${isVariantDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            ) : (
              <div className="min-w-[80px]"></div>
            )}

            {/* Precio al lado del selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Mostrar precio de promoción si hay originalPrice o si el producto tiene promoción activa */}
              {(currentProduct.originalPrice || currentProduct.isOnSale || currentProduct.isPromotional) && currentProduct.originalPrice ? (
                <>
                  <span className="text-[#FD3F37] font-bold text-sm">
                    {formatPrice(currentProduct.price)}
                  </span>
                  <span className="text-gray-400 text-xs line-through">
                    statt {formatPrice(currentProduct.originalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-gray-900 font-bold text-sm">
                  {formatPrice(currentProduct.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 transition-interactive group-hover:translate-x-1">
          <ChevronRight className="w-5 h-5 text-gray-400 transition-interactive" />
        </div>
      </div>

      {/* Dropdown renderizado con Portal para que esté por encima de todo */}
      {isVariantDropdownOpen && dropdownPosition && product.variants && typeof window !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999] max-h-48 overflow-y-auto"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
            zIndex: 99999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Opción del producto padre */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSelectedVariantId(null)
              setIsVariantDropdownOpen(false)
            }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
              selectedVariantId === null ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex-1 break-words">{getVariantName(null)}</span>
              <span className="text-gray-500 font-medium text-sm flex-shrink-0">
                {formatPrice(product.price)}
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
                setIsVariantDropdownOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                selectedVariantId === variant.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex-1 break-words">{getVariantName(variant) || variant.unit || ''}</span>
                <span className="text-gray-500 font-medium text-sm flex-shrink-0">
                  {formatPrice(variant.price)}
                </span>
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
