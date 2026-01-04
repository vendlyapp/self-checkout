'use client'

import { useParams } from 'next/navigation'
import SliderP from '@/components/user/SliderP'
import ProductsList from '@/components/dashboard/charge/ProductsList'
import { Product } from '@/components/dashboard/products_list/data/mockProducts'
import { useCallback } from 'react'
import { useCartStore } from '@/lib/stores/cartStore'
import { Percent, Store } from 'lucide-react'
import { useStoreData } from '@/hooks/data/useStoreData'
import { useStorePromotions } from '@/hooks/queries/useStorePromotions'

export default function StorePromotionPage() {
  const params = useParams()
  const slug = params.slug as string
  const { store } = useStoreData({ slug, autoLoad: true })
  const { data: products = [], isLoading: productsLoading, isFetching: productsFetching } = useStorePromotions({ 
    slug: store?.slug || '', 
    enabled: !!store?.slug 
  })
  const { addToCart } = useCartStore()

  const loading = productsLoading || productsFetching

  const handleAddToCart = useCallback(
    (product: Product, quantity: number) => {
      addToCart(product, quantity)
    },
    [addToCart]
  )

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Kein Geschäft ausgewählt</p>
        <p className="text-gray-400 text-sm mt-2">Scannen Sie einen QR-Code</p>
      </div>
    )
  }

  return (
    <div>
      {products.length > 0 && (
        <div className="w-full mt-4">
          <SliderP products={products} />
        </div>
      )}
      <div className="mb-24">
        <h5 className="text-xl text-start ml-4 mt-4 font-semibold">Alle Aktionen</h5>
        {!loading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Percent className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">Keine Aktionen verfügbar</p>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Derzeit gibt es keine Produkte im Angebot. Schauen Sie später wieder vorbei!
            </p>
          </div>
        ) : (
          <ProductsList
            products={products}
            onAddToCart={handleAddToCart}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
