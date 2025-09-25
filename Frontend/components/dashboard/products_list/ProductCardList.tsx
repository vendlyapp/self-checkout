'use client'

import { ChevronRight, Package } from 'lucide-react'
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
  stock: number;
  barcode?: string;
  sku: string;
  tags: string[];
  isNew?: boolean;
  isPopular?: boolean;
  isOnSale?: boolean;
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
}

interface ProductCardListProps {
  product: Product
  onClick?: (product: Product) => void
}

export default function ProductCardList({ product, onClick }: ProductCardListProps) {
  const router = useRouter()

  const formatPrice = (price: number) => {
    if (price % 1 === 0) {
      return `CHF ${price}.-` 
    }
    return `CHF ${price.toFixed(2)}`
  }

  const handleProductClick = () => {
    if (onClick) {
      onClick(product)
    } else {
      // Comportamiento por defecto: navegar a editar
      router.push(`/products_list/edit/${product.id}`)
    }
  }

  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleProductClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleProductClick()
        }
      }}
      aria-label={`Produkt bearbeiten: ${product.name}`}
    >
      <div className="flex items-center gap-4">
        {/* Icono del producto - usando Package de Lucide React */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-600" />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 text-[16px] font-semibold leading-tight mb-1 truncate">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.originalPrice ? (
              <>
                <span className="text-red-600 font-bold text-[15px]">
                  {formatPrice(product.price)}
                </span>
                <span className="text-gray-400 text-[13px] line-through">
                  statt {formatPrice(product.originalPrice)}
                </span>
              </>
            ) : (
              <span className="text-gray-900 font-bold text-[15px]">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Flecha para editar */}
        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}