'use client'

import { useParams } from 'next/navigation'
import SearchUser from '@/components/user/SearchUser'
import { useStoreData } from '@/hooks/data/useStoreData'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StoreSearchPage() {
  const params = useParams()
  const slug = params.slug as string
  const { store, isLoading: storeLoading } = useStoreData({ slug, autoLoad: true })
  const { isLoading: productsLoading, isFetching: productsFetching } = useStoreProducts({
    slug: store?.slug || '',
    enabled: !!store?.slug,
  })

  const shouldShowPageLoader =
    storeLoading || !store || (!!store?.slug && (productsLoading || productsFetching))

  if (shouldShowPageLoader) {
    return (
      <DashboardLoadingState
        mode="page"
        message="Suche wird geladen..."
        className="animate-page-enter"
      />
    )
  }

  return <SearchUser />
}

