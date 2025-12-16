'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
    return price % 1 === 0 ? `CHF ${price}.-` : `CHF ${price.toFixed(2)}`
  }

  // Obtener el producto/variante actualmente seleccionado para el precio
  // Si selectedVariantId es null, usar el producto padre
  const currentProduct = useMemo(() => {
    if (selectedVariantId && product.variants) {
      return product.variants.find(v => v.id === selectedVariantId) || product
    }
    return product // Producto padre por defecto
  }, [selectedVariantId, product.variants, product])

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


  // Cerrar dropdown al hacer click fuera
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInside = dropdownRef.current?.contains(target)
      
      // Solo cerrar si el click está fuera del dropdown
      if (!isInside) {
        setIsVariantDropdownOpen(false)
      }
    }

    if (isVariantDropdownOpen) {
      // Usar un pequeño delay para evitar que se cierre inmediatamente
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
                 active:scale-[0.98] active:shadow-md"
      onClick={handleProductClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Produkt anzeigen: ${product.name}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center relative
                        transition-interactive gpu-accelerated
                        group-hover:scale-110">
          {product.image || (product.images && product.images.length > 0) ? (
            <img
              src={product.image || product.images?.[0]}
              alt={product.name}
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
          <h3 className="text-gray-900 text-[16px] font-semibold leading-tight mb-1 truncate">
            {product.name}
          </h3>
          
          {/* Selector de variantes si hay variantes */}
          {product.variants && product.variants.length > 0 && (
            <div className="relative mb-2" ref={dropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsVariantDropdownOpen(!isVariantDropdownOpen)
                }}
                className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Variante auswählen"
              >
                <span className="truncate">
                  {selectedVariantId 
                    ? getVariantName(product.variants.find(v => v.id === selectedVariantId) || null)
                    : 'Padre'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isVariantDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown de variantes */}
              {isVariantDropdownOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
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
                    <div className="flex items-center justify-between">
                      <span>Padre</span>
                      <span className="text-gray-500 font-medium">
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
                      <div className="flex items-center justify-between">
                        <span>{getVariantName(variant)}</span>
                        <span className="text-gray-500 font-medium">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mostrar precio de promoción si hay originalPrice o si el producto tiene promoción activa */}
            {(currentProduct.originalPrice || currentProduct.isOnSale || currentProduct.isPromotional) && currentProduct.originalPrice ? (
              <>
                <span className="text-[#FD3F37] font-bold text-[15px]">
                  {formatPrice(currentProduct.price)}
                </span>
                <span className="text-gray-400 text-[13px] line-through">
                  statt {formatPrice(currentProduct.originalPrice)}
                </span>
                {/* Badge de promoción */}
                {(currentProduct.isOnSale || currentProduct.isPromotional) && (
                  <span className="text-[10px] font-semibold text-white bg-[#FD3F37] px-2 py-0.5 rounded-full">
                    {currentProduct.discountPercentage ? `-${currentProduct.discountPercentage}%` : 'Aktion'}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-900 font-bold text-[15px]">
                {formatPrice(currentProduct.price)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 transition-interactive group-hover:translate-x-1">
          <ChevronRight className="w-5 h-5 text-gray-400 transition-interactive" />
        </div>
      </div>
    </div>
  )
}
