/**
 * Data transfer objects by API surface (public / admin / super-admin).
 * Keeps payloads minimal per consumer.
 */

// ─── Public (storefront, buyer, legacy public endpoints) ─────────────────────

function publicStoreDto(s) {
  if (!s) return null;
  return {
    slug: s.slug,
    name: s.name,
    description: s.description || null,
    logo: s.logo || null,
    isOpen: s.isOpen ?? true,
    address: s.address || null,
    phone: s.phone || null,
    email: s.email || null,
  };
}

function publicProductDto(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    description: p.description || null,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    category: p.category || null,
    categoryId: p.categoryId || null,
    image: p.image || null,
    images: Array.isArray(p.images) ? p.images : [],
    isNew: p.isNew ?? false,
    isPopular: p.isPopular ?? false,
    isOnSale: p.isOnSale ?? false,
    tags: Array.isArray(p.tags) ? p.tags : [],
    barcode: p.barcode || null,
    sku: p.sku || null,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : null,
    promotionTitle: p.promotionTitle || null,
    promotionBadge: p.promotionBadge || null,
    promotionActionLabel: p.promotionActionLabel || null,
    hasWeight: p.hasWeight ?? false,
    parentId: p.parentId || null,
    inStock: Number(p.stock ?? 0) > 0,
  };
}

function publicCategoryDto(c) {
  if (!c) return null;
  return {
    id: c.id,
    name: c.name,
    isActive: c.isActive ?? true,
  };
}

// ─── Admin (merchant dashboard) ──────────────────────────────────────────────

function adminStoreDto(s) {
  if (!s) return null;
  return {
    id: s.id,
    ownerId: s.ownerId,
    name: s.name,
    slug: s.slug,
    description: s.description || null,
    logo: s.logo || null,
    isActive: s.isActive ?? true,
    isOpen: s.isOpen ?? true,
    address: s.address || null,
    phone: s.phone || null,
    email: s.email || null,
    vatNumber: s.vatNumber || null,
    goalDaily: s.goalDaily ?? null,
    goalWeekly: s.goalWeekly ?? null,
    goalMonthly: s.goalMonthly ?? null,
    settingsCompletedAt: s.settingsCompletedAt || null,
    onboardingCompletedAt: s.onboardingCompletedAt || null,
    qrCode: s.qrCode || null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

const {
  toPublicImageDto,
  toPublicImagesDto,
} = require('../utils/productImageUrl');

/** Lista Kasse — sin metadatos de edición; solo URLs Supabase Storage */
function catalogProductDto(p) {
  if (!p) return null;
  const image = toPublicImageDto(p.image);
  const images = toPublicImagesDto(p.images, p.image);
  return {
    id: p.id,
    ownerId: p.ownerId,
    name: p.name,
    description: null,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    category: p.category || null,
    categoryId: p.categoryId || null,
    stock: Number(p.stock ?? 0),
    sku: p.sku || null,
    tags: [],
    isNew: p.isNew ?? false,
    isPopular: p.isPopular ?? false,
    isOnSale: p.isOnSale ?? false,
    isActive: p.isActive ?? true,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : null,
    image,
    images,
    parentId: p.parentId || null,
    currency: 'CHF',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

function adminProductDto(p) {
  if (!p) return null;
  const dto = {
    id: p.id,
    ownerId: p.ownerId,
    name: p.name,
    description: p.description || null,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    category: p.category || null,
    categoryId: p.categoryId || null,
    stock: Number(p.stock ?? 0),
    initialStock: p.initialStock != null ? Number(p.initialStock) : null,
    barcode: p.barcode || null,
    sku: p.sku || null,
    tags: Array.isArray(p.tags) ? p.tags : [],
    isNew: p.isNew ?? false,
    isPopular: p.isPopular ?? false,
    isOnSale: p.isOnSale ?? false,
    isActive: p.isActive ?? true,
    rating: p.rating != null ? Number(p.rating) : null,
    weight: p.weight != null ? Number(p.weight) : null,
    hasWeight: p.hasWeight ?? false,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : null,
    image: toPublicImageDto(p.image),
    images: toPublicImagesDto(p.images, p.image),
    currency: p.currency || 'CHF',
    promotionTitle: p.promotionTitle || null,
    promotionType: p.promotionType || null,
    promotionStartAt: p.promotionStartAt || null,
    promotionEndAt: p.promotionEndAt || null,
    promotionBadge: p.promotionBadge || null,
    promotionActionLabel: p.promotionActionLabel || null,
    promotionPriority: p.promotionPriority ?? null,
    supplier: p.supplier || null,
    costPrice: p.costPrice != null ? Number(p.costPrice) : null,
    margin: p.margin != null ? Number(p.margin) : null,
    taxRate: p.taxRate != null ? Number(p.taxRate) : null,
    expiryDate: p.expiryDate || null,
    location: p.location || null,
    notes: p.notes || null,
    parentId: p.parentId || null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
  if (p.includeCodes) {
    dto.qrCode = p.qrCode || null;
    dto.barcodeImage = p.barcodeImage || null;
  }
  return dto;
}

function adminInvoiceDto(inv) {
  if (!inv) return null;
  return {
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    orderId: inv.orderId,
    storeId: inv.storeId,
    customerName: inv.customerName || null,
    customerEmail: inv.customerEmail || null,
    subtotal: Number(inv.subtotal ?? 0),
    discountAmount: Number(inv.discountAmount ?? 0),
    taxAmount: Number(inv.taxAmount ?? 0),
    total: Number(inv.total ?? 0),
    paymentMethod: inv.paymentMethod || null,
    issuedAt: inv.issuedAt,
    createdAt: inv.createdAt,
    shareToken: inv.shareToken || null,
  };
}

// ─── Super Admin (platform) ──────────────────────────────────────────────────

function superAdminStoreDto(s) {
  if (!s) return null;
  return {
    id: s.id,
    ownerId: s.ownerId,
    ownerName: s.ownerName || s.owner_name || null,
    ownerEmail: s.ownerEmail || s.owner_email || null,
    name: s.name,
    slug: s.slug,
    isActive: s.isActive ?? true,
    isOpen: s.isOpen ?? true,
    productCount: s.productCount != null ? Number(s.productCount) : undefined,
    totalRevenue: s.totalRevenue != null ? Number(s.totalRevenue) : undefined,
    orderCount: s.orderCount != null ? Number(s.orderCount) : undefined,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

function superAdminProductDto(p) {
  if (!p) return null;
  return {
    ...adminProductDto(p),
    storeId: p.storeId || null,
    storeName: p.storeName || null,
    ownerEmail: p.ownerEmail || null,
  };
}

function mapList(dtoFn, items, extra = {}) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => dtoFn({ ...item, ...extra }));
}

function mapResponse(dtoFn, result, listKey = 'data') {
  if (!result || !result.success) return result;
  const data = result[listKey];
  if (Array.isArray(data)) {
    return { ...result, data: mapList(dtoFn, data), count: result.count ?? data.length };
  }
  if (data && typeof data === 'object') {
    return { ...result, data: dtoFn(data) };
  }
  return result;
}

module.exports = {
  publicStoreDto,
  publicProductDto,
  publicCategoryDto,
  adminStoreDto,
  adminProductDto,
  catalogProductDto,
  adminInvoiceDto,
  superAdminStoreDto,
  superAdminProductDto,
  mapList,
  mapResponse,
};
