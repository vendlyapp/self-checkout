import { AnalyticsData, Customer, PaymentMethod, SalesData, CartData, ShopActivity } from '../types';

// Mock customers data
export const mockCustomers: Customer[] = [
  { id: '1', avatar: '👤', name: 'Anna Mueller', status: 'active' },
  { id: '2', avatar: '👤', name: 'Hans Schmidt', status: 'active' },
  { id: '3', avatar: '👤', name: 'Maria Weber', status: 'active' },
  { id: '4', avatar: '👤', name: 'Peter Fischer', status: 'inactive' },
  { id: '5', avatar: '👤', name: 'Sarah Klein', status: 'inactive' },
  { id: '6', avatar: '👤', name: 'Michael Wagner', status: 'inactive' },
  { id: '7', avatar: '👤', name: 'Julia Hoffmann', status: 'inactive' },
];

// Mock sales data
export const mockSalesData: SalesData[] = [
  { day: 'M', currentWeek: 3000, lastWeek: 2500, date: '2025-01-06' },
  { day: 'D', currentWeek: 4000, lastWeek: 3000, date: '2025-01-07' },
  { day: 'M', currentWeek: 3500, lastWeek: 2750, date: '2025-01-08' },
  { day: 'D', currentWeek: 4500, lastWeek: 3500, date: '2025-01-09' },
  { day: 'F', currentWeek: 4750, lastWeek: 3750, date: '2025-01-10' },
  { day: 'S', currentWeek: 4250, lastWeek: 3500, date: '2025-01-11' },
  { day: 'S', currentWeek: 3250, lastWeek: 3000, date: '2025-01-12' }
];

// Mock payment methods data
export const mockPaymentMethods: PaymentMethod[] = [
  { type: 'TWINT', percentage: 57, total: 900, color: '#10b981', transactions: 45 },
  { type: 'Bar', percentage: 31, total: 500, color: '#f59e0b', transactions: 28 },
  { type: 'Debitkarte', percentage: 11, total: 180, color: '#3b82f6', transactions: 12 },
  { type: 'Kreditkarte', percentage: 9, total: 180, color: '#6b7280', transactions: 8 }
];

// Mock cart data
export const mockCartData: CartData = {
  averageValue: 57,
  percentageChange: 8,
  trend: 'up',
  comparisonPeriod: 'gestern',
  maxValue: 250,
  minValue: 9
};

// Mock shop activity
export const mockShopActivity: ShopActivity = {
  activeCustomers: mockCustomers.filter(customer => customer.status === 'active'),
  totalActive: 3,
  totalInactive: 4,
  openCartsValue: 93,
  progressPercentage: 43
};

// Mock quick access items (without icons and actions)
export const mockQuickAccessItems = [
  { 
    id: 'sales',
    title: 'Verkäufe',
    subtitle: 'Ansehen, verwalten',
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  { 
    id: 'cancel',
    title: 'Storno',
    subtitle: 'Verkauf stornieren',
    color: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  { 
    id: 'receipts',
    title: 'Belege',
    subtitle: 'Ansehen, senden',
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  { 
    id: 'cart',
    title: 'Warenkorb',
    subtitle: 'Ansehen',
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  }
];

// Complete analytics data
export const mockAnalyticsData: AnalyticsData = {
  shopActivity: mockShopActivity,
  salesData: mockSalesData,
  paymentMethods: mockPaymentMethods,
  cartData: mockCartData,
  quickAccess: mockQuickAccessItems
};

// Helper functions for data manipulation
export const calculateTotalSales = (data: SalesData[]): number => {
  return data.reduce((total, day) => total + day.currentWeek, 0);
};

export const calculateSalesGrowth = (data: SalesData[]): number => {
  const currentTotal = data.reduce((total, day) => total + day.currentWeek, 0);
  const lastTotal = data.reduce((total, day) => total + day.lastWeek, 0);
  if (lastTotal === 0) return currentTotal > 0 ? 100 : 0;
  return Math.round(((currentTotal - lastTotal) / lastTotal) * 100);
};

export const getActiveCustomersCount = (customers: Customer[]): number => {
  return customers.filter(customer => customer.status === 'active').length;
};

// API simulation functions (ready for real backend integration)
export const fetchAnalyticsData = async (): Promise<AnalyticsData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAnalyticsData;
};

export const fetchSalesData = async (period: string = 'week'): Promise<SalesData[]> => {
  // TODO: Use period parameter when connecting to real API
  console.log(`Fetching sales data for period: ${period}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockSalesData;
};

export const fetchPaymentMethods = async (period: string = 'today'): Promise<PaymentMethod[]> => {
  // TODO: Use period parameter when connecting to real API
  console.log(`Fetching payment methods for period: ${period}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPaymentMethods;
}; 