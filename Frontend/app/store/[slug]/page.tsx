'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { useCartStore } from '@/lib/stores/cartStore'
import DashboardUser from '@/components/user/Dashboard'
import { buildApiUrl } from '@/lib/config/api'
import { ModernSpinner } from '@/components/ui'

export default function StoreProductsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { setStore, store } = useScannedStoreStore()
  const { setCurrentStore } = useCartStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Cargar información de la tienda
    const loadStore = async () => {
      setIsLoading(true)
      try {
        const url = buildApiUrl(`/api/store/${slug}`);
        const response = await fetch(url);
        const result = await response.json()
        
        if (result.success) {
          // Guardar información completa de la tienda incluyendo isOpen
          const storeData = {
            id: result.data.id,
            name: result.data.name,
            slug: result.data.slug,
            logo: result.data.logo,
            isOpen: result.data.isOpen, // Agregar estado isOpen
            isActive: result.data.isActive, // También guardar isActive
            address: result.data.address, // Agregar dirección si está disponible
          }
          setStore(storeData)
          setCurrentStore(slug) // Cambiar al carrito de esta tienda
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStore()
  }, [slug, setStore, setCurrentStore])

  // Mostrar loading mientras se carga la tienda
  if (isLoading || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-cream">
        <ModernSpinner size="lg" color="brand" className="mb-4" />
        <p className="text-gray-600 text-lg font-medium">Laden...</p>
      </div>
    )
  }

  return <DashboardUser />
}

