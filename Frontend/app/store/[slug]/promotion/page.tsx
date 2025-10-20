'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import PromotionPage from '@/app/user/promotion/page'
import { useScannedStoreStore } from '@/lib/stores/scannedStoreStore'

export default function StorePromotionPage() {
  const params = useParams()
  const slug = params.slug as string
  const { setStore } = useScannedStoreStore()

  useEffect(() => {
    const loadStore = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/store/${slug}`)
        const result = await response.json()
        if (result.success) {
          setStore(result.data)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadStore()
  }, [slug, setStore])

  return <PromotionPage />
}

