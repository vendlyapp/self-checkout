'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import { useCartStore } from '@/lib/stores/cartStore'
import DashboardUser from '@/components/user/Dashboard'
import { buildApiUrl } from '@/lib/config/api'

export default function StoreProductsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { setStore } = useScannedStoreStore()
  const { setCurrentStore } = useCartStore()

  useEffect(() => {
    // Cargar información de la tienda
    const loadStore = async () => {
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
          }
          setStore(storeData)
          setCurrentStore(slug) // Cambiar al carrito de esta tienda
        }
      } catch (error) {
        console.error('Error loading store:', error)
      }
    }

    loadStore()
  }, [slug, setStore, setCurrentStore])

  return <DashboardUser />
}

