'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cartStore'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { buildApiUrl } from '@/lib/config/api'
import { Product } from '@/components/dashboard/products_list/data/mockProducts'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function ProductQRPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  const { addToCart, setCurrentStore } = useCartStore()
  const { setStore } = useScannedStoreStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    const handleProductScan = async () => {
      try {
        setLoading(true)
        setError(null)

        // Buscar el producto por código QR (incluye información de la tienda)
        const url = buildApiUrl(`/api/products/qr/${encodeURIComponent(productId)}`)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Producto no encontrado')
        }

        const result = await response.json()

        if (!result.success || !result.data) {
          throw new Error('Producto no encontrado')
        }

        // Convertir el producto al formato correcto
        const productData = result.data
        const productObj: Product = {
          id: productData.id,
          name: productData.name,
          description: productData.description || '',
          price: parseFloat(productData.price) || 0,
          originalPrice: productData.originalPrice
            ? parseFloat(productData.originalPrice)
            : undefined,
          promotionalPrice: productData.promotionalPrice
            ? parseFloat(productData.promotionalPrice)
            : undefined,
          category: productData.category || '',
          categoryId: productData.categoryId || '',
          stock: parseInt(productData.stock) || 0,
          sku: productData.sku || '',
          barcode: productData.barcode,
          qrCode: productData.qrCode,
          image: productData.image,
          images: productData.images,
          isActive: productData.isActive ?? true,
          isPromotional: productData.isPromotional || false,
          isOnSale: productData.isOnSale || false,
          isNew: productData.isNew || false,
          isPopular: productData.isPopular || false,
          currency: productData.currency || 'CHF',
          tags: productData.tags || [],
          createdAt: productData.createdAt || new Date().toISOString(),
          updatedAt: productData.updatedAt || new Date().toISOString(),
        }

        // Verificar si el producto está disponible
        if (!productObj.isActive || productObj.stock <= 0) {
          throw new Error('Producto no disponible')
        }

        // Obtener información de la tienda del producto
        const storeInfo = productData.store
        if (!storeInfo || !storeInfo.slug) {
          throw new Error('Tienda no encontrada para este producto')
        }

        // Guardar la tienda en el store global
        const storeData = {
          id: storeInfo.id,
          name: storeInfo.name,
          slug: storeInfo.slug,
          logo: storeInfo.logo,
          isOpen: storeInfo.isOpen ?? true,
        }
        setStore(storeData)
        setCurrentStore(storeInfo.slug)

        // Agregar el producto al carrito
        addToCart(productObj, 1)
        setProduct(productObj)

        // Redirigir a la tienda después de un breve delay para mostrar éxito
        setTimeout(() => {
          router.push(`/store/${storeInfo.slug}`)
        }, 1500)
      } catch (err) {
        console.error('Error al procesar el producto:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Error al procesar el producto. Intenta nuevamente.'
        )
        setLoading(false)
      }
    }

    if (productId) {
      handleProductScan()
    }
  }, [productId, addToCart, setStore, setCurrentStore, router])

  // Pantalla de carga
  if (loading && !error) {
    return (
      <div className="min-h-screen bg-[#F9F6F4] flex items-center justify-center p-4 animate-fade-in">
        <div className="text-center animate-scale-in">
          <Loader2 className="w-12 h-12 text-[#25D076] animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium transition-ios">Cargando producto...</p>
        </div>
      </div>
    )
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-[#F9F6F4] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-scale-in">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-spring-bounce">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 transition-ios">Error</h3>
          <p className="text-gray-600 mb-6 transition-ios">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#25D076] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#25D076]/90 w-full transition-ios active:scale-95 touch-target"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Pantalla de éxito (se muestra brevemente antes de redirigir)
  if (product) {
    return (
      <div className="min-h-screen bg-[#F9F6F4] flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-spring-bounce">
          <div className="w-16 h-16 bg-[#25D076] rounded-full flex items-center justify-center mx-auto mb-4 animate-spring-bounce">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 transition-ios">¡Éxito!</h3>
          <p className="text-gray-600 mb-2 transition-ios">
            {product.name} fue agregado al carrito
          </p>
          <p className="text-sm text-gray-500 mb-4 transition-ios">
            Redirigiendo a la tienda...
          </p>
        </div>
      </div>
    )
  }

  return null
}

