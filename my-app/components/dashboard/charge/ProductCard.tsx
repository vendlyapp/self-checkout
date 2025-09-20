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
      return `${price}.-`
    }
    return `${price.toFixed(2)}`
  }

  return (
    <div className="bg-white rounded-[20px] lg:rounded-2xl h-[130px] lg:h-[160px] p-4 lg:p-6 relative hover:shadow-md transition-all duration-200">
      {/* Badge de precio */}
      <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
        {product.originalPrice ? (
          <div className="flex flex-col items-end gap-1">
            {/* Precio nuevo en rojo */}
            <span className="text-[15px] lg:text-[16px] bg-[#F2EDE8] rounded-lg px-2 py-1 lg:px-3 lg:py-1.5 font-bold text-red-600">
              <span className="text-[10px] lg:text-[11px] font-semibold">CHF</span> {formatPrice(product.price)}
            </span>
            {/* Precio original tachado */}
            <span className="text-[12px] lg:text-[13px] text-gray-500 line-through">
            <span className="text-[10px] lg:text-[11px] font-semibold">CHF</span> {formatPrice(product.originalPrice)}
            </span>
          </div>
        ) : (
          <span className="text-[15px] lg:text-[16px] bg-[#F2EDE8] rounded-lg px-2 py-1 lg:px-3 lg:py-1.5 font-bold text-gray-800">
            <span className="text-[10px] lg:text-[11px] font-semibold">CHF</span> {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Badge de descuento */}
      {product.discountPercentage && (
        <div className="absolute top-3 left-3 lg:top-4 lg:left-4 bg-red-500 rounded-full w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center shadow-md">
          <div className="flex items-center justify-center">
            <Percent className="w-4 h-4 lg:w-5 lg:h-5 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 lg:gap-6 mt-2">
        {/* Icono del producto */}
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
          {/* Título del producto */}
          <div className="pr-20 lg:pr-24 mb-4">
            <h3 className="text-gray-900 text-[16px] lg:text-[18px] leading-[1.3] w-[90%] tracking-tight font-semibold">
              {product.name}
            </h3>
          </div>

          {/* Controles en la parte inferior */}
          <div className="flex items-center justify-between h-[25px] lg:h-[30px]">
            {/* Selector de peso - solo si hasWeight es true */}
            {product.hasWeight ? (
              <div className="relative bg-[#F7F4F1] rounded-lg text-center w-[70px] h-[30px] lg:w-[80px] lg:h-[35px] flex items-center justify-center">
                <button
                  onClick={() => setShowWeightOptions(!showWeightOptions)}
                  className="flex items-center gap-1.5 text-[14px] lg:text-[15px] text-gray-700 hover:text-gray-900 transition-colors py-1"
                >
                  <span className="font-medium">{selectedWeight}</span>
                  <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                </button>
                {showWeightOptions && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20 min-w-[100px] max-w-[100px] lg:min-w-[120px] lg:max-w-[120px]">
                    {['250g', '500g', '1kg'].map((weight) => (
                      <button
                        key={weight}
                        onClick={() => {
                          setSelectedWeight(weight)
                          setShowWeightOptions(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-[14px] lg:text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {weight}
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
              {initialQuantity > 0 && (
                <>
                  <button
                    onClick={() => handleQuantityChange(initialQuantity - 1)}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#d1d1d1] hover:bg-[#c0c0c0] text-white flex items-center justify-center transition-all duration-200"
                    disabled={initialQuantity <= 0}
                  >
                    <Minus className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                  </button>
                  <span className="text-[16px] lg:text-[18px] font-bold text-gray-900 min-w-[24px] lg:min-w-[28px] text-center select-none">
                    {initialQuantity}
                  </span>
                </>
              )}
              <button
                onClick={() => handleQuantityChange(initialQuantity + 1)}
                disabled={initialQuantity >= product.stock}
                className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#25D076] hover:bg-[#25D076]/80 disabled:bg-[#25D076]/50 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                <Plus className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
