'use client'

import { useState } from 'react'
import { Plus, Minus, ChevronDown, Package, Percent } from 'lucide-react'

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

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  initialQuantity?: number
}

export default function ProductCard({ product, onAddToCart, initialQuantity = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [showWeightOptions, setShowWeightOptions] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState('500g')

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
      onAddToCart(product, newQuantity)
    }
  }

  const formatPrice = (price: number) => {
    if (price % 1 === 0) {
      return `CHF ${price}.-`
    }
    return `CHF ${price.toFixed(2)}`
  }

  return (
    <div className="bg-[#f5f5f5] rounded-[20px] p-3 relative">
      {/* Badge de precio */}
      <div className="absolute top-2 right-2 bg-[#e8e8e8] rounded-lg px-3.5 py-1.5">
        <span className="text-[15px] font-bold text-gray-800">
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Badge de descuento */}
      {product.discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          <div className="flex items-center justify-center">
            <Percent className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Icono del producto */}
        <div className="w-[90px] h-[90px] rounded-[16px] overflow-hidden flex-shrink-0 bg-white flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-600" />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-between h-[92px]">
          {/* Título del producto */}
          <div className="pr-24">
            <h3 className="text-gray-900 text-[17px] leading-[1.3] tracking-tight font-semibold">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center justify-between">
            {/* Selector de peso - solo si hasWeight es true */}
            {product.hasWeight ? (
              <div className="relative">
                <button
                  onClick={() => setShowWeightOptions(!showWeightOptions)}
                  className="flex items-center gap-1.5 text-[15px] text-gray-700 hover:text-gray-900 transition-colors py-1"
                >
                  <span className="font-medium">{selectedWeight}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                
                {showWeightOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 min-w-[120px]">
                    {['250g', '500g', '1kg'].map((weight) => (
                      <button
                        key={weight}
                        onClick={() => {
                          setSelectedWeight(weight)
                          setShowWeightOptions(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[15px] text-gray-500">
                Unidad
              </div>
            )}

            {/* Controles de cantidad */}
            <div className="flex items-center gap-3">
              {quantity > 0 && (
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-10 h-10 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] text-gray-700 flex items-center justify-center transition-all duration-200"
                >
                  <Minus className="w-5 h-5" strokeWidth={2.5} />
                </button>
              )}
              
              <span className="text-[18px] font-semibold text-gray-900 min-w-[28px] text-center select-none">
                {quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stock}
                className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#86efac] disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
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