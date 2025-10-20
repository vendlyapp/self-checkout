'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'
import DashboardUser from '@/components/user/Dashboard'

export default function StoreProductsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { setStore } = useScannedStoreStore()

  useEffect(() => {
    // Cargar información de la tienda
    const loadStore = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/store/${slug}`)
        const result = await response.json()
        
        if (result.success) {
          setStore(result.data)
        }
      } catch (error) {
        console.error('Error loading store:', error)
      }
    }

    loadStore()
  }, [slug, setStore])

  return <DashboardUser />
}

