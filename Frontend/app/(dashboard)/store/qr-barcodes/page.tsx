'use client'

import { useMemo, useState } from 'react'
import { useProducts } from '@/hooks/queries/useProducts'
import { useResponsive } from '@/hooks'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'
import { QrCode, Download, Search, Barcode, PackageCheck, AlertCircle } from 'lucide-react'
import type { Product } from '@/components/dashboard/products_list/data/mockProducts'

function downloadQR(product: Product) {
  if (!product?.qrCode) return
  const link = document.createElement('a')
  link.href = product.qrCode
  link.download = `QR_${product.name?.replace(/\s+/g, '_')}_${product.id}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadBarcode(product: Product) {
  if (!product?.barcodeImage) return
  const link = document.createElement('a')
  link.href = product.barcodeImage
  link.download = `Barcode_${product.name?.replace(/\s+/g, '_')}_${product.id}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

type CodeFilter = 'all' | 'ready' | 'missing'

function hasAnyCode(product: Product) {
  const variants = product.variants && product.variants.length > 0 ? product.variants : [product]
  return variants.some((variant) => Boolean(variant.qrCode || variant.barcodeImage))
}

function groupProductsWithVariants(products: Product[]): Product[] {
  const parentProducts = products.filter((product) => !product.parentId)
  const variantsMap = new Map<string, Product[]>()

  for (const product of products) {
    if (!product.parentId) continue
    if (!variantsMap.has(product.parentId)) {
      variantsMap.set(product.parentId, [])
    }
    variantsMap.get(product.parentId)!.push(product)
  }

  return parentProducts.map((parent) => {
    const variants = variantsMap.get(parent.id) || []
    return {
      ...parent,
      variants: variants.length > 0 ? variants : undefined,
    }
  })
}

function ProductRow({
  product,
  isMobile,
  index,
}: {
  product: Product
  isMobile: boolean
  index: number
}) {
  const variants = product.variants && product.variants.length > 0 ? product.variants : [product]
  const readyCodesCount = variants.filter((variant) => Boolean(variant.qrCode || variant.barcodeImage)).length

  if (isMobile) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-muted ring-1 ring-border/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-muted-foreground/60" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                {product.name}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">
                  <PackageCheck className="w-3 h-3" />
                  {readyCodesCount}/{variants.length} bereit
                </span>
                {variants.length > 1 && (
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {variants.length} Varianten
                  </span>
                )}
                {product.sku && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    SKU: {product.sku}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {variants.map((variant) => (
            <div key={variant.id} className="rounded-xl border border-border/70 p-3 bg-background">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-foreground truncate">
                  {variant.name}
                </p>
                <span className="text-[10px] text-muted-foreground truncate">
                  {variant.sku || 'Variante'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => downloadQR(variant)}
                  disabled={!variant.qrCode}
                  className="h-9 rounded-lg border border-border bg-card flex items-center justify-center gap-1.5 text-[11px] font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
                  title="QR herunterladen"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR
                </button>
                <button
                  type="button"
                  onClick={() => downloadBarcode(variant)}
                  disabled={!variant.barcodeImage}
                  className="h-9 rounded-lg border border-border bg-card flex items-center justify-center gap-1.5 text-[11px] font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
                  title="Barcode herunterladen"
                >
                  <Barcode className="w-3.5 h-3.5" />
                  Barcode
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const isEven = index % 2 === 0
  return (
    <div className={`py-4 px-4 transition-colors duration-150 ${isEven ? 'bg-muted/20' : 'bg-transparent'} hover:bg-muted/40`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-muted/80 ring-1 ring-border/40 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : (
            <div className="w-full h-full flex items-center justify-center">
              <QrCode className="w-7 h-7 text-muted-foreground/60" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {variants.length} Varianten · {readyCodesCount} mit Code
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            variants.forEach((variant) => {
              if (variant.qrCode) downloadQR(variant)
              if (variant.barcodeImage) downloadBarcode(variant)
            })
          }}
          disabled={!hasAnyCode(product)}
          className="h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
            transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed inline-flex items-center gap-1.5 text-xs font-semibold"
          title="Alle herunterladen"
        >
          <Download className="w-3.5 h-3.5" />
          Alle Varianten
        </button>
      </div>

      <div className="space-y-2">
        {variants.map((variant) => (
          <div key={variant.id} className="grid grid-cols-[1fr_96px_96px] items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{variant.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{variant.sku || 'Variante'}</p>
            </div>
            <button
              type="button"
              onClick={() => downloadQR(variant)}
              disabled={!variant.qrCode}
              className="h-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground
              transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed inline-flex items-center justify-center gap-1 text-[11px] font-semibold"
            >
              <QrCode className="w-3.5 h-3.5" />
              QR
            </button>
            <button
              type="button"
              onClick={() => downloadBarcode(variant)}
              disabled={!variant.barcodeImage}
              className="h-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground
              transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed inline-flex items-center justify-center gap-1 text-[11px] font-semibold"
            >
              <Barcode className="w-3.5 h-3.5" />
              Code
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function QRBarcodesPage() {
  const { isMobile } = useResponsive()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<CodeFilter>('all')

  const { data: products, isLoading, error } = useProducts({
    includeCodes: true,
    includeInactive: true,
    limit: 100,
  })

  const rawList = products ?? []
  const list = useMemo(() => groupProductsWithVariants(rawList), [rawList])
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    return list.filter((product) => {
      const variants = product.variants && product.variants.length > 0 ? product.variants : [product]
      const matchesVariantSearch = variants.some((variant) =>
        variant.name.toLowerCase().includes(normalizedQuery) ||
        variant.sku?.toLowerCase().includes(normalizedQuery)
      )
      const matchesSearch =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        matchesVariantSearch

      const hasCodes = hasAnyCode(product)
      const matchesFilter =
        filter === 'all' ? true : filter === 'ready' ? hasCodes : !hasCodes

      return matchesSearch && matchesFilter
    })
  }, [list, normalizedQuery, filter])

  const stats = useMemo(() => {
    const total = list.length
    const ready = list.filter((p) => hasAnyCode(p)).length
    const missing = total - ready
    return { total, ready, missing }
  }, [list])

  const hasProducts = list.length > 0
  const hasFilteredProducts = filtered.length > 0

  if (isLoading) {
    return <DashboardLoadingState mode="page" message="Wird geladen..." />
  }

  if (error) {
    return (
      <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-8 max-w-5xl mx-auto min-w-0">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-destructive font-medium">
            {error instanceof Error ? error.message : 'Fehler beim Laden der Produkte'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 h-full overflow-auto">
      <div className="p-4 md:px-6 md:pt-10 md:pb-8 lg:p-8 max-w-6xl mx-auto min-w-0">
        <div className="mb-6 rounded-3xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  QR- & Barcodes
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Alle Produktcodes zentral verwalten und als PNG herunterladen.
              </p>
            </div>
            <div className="hidden md:inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
              Scan-ready Assets
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3 mt-5">
            <div className="rounded-xl border border-border/70 bg-background p-3">
              <p className="text-[11px] text-muted-foreground">Produkte</p>
              <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-3">
              <p className="text-[11px] text-muted-foreground">Mit Code</p>
              <p className="text-xl md:text-2xl font-bold text-primary mt-1">{stats.ready}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background p-3">
              <p className="text-[11px] text-muted-foreground">Ausstehend</p>
              <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{stats.missing}</p>
            </div>
          </div>
        </div>

        {hasProducts && (
          <div className="mb-5 rounded-2xl border border-border bg-card p-3 md:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nach Produktname oder SKU suchen ..."
                className="w-full h-10 rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold transition ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Alle
              </button>
              <button
                type="button"
                onClick={() => setFilter('ready')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold transition ${
                  filter === 'ready'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Nur bereit
              </button>
              <button
                type="button"
                onClick={() => setFilter('missing')}
                className={`h-8 px-3 rounded-lg text-xs font-semibold transition ${
                  filter === 'missing'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Ohne Code
              </button>
            </div>
          </div>
        )}

        {!hasProducts && (
          <div className="rounded-2xl border border-border bg-card p-10 md:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground text-base">Keine Produkte</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Produkte anlegen, um hier QR- und Barcodes zu sehen und herunterzuladen.
            </p>
          </div>
        )}

        {hasProducts && !hasFilteredProducts && (
          <div className="rounded-2xl border border-border bg-card p-10 md:p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground text-base">Keine Treffer</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Passe deine Suche oder den Filter an, um Produkte anzuzeigen.
            </p>
          </div>
        )}

        {hasProducts && hasFilteredProducts && (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className={isMobile ? 'p-4 space-y-4' : 'divide-y divide-border/60'}>
              {filtered.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  isMobile={isMobile}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
