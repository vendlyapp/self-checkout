import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAnalytics, useQuickAccess } from './hooks/useAnalytics';
import ActiveCustomers from './ActiveCustomers';
import SalesChart from './SalesChart';
import QuickAccessGrid from './QuickAccessGrid';
import PaymentMethods from './PaymentMethods';
import CartGauge from './CartGauge';
import { SearchInput } from '@/components/ui/search-input';
import SearchResultsSection from '../home/SearchResultsSection';
import { AnalyticsDashboardSkeletonLoader } from '../skeletons';

interface AnalyticsDashboardProps {
  className?: string;
}

interface SearchResult {
  id: number;
  name: string;
  type: 'metric' | 'report' | 'product' | 'sale';
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  className = "" 
}) => {
  // Estados para búsqueda
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const {
    data,
    loading,
    error,
    salesPeriod,
    paymentPeriod,
    cartPeriod,
    setSalesPeriod,
    setPaymentPeriod,
    setCartPeriod,
    refreshData,
    totalSales,
    salesGrowth
  } = useAnalytics();

  const {
    handleSalesAction,
    handleCancelAction,
    handleReceiptsAction,
    handleCartAction
  } = useQuickAccess();

  // Simular búsqueda de analytics
  const searchAnalyticsData = useCallback(async (query: string): Promise<SearchResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: `Analytics resultado para "${query}" 1`, type: 'metric' },
      { id: 2, name: `Analytics resultado para "${query}" 2`, type: 'report' },
    ];
  }, []);

  // Manejar búsqueda
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await searchAnalyticsData(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching analytics:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchAnalyticsData]);

  // Limpiar resultados de búsqueda cuando cambia el query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen bg-background ${className}`}>
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-destructive text-lg font-semibold mb-2">
              Fehler beim Laden der Analytics
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-fast"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - mostrar skeleton mientras carga
  if (loading || !data) {
    return <AnalyticsDashboardSkeletonLoader />;
  }

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header with Refresh Button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Übersicht Ihrer Verkaufsdaten
              </p>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={refreshData}
              disabled={loading}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-fast disabled:opacity-50 tap-highlight-transparent"
              aria-label="Daten aktualisieren"
            >
              <RefreshCw 
                className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-24">
        {/* Search Section */}
        <section className="mb-8">
          <SearchInput 
            placeholder="Suche Produkte / Verkäufe"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            className="w-full"
          />
        </section>

        {/* Search Results */}
        {(isSearching || searchResults.length > 0) && (
          <section className="mb-8">
            <SearchResultsSection 
              isSearching={isSearching}
              results={searchResults}
            />
          </section>
        )}

        {/* Analytics Components */}
        <div className="space-y-8">
          {/* Shop Activity Section */}
          <section>
            <ActiveCustomers 
              data={data?.shopActivity || {
                activeCustomers: [],
                totalActive: 0,
                totalInactive: 0,
                openCartsValue: 0,
                progressPercentage: 0
              }}
              loading={loading}
            />
          </section>
          
          {/* Sales Chart Section */}
          <section>
            <SalesChart 
              data={data?.salesData || []}
              totalSales={totalSales}
              salesGrowth={salesGrowth}
              period={salesPeriod}
              onPeriodChange={setSalesPeriod}
              loading={loading}
            />
          </section>
          
          {/* Quick Access Section */}
          <section>
            <QuickAccessGrid 
              onSalesAction={handleSalesAction}
              onCancelAction={handleCancelAction}
              onReceiptsAction={handleReceiptsAction}
              onCartAction={handleCartAction}
              loading={loading}
            />
          </section>
          
          {/* Payment Methods Section */}
          <section>
            <PaymentMethods 
              data={data?.paymentMethods || []}
              period={paymentPeriod}
              onPeriodChange={setPaymentPeriod}
              loading={loading}
            />
          </section>
          
          {/* Cart Gauge Section */}
          <section>
            <CartGauge 
              data={data?.cartData || {
                averageValue: 0,
                percentageChange: 0,
                trend: 'up',
                comparisonPeriod: 'gestern',
                maxValue: 100,
                minValue: 0
              }}
              period={cartPeriod}
              onPeriodChange={setCartPeriod}
              loading={loading}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 