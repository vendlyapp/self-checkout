'use client'

import { useState } from 'react'
import { Plus, Minus, ChevronDown } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  image?: string
  unit?: string
  availableWeights?: string[]
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  initialQuantity?: number
}

export default function ProductCard({ product, onAddToCart, initialQuantity = 1 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [showWeightOptions, setShowWeightOptions] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState('500g')

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
      if (newQuantity > 0) {
        onAddToCart(product, newQuantity)
      }
    }
  }

  const formatPrice = (price: number) => {
    // Formato suizo: CHF 7.- para números enteros
    if (price % 1 === 0) {
      return `CHF ${price}.-`
    }
    return `CHF ${price.toFixed(2)}`
  }

  return (
    <div className="bg-[#f5f5f5] rounded-[20px] p-5 relative" style={{ minHeight: '132px' }}>
      {/* Badge de precio - posición exacta */}
      <div className="absolute top-5 right-5 bg-[#e8e8e8] rounded-full px-3.5 py-1.5">
        <span className="text-[15px] font-medium text-gray-800">
          {formatPrice(product.price)}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Imagen del producto */}
        <div className="w-[100px] h-[92px] rounded-[16px] overflow-hidden flex-shrink-0 bg-white">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#f0f0f0] flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-between h-[92px]">
          {/* Título del producto */}
          <div className="pr-24">
            <h3 className="font-semibold text-gray-900 text-[17px] leading-[1.3] tracking-tight">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center">
            {/* Selector de peso */}
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

            {/* Espaciador */}
            <div className="flex-1" />

            {/* Controles de cantidad */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity === 0}
                className="w-10 h-10 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] disabled:bg-[#e5e5e5] disabled:cursor-not-allowed text-gray-700 flex items-center justify-center transition-all duration-200"
              >
                <Minus className="w-5 h-5" strokeWidth={2.5} />
              </button>
              
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