// Barrel exports for analytics data
export * from './mockData';

// Re-export main data structures for convenience
export {
  mockAnalyticsData as defaultAnalyticsData,
  mockCustomers as defaultCustomers,
  mockSalesData as defaultSalesData,
  mockPaymentMethods as defaultPaymentMethods,
  mockCartData as defaultCartData,
  mockShopActivity as defaultShopActivity
} from './mockData'; 