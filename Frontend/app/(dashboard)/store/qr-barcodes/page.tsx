'use client'

import { useProducts } from '@/hooks/queries/useProducts'
import { useResponsive } from '@/hooks'
import { Loader } from '@/components/ui/Loader'
import { QrCode, Download } from 'lucide-react'
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

function ProductRow({
  product,
  isMobile,
  index,
}: {
  product: Product
  isMobile: boolean
  index: number
}) {
  if (isMobile) {
    return (
      <div
        className="flex gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm
          hover:shadow-md hover:border-border/80 transition-all duration-200"
      >
        <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-muted ring-1 ring-border/50">
          {product.image ? (
            <img src={product.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <QrCode className="w-8 h-8 text-muted-foreground/60" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 flex flex-col gap-3">
          <p className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
            {product.name}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {product.qrCode && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2">
                <img
                  src={product.qrCode}
                  alt=""
                  className="w-14 h-14 rounded-md bg-background ring-1 ring-border/30"
                />
                <button
                  type="button"
                  onClick={() => downloadQR(product)}
                  className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
                    transition-colors active:scale-95"
                  title="QR herunterladen"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
            {product.barcodeImage && (
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2">
                <img
                  src={product.barcodeImage}
                  alt=""
                  className="h-10 w-auto max-w-[100px] rounded bg-background ring-1 ring-border/30"
                />
                <button
                  type="button"
                  onClick={() => downloadBarcode(product)}
                  className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90
                    transition-colors active:scale-95"
                  title="Barcode herunterladen"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          {!product.qrCode && !product.barcodeImage && (
            <span className="text-xs text-muted-foreground">Codes werden generiert…</span>
          )}
        </div>
      </div>
    )
  }

  const isEven = index % 2 === 0
  return (
    <div
      className={`grid grid-cols-[80px_1fr_100px_150px_88px] gap-4 items-center py-4 px-4 rounded-lg
        transition-colors duration-150 ${isEven ? 'bg-muted/20' : 'bg-transparent'} hover:bg-muted/40`}
    >
      <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-xl overflow-hidden bg-muted/80 ring-1 ring-border/40 flex-shrink-0">
        {product.image ? (
          <img src={product.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <QrCode className="w-7 h-7 text-muted-foreground/60" />
          </div>
        )}
      </div>
      <p className="font-medium text-foreground text-sm min-w-0 truncate pr-2">
        {product.name}
      </p>
      <div className="flex justify-center">
        {product.qrCode ? (
          <div className="w-14 h-14 rounded-lg bg-background flex items-center justify-center ring-1 ring-border/30 p-1">
            <img src={product.qrCode} alt="" className="w-full h-full object-contain" />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/70">—</span>
        )}
      </div>
      <div className="flex justify-center">
        {product.barcodeImage ? (
          <div className="h-10 px-2 rounded-lg bg-background flex items-center justify-center ring-1 ring-border/30">
            <img
              src={product.barcodeImage}
              alt=""
              className="h-8 w-auto max-w-full object-contain"
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/70">—</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => downloadQR(product)}
          disabled={!product.qrCode}
          className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground
            transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
          title="QR herunterladen"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => downloadBarcode(product)}
          disabled={!product.barcodeImage}
          className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground
            transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed"
          title="Barcode herunterladen"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function QRBarcodesPage() {
  const { isMobile } = useResponsive()
  const { data: products, isLoading, error } = useProducts({
    includeCodes: true,
    includeInactive: true,
    limit: 100,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[280px] w-full">
        <Loader size="md" />
      </div>
    )
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

  const list = products ?? []
  const hasProducts = list.length > 0

  return (
    <div className="w-full min-w-0 h-full overflow-auto gpu-accelerated">
      <div className="p-4 md:px-6 md:pt-10 md:pb-8 lg:p-8 max-w-5xl mx-auto min-w-0">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                QR- & Barcodes
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Pro Produkt und Variante: Name, Bild, QR und Strichcode zum Herunterladen.
              </p>
            </div>
          </div>
        </div>

        {!hasProducts && (
          <div className="rounded-2xl border border-border bg-card p-10 md:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground text-base">Keine Produkte</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Produkte anlegen, um hier QR und Barcodes zu sehen und herunterzuladen.
            </p>
          </div>
        )}

        {hasProducts && (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {!isMobile && (
              <div className="grid grid-cols-[80px_1fr_100px_150px_88px] gap-4 px-4 py-3 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Bild</span>
                <span>Produkt</span>
                <span className="text-center">QR-Code</span>
                <span className="text-center">Strichcode</span>
                <span className="text-center">Download</span>
              </div>
            )}
            <div className={isMobile ? 'p-4 space-y-4' : 'divide-y divide-border/60'}>
              {list.map((product, index) => (
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
