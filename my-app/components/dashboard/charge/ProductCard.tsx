'use client'

import { useState } from 'react'
import { Plus, Minus, ChevronDown, Package, Percent } from 'lucide-react'
import { Product } from '../products_list/data/mockProducts';
import Image from 'next/image';

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number) => void
  initialQuantity?: number
}

export default function ProductCard({ product, onAddToCart, initialQuantity = 0 }: ProductCardProps) {
  const [showWeightOptions, setShowWeightOptions] = useState(false)
  const [selectedWeight, setSelectedWeight] = useState('500g')

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 0 && newQuantity <= product.stock) {
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
    <div className="bg-white rounded-[20px] h-[130px] p-4  relative">
      {/* Badge de precio */}
      <div className="absolute top-3 right-3">
        {product.originalPrice ? (
          <div className="flex flex-col items-end gap-1">
            {/* Precio nuevo en rojo */}
            <span className="text-[15px] bg-[#F2EDE8] rounded-lg px-2 py-1 font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            {/* Precio original tachado */}
            <span className="text-[12px] text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
        ) : (
          <span className="text-[15px] bg-[#F2EDE8] rounded-lg px-2 py-1 font-bold text-gray-800">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Badge de descuento */}
      {product.discountPercentage && (
        <div className="absolute top-3 left-3 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
          <div className="flex items-center justify-center">
            <Percent className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 mt-2">
        {/* Icono del producto */}
        <div className='flex items-center gap-2 w-[80px] h-[80px] rounded-[16px] overflow-hidden mr-4'>
            {product.image ? (
          <Image 
            src={product.image} 
            alt={product.name} 
            width={100} 
            height={100}
            className="rounded-[16px] object-cover "
          />
        ) : (
          <div className="w-[80px] h-[80px] rounded-[16px] bg-gray-100 flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col justify-between min-h-[80px] ">
          {/* Título del producto */}
          <div className="pr-20 mb-4">
            <h3 className="text-gray-900 text-[16px] leading-[1.3]  w-[80%] tracking-tight font-semibold ">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center justify-between h-[25px]">
            {/* Selector de peso - solo si hasWeight es true */}
            {product.hasWeight ? (
              <div className="relative bg-[#F7F4F1] rounded-lg text-center w-[70px] h-[30px] flex items-center justify-center">
                <button
                  onClick={() => setShowWeightOptions(!showWeightOptions)}
                  className="flex items-center gap-1.5 text-[14px] text-gray-700 hover:text-gray-900 transition-colors py-1"
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
                        className="block w-full text-left px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {weight}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[14px] text-gray-500">
                Unidad
              </div>
            )}

            {/* Controles de cantidad */}
            <div className="flex items-center gap-2 h-full pt-4">
              <button
                onClick={() => handleQuantityChange(initialQuantity - 1)}
                className="w-8 h-8 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] text-gray-700 flex items-center justify-center transition-all duration-200"
                disabled={initialQuantity <= 0}
              >
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="text-[16px] font-semibold text-gray-900 min-w-[24px] text-center select-none">
                {initialQuantity}
              </span>
              <button
                onClick={() => handleQuantityChange(initialQuantity + 1)}
                disabled={initialQuantity >= product.stock}
                className="w-10 h-10 rounded-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-[#86efac] disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}