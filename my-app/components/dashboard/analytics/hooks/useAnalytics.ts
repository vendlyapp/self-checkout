import { useState, useEffect, useCallback } from 'react';
import { AnalyticsData, TimePeriod, SalesData, PaymentMethod } from '../types';
import { 
  fetchAnalyticsData, 
  fetchSalesData, 
  fetchPaymentMethods,
  calculateTotalSales,
  calculateSalesGrowth
} from '../data/mockData';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  salesPeriod: TimePeriod;
  paymentPeriod: TimePeriod;
  cartPeriod: TimePeriod;
  setSalesPeriod: (period: TimePeriod) => void;
  setPaymentPeriod: (period: TimePeriod) => void;
  setCartPeriod: (period: TimePeriod) => void;
  refreshData: () => Promise<void>;
  totalSales: number;
  salesGrowth: number;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Period states for different components
  const [salesPeriod, setSalesPeriod] = useState<TimePeriod>('woche');
  const [paymentPeriod, setPaymentPeriod] = useState<TimePeriod>('heute');
  const [cartPeriod, setCartPeriod] = useState<TimePeriod>('heute');

  // Calculated values
  const [totalSales, setTotalSales] = useState<number>(0);
  const [salesGrowth, setSalesGrowth] = useState<number>(0);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const analyticsData = await fetchAnalyticsData();
      setData(analyticsData);
      
      // Calculate derived values
      const total = calculateTotalSales(analyticsData.salesData);
      const growth = calculateSalesGrowth(analyticsData.salesData);
      
      setTotalSales(total);
      setSalesGrowth(growth);
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh specific sales data when period changes
  const refreshSalesData = useCallback(async (period: TimePeriod) => {
    try {
      const salesData = await fetchSalesData(period);
      if (data) {
        const updatedData = { ...data, salesData };
        setData(updatedData);
        
        const total = calculateTotalSales(salesData);
        const growth = calculateSalesGrowth(salesData);
        setTotalSales(total);
        setSalesGrowth(growth);
      }
    } catch (err) {
      console.error('Error refreshing sales data:', err);
    }
  }, [data]);

  // Refresh payment methods data when period changes
  const refreshPaymentData = useCallback(async (period: TimePeriod) => {
    try {
      const paymentMethods = await fetchPaymentMethods(period);
      if (data) {
        setData({ ...data, paymentMethods });
      }
    } catch (err) {
      console.error('Error refreshing payment data:', err);
    }
  }, [data]);

  // Period change handlers
  const handleSalesPeriodChange = useCallback((period: TimePeriod) => {
    setSalesPeriod(period);
    refreshSalesData(period);
  }, [refreshSalesData]);

  const handlePaymentPeriodChange = useCallback((period: TimePeriod) => {
    setPaymentPeriod(period);
    refreshPaymentData(period);
  }, [refreshPaymentData]);

  const handleCartPeriodChange = useCallback((period: TimePeriod) => {
    setCartPeriod(period);
    // In a real app, you would refresh cart data here
  }, []);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    salesPeriod,
    paymentPeriod,
    cartPeriod,
    setSalesPeriod: handleSalesPeriodChange,
    setPaymentPeriod: handlePaymentPeriodChange,
    setCartPeriod: handleCartPeriodChange,
    refreshData,
    totalSales,
    salesGrowth
  };
};

// Hook specifically for handling quick access actions
export const useQuickAccess = () => {
  const handleSalesAction = useCallback(() => {
    console.log('Navigate to sales page');
    // TODO: Implement navigation to sales page
  }, []);

  const handleCancelAction = useCallback(() => {
    console.log('Open cancel sale dialog');
    // TODO: Implement cancel sale functionality
  }, []);

  const handleReceiptsAction = useCallback(() => {
    console.log('Navigate to receipts page');
    // TODO: Implement navigation to receipts page
  }, []);

  const handleCartAction = useCallback(() => {
    console.log('Navigate to cart page');
    // TODO: Implement navigation to cart page
  }, []);

  return {
    handleSalesAction,
    handleCancelAction,
    handleReceiptsAction,
    handleCartAction
  };
}; 