/**
 * Storefront API client
 *
 * All calls target the buyer-safe `/api/storefront/` namespace.
 * No auth token is sent — these endpoints are intentionally public.
 * No internal IDs (storeId, ownerId) are exposed or required here.
 */

import { buildApiUrl } from '@/lib/config/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StorefrontStore {
  slug: string;
  name: string;
  description: string | null;
  logo: string | null;
  isOpen: boolean;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  category: string | null;
  categoryId: string | null;
  image: string | null;
  images: string[];
  isNew: boolean;
  isPopular: boolean;
  isOnSale: boolean;
  tags: string[];
  barcode: string | null;
  sku: string | null;
  discountPercentage: number | null;
  promotionTitle: string | null;
  promotionBadge: string | null;
  promotionActionLabel: string | null;
  hasWeight: boolean;
  parentId: string | null;
  inStock: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  isActive: boolean;
}

export interface StorefrontPaymentOption {
  code: string;
  displayName: string;
  icon: string | null;
  bgColor: string | null;
  textColor: string | null;
}

export interface StorefrontOrderItem {
  productId: string;
  quantity: number;
}

export interface StorefrontCustomer {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
}

export interface StorefrontOrderReceipt {
  publicOrderToken: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  qrPaymentConfirmToken?: string;
  qrrReference?: string;
}

export interface StorefrontQuoteResult {
  items: Array<{ productId: string; name: string; price: number; quantity: number; lineTotal: number }>;
  subtotal: number;
  discountAmount: number;
  discountCode: { code: string; discountType: string; discountValue: number; discountAmount: number } | null;
  total: number;
}

export interface StorefrontInvoiceData {
  shareToken: string;
  invoiceNumber: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function sfFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = buildApiUrl(path);
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || `Storefront API error: ${path}`);
  }
  return json.data as T;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export async function fetchStorefrontStore(slug: string): Promise<StorefrontStore> {
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}`);
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface CatalogOptions {
  search?: string;
  categoryId?: string;
  sortBy?: 'name' | 'price' | 'price_desc' | 'newest' | 'rating';
  limit?: number;
  offset?: number;
}

export async function fetchStorefrontCatalog(
  slug: string,
  options: CatalogOptions = {},
): Promise<StorefrontProduct[]> {
  const params = new URLSearchParams();
  if (options.search) params.set('search', options.search);
  if (options.categoryId) params.set('categoryId', options.categoryId);
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.offset !== undefined) params.set('offset', String(options.offset));
  const qs = params.toString();
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}/catalog${qs ? `?${qs}` : ''}`);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchStorefrontCategories(slug: string): Promise<StorefrontCategory[]> {
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}/categories`);
}

// ─── Payment options ──────────────────────────────────────────────────────────

export async function fetchStorefrontPaymentOptions(slug: string): Promise<StorefrontPaymentOption[]> {
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}/payment-options`);
}

// ─── Discount validation ──────────────────────────────────────────────────────

export interface DiscountValidationResult {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  finalTotal: number;
}

export async function validateStorefrontDiscount(
  slug: string,
  code: string,
  subtotal: number,
): Promise<DiscountValidationResult> {
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}/discounts/validate`, {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export async function quoteStorefrontCart(
  slug: string,
  items: StorefrontOrderItem[],
  discountCode?: string,
): Promise<StorefrontQuoteResult> {
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}/quote`, {
    method: 'POST',
    body: JSON.stringify({ items, discountCode }),
  });
}

// ─── Order creation ───────────────────────────────────────────────────────────

export interface CreateStorefrontOrderInput {
  slug: string;
  items: StorefrontOrderItem[];
  paymentMethod: string;
  customer?: StorefrontCustomer;
  discountCode?: string;
}

export async function createStorefrontOrder(
  input: CreateStorefrontOrderInput,
): Promise<StorefrontOrderReceipt> {
  const { slug, ...body } = input;
  return sfFetch(`/api/storefront/stores/${encodeURIComponent(slug)}/orders`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Order lookup ─────────────────────────────────────────────────────────────

export interface StorefrontOrderStatus {
  publicOrderToken: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  qrrReference?: string;
}

export async function getStorefrontOrder(publicOrderToken: string): Promise<StorefrontOrderStatus> {
  return sfFetch(`/api/storefront/orders/${encodeURIComponent(publicOrderToken)}`);
}

// ─── Payment QR ───────────────────────────────────────────────────────────────

export interface StorefrontQRData {
  qrSvg: string;
  billSvg: string;
  qrrReference: string;
  amount: number;
}

export async function getStorefrontOrderQR(publicOrderToken: string): Promise<StorefrontQRData> {
  return sfFetch(`/api/storefront/orders/${encodeURIComponent(publicOrderToken)}/payment-qr`);
}

// ─── Payment confirmation ─────────────────────────────────────────────────────

export async function confirmStorefrontPayment(
  publicOrderToken: string,
  confirmToken: string,
): Promise<{ publicOrderToken: string; status: string; confirmedAt: string }> {
  return sfFetch(`/api/storefront/orders/${encodeURIComponent(publicOrderToken)}/payment-confirmations`, {
    method: 'POST',
    body: JSON.stringify({ confirmToken }),
  });
}

// ─── Invoice creation ─────────────────────────────────────────────────────────

export interface StorefrontInvoiceCustomer {
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPostalCode?: string;
  customerPhone?: string;
}

export async function createStorefrontInvoice(
  publicOrderToken: string,
  customer?: StorefrontInvoiceCustomer,
): Promise<StorefrontInvoiceData> {
  return sfFetch(`/api/storefront/orders/${encodeURIComponent(publicOrderToken)}/invoice`, {
    method: 'POST',
    body: JSON.stringify(customer || {}),
  });
}

// ─── Invoice lookup ───────────────────────────────────────────────────────────

export async function getStorefrontInvoice(shareToken: string) {
  return sfFetch(`/api/storefront/invoices/${encodeURIComponent(shareToken)}`);
}

/** Returns the direct URL for the invoice PDF (downloadable link). */
export function getStorefrontInvoicePdfUrl(shareToken: string): string {
  return buildApiUrl(`/api/storefront/invoices/${encodeURIComponent(shareToken)}/pdf`);
}
