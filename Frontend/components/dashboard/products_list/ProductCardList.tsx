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

  const formatPrice = (price: number): string => {
    return price % 1 === 0 ? `CHF ${price}.-` : `CHF ${price.toFixed(2)}`
  }

  const handleProductClick = () => {
    if (onClick) {
      onClick(product)
    } else {
      router.push(`/products_list/view/${product.id}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleProductClick()
    }
  }

  return (
    <div 
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleProductClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Produkt anzeigen: ${product.name}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
          <Package className="w-8 h-8 text-gray-600" />
        </div>

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

        <div className="flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}
