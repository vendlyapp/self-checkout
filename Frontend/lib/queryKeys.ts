/**
 * Centralized React Query key factories.
 * Always use these instead of string literals for invalidation consistency.
 */

export const queryKeys = {
  myStore: {
    all: () => ['myStore'] as const,
  },
  products: {
    all: () => ['products'] as const,
    list: (opts?: Record<string, unknown>) => ['products', opts ?? {}] as const,
    detail: (id: string) => ['product', id] as const,
    stats: () => ['productStats'] as const,
    analytics: () => ['productsAnalytics'] as const,
  },
  categories: {
    all: () => ['categories'] as const,
    detail: (id: string) => ['category', id] as const,
    stats: () => ['categoryStats'] as const,
    storefront: (slug: string) => ['storefront', 'categories', slug] as const,
  },
  orders: {
    all: () => ['orders'] as const,
    list: (storeId: string | undefined, opts?: Record<string, unknown>) =>
      ['orders', storeId, opts ?? {}] as const,
    detail: (orderId: string) => ['order', orderId] as const,
    recent: (storeId: string | undefined, limit?: number) =>
      ['recentOrders', storeId, limit] as const,
    stats: (date?: string, ownerId?: string) => ['orderStats', date, ownerId] as const,
    topProducts: (storeId: string | undefined, limit?: number, metric?: string) =>
      ['topProducts', storeId, limit, metric] as const,
    todayCustomers: (storeId: string | undefined) => ['todayCustomers', storeId] as const,
    goalRevenues: (ownerId: string | undefined) => ['goalRevenues', ownerId] as const,
  },
  invoices: {
    all: () => ['invoices'] as const,
    list: (storeId: string | undefined, opts?: Record<string, unknown>) =>
      ['invoices', storeId, opts ?? {}] as const,
    byOrder: (orderId: string) => ['invoices', 'order', orderId] as const,
    detail: (invoiceId: string) => ['invoice', invoiceId] as const,
  },
  paymentMethods: {
    list: (storeId: string, activeOnly?: boolean) =>
      ['paymentMethods', storeId, activeOnly] as const,
    detail: (id: string) => ['paymentMethod', id] as const,
  },
  notifications: {
    list: (
      storeId: string | undefined,
      limit?: number,
      offset?: number,
      unreadOnly?: boolean
    ) => ['notifications', storeId, limit, offset, unreadOnly] as const,
  },
  storefront: {
    products: (slug: string) => ['storeProducts', slug] as const,
    paymentOptions: (slug: string) => ['storefront', 'paymentOptions', slug] as const,
  },
  customers: {
    list: (storeId: string | undefined) => ['customers', storeId] as const,
  },
  discountCodes: {
    all: () => ['discountCodes'] as const,
    detail: (id: string) => ['discountCode', id] as const,
    stats: () => ['discountCodeStats'] as const,
    archived: () => ['archivedDiscountCodes'] as const,
  },
} as const;
