'use client'

import { useParams } from 'next/navigation'
import SnanerDash from '@/components/user/SnanerDash'
import { useStoreData } from '@/hooks/data/useStoreData'

export default function StoreScanPage() {
  const params = useParams()
  const slug = params.slug as string
  useStoreData({ slug, autoLoad: true })

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

