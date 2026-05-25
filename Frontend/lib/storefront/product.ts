import type { Product as ApiProduct } from '@/lib/services/productService'

// Tipo buyer-safe — sin costPrice, margin, notes, supplier, location
// Compatible con Product del cartStore (requiere createdAt/updatedAt)
export interface BuyerProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  promotionalPrice?: number
  category: string
  categoryId: string
  stock: number
  initialStock?: number
  sku: string
  barcode?: string
  qrCode?: string
  rating?: number
  reviews?: number
  tags: string[]
  isNew?: boolean
  isPopular?: boolean
  isOnSale?: boolean
  isPromotional?: boolean
  isActive?: boolean
  weight?: number
  hasWeight?: boolean
  discountPercentage?: number
  image?: string
  images?: string[]
  currency?: string
  promotionTitle?: string
  promotionType?: 'percentage' | 'amount' | 'flash' | 'bogo' | 'bundle'
  promotionStartAt?: string
  promotionEndAt?: string
  promotionBadge?: string
  promotionActionLabel?: string
  promotionPriority?: number
  parentId?: string
  variants?: BuyerProduct[]
  unit?: string
  createdAt: string
  updatedAt: string
}

const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === '1') return true
  return false
}

const parseNumber = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const normalizeBuyerProduct = (product: ApiProduct): BuyerProduct => {
  const price = parseNumber(product.price)
  const promotionalPrice = product.promotionalPrice ? parseNumber(product.promotionalPrice) : undefined
  const isPromotional = parseBoolean(product.isPromotional)

  const effectivePromotionalPrice =
    isPromotional && promotionalPrice && promotionalPrice < price ? promotionalPrice : undefined

  const discountPercentage =
    effectivePromotionalPrice && price > 0
      ? Math.round(((price - effectivePromotionalPrice) / price) * 100)
      : undefined

  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price,
    originalPrice: effectivePromotionalPrice ? price : undefined,
    promotionalPrice: effectivePromotionalPrice,
    category: product.category || '',
    categoryId: product.categoryId || '',
    stock: parseNumber(product.stock),
    sku: product.sku || '',
    tags: Array.isArray(product.tags) ? product.tags : [],
    isNew: parseBoolean(product.isNew),
    isPopular: parseBoolean(product.isPopular),
    isOnSale: parseBoolean(product.isOnSale),
    isPromotional,
    isActive: parseBoolean(product.isActive),
    weight: product.weight ? parseNumber(product.weight) : undefined,
    hasWeight: parseBoolean(product.hasWeight),
    discountPercentage,
    image: product.image,
    images: product.images,
    currency: product.currency || 'CHF',
    promotionTitle: product.promotionTitle,
    promotionType: product.promotionType,
    promotionStartAt: product.promotionStartAt,
    promotionEndAt: product.promotionEndAt,
    promotionBadge: product.promotionBadge,
    promotionActionLabel: product.promotionActionLabel,
    promotionPriority: product.promotionPriority,
    parentId: (product as unknown as Record<string, unknown>).parentId as string | undefined,
    unit: (product as unknown as Record<string, unknown>).unit as string | undefined,
    createdAt: product.createdAt ?? '',
    updatedAt: product.updatedAt ?? '',
  }
}
