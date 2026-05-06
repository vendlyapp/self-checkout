'use client'

import { useParams } from 'next/navigation'
import DashboardUser from '@/components/user/Dashboard'
import { useStoreData } from '@/hooks/data/useStoreData'
import { useStoreProducts } from '@/hooks/queries/useStoreProducts'
import { useCategories } from '@/hooks/queries/useCategories'
import { useAuth } from '@/lib/auth/AuthContext'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

export default function StoreProductsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { store, isLoading: storeLoading } = useStoreData({ slug, autoLoad: true })
  const { loading: authLoading, session } = useAuth()
  const { isLoading: productsLoading, isFetching: productsFetching } = useStoreProducts({
    slug: store?.slug || '',
    enabled: !!store?.slug,
  })
  const { isLoading: categoriesLoading, isFetching: categoriesFetching } = useCategories()

  // Mantener el loader hasta tener tienda + productos + categorías listos
  // para evitar renders parciales (header primero y filtros/categorías después).
  const isCategoriesPending = !authLoading && !!session && (categoriesLoading || categoriesFetching)
  const isProductsPending = !!store?.slug && (productsLoading || productsFetching)
  const shouldShowPageLoader = storeLoading || !store || isProductsPending || isCategoriesPending

  if (shouldShowPageLoader) {
    return (
      <DashboardLoadingState
        mode="page"
        message="Produkte werden geladen..."
        className="animate-page-enter"
      />
    )
  }

  return (
    <>
      <div className="min-w-0 animate-fade-in">
        <DashboardUser />
      </div>
    </>
  )
}

