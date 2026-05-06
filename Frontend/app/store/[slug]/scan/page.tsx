'use client'

import { useParams } from 'next/navigation'
import SnanerDash from '@/components/user/SnanerDash'
import { useStoreData } from '@/hooks/data/useStoreData'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StoreScanPage() {
  const params = useParams()
  const slug = params.slug as string
  const { store, isLoading: storeLoading } = useStoreData({ slug, autoLoad: true })

  if (storeLoading || !store) {
    return (
      <DashboardLoadingState
        mode="page"
        message="Scanner wird geladen..."
        className="animate-page-enter"
      />
    )
  }

  return (
    <div 
      className="w-full flex items-center justify-center"
      style={{
        height: '100%',
        minHeight: 0,
        maxHeight: '100%',
        overflow: 'hidden',
      }}
    >
      <SnanerDash />
    </div>
  )
}

