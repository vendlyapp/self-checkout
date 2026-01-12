'use client'

import { useParams } from 'next/navigation'
import DashboardUser from '@/components/user/Dashboard'
import { useStoreData } from '@/hooks/data/useStoreData'

export default function StoreProductsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { store } = useStoreData({ slug, autoLoad: true })

  return (
    <>
      {store && (
        <div className="animate-fade-in gpu-accelerated">
          <DashboardUser />
        </div>
      )}
    </>
  )
}

