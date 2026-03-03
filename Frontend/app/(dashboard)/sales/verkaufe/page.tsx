'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrders } from '@/hooks/queries/useOrders';
import { ShoppingCart, Search, Calendar, Banknote, User, ChevronRight } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';

export default function SalesVerkaufePage() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Obtener solo órdenes completas (status: 'completed')
  const { data: orders = [], isLoading, isFetching, error: queryError } = useOrders({
    limit: 100,
    offset: 0,
    status: 'completed', // Solo órdenes completas
  });

  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar órdenes por búsqueda usando useMemo para optimizar rendimiento
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      return (
        order.id?.toLowerCase().includes(query) ||
        order.userName?.toLowerCase().includes(query) ||
        order.userEmail?.toLowerCase().includes(query) ||
        order.paymentMethod?.toLowerCase().includes(query)
      );
    });
  }, [orders, searchQuery]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Determinar estados de carga y error
  const loading = isLoading || isFetching;
  const error = queryError instanceof Error ? queryError.message : queryError ? String(queryError) : null;

  if (loading && orders.length === 0) {
    return (
      <div className="w-full h-full overflow-auto gpu-accelerated">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Loader size="lg" />
          <p className="text-gray-600 font-medium mt-4">Verkäufe werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="w-full h-full overflow-auto gpu-accelerated">
        {isMobile && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.push('/sales')}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 px-6 font-semibold transition-ios touch-target"
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => router.push('/sales')}
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 px-6 font-semibold transition-ios"
              >
                Zurück
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      {isMobile && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-base"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 px-1">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'Verkauf' : 'Verkäufe'}
                {searchQuery && ` gefunden`}
              </p>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center text-lg font-medium">
                  {searchQuery ? 'Keine Verkäufe gefunden' : 'Noch keine abgeschlossenen Verkäufe'}
                </p>
              </div>
            ) : (
              <div className="px-4 pb-24 space-y-3">
                {filteredOrders.map((order) => {
                  return (
                    <Link
                      key={order.id}
                      href={`/sales/orders/${order.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 active:shadow-md transition-all p-4 block touch-target"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="w-5 h-5 text-brand-600 flex-shrink-0" />
                            <span className="text-xs text-gray-500 font-mono">
                              {order.id.slice(-8).toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Abgeschlossen
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Banknote className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                {formatSwissPriceWithCHF(order.total)}
                              </span>
                            </div>
                            {order.userEmail && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{order.userEmail}</span>
                              </div>
                            )}
                            {order.paymentMethod && (
                              <div className="text-xs text-gray-500">
                                Zahlung: {order.paymentMethod}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tablet: lista en cards horizontales, una columna */}
      {isTablet && (
        <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-8 max-w-4xl mx-auto min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-5 md:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl md:text-xl lg:text-2xl font-bold text-foreground tracking-tight">Verkäufe</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'abgeschlossener Verkauf' : 'abgeschlossene Verkäufe'}
                {searchQuery && ' gefunden'}
              </p>
            </div>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-ios"
                aria-label="Verkäufe durchsuchen"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 md:p-12 text-center">
              <ShoppingCart className="w-14 h-14 text-muted-foreground/50 mx-auto mb-4" aria-hidden />
              <p className="text-muted-foreground font-medium">
                {searchQuery ? 'Keine Verkäufe gefunden' : 'Noch keine abgeschlossenen Verkäufe'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/sales/orders/${order.id}`}
                  className="flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-card rounded-2xl border border-border hover:shadow-md hover:border-border/80 transition-ios tap-highlight-transparent"
                >
                  <div className="flex items-center gap-2 min-w-0 shrink-0">
                    <ShoppingCart className="w-5 h-5 text-primary shrink-0" aria-hidden />
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[72px] md:max-w-[88px]">
                      …{order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 hidden sm:block">
                    <div className="text-sm text-foreground truncate">{order.userName || 'Gast'}</div>
                    {order.userEmail && (
                      <div className="text-xs text-muted-foreground truncate">{order.userEmail}</div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground shrink-0 hidden md:block">
                    {formatDate(order.createdAt)}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold text-foreground">
                      {formatSwissPriceWithCHF(order.total)}
                    </span>
                    <span className="ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Abgeschlossen
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop: tabla mejorada */}
      {isDesktop && (
        <div className="p-4 md:px-6 md:pt-10 md:pb-6 lg:p-8 max-w-6xl mx-auto min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5 md:mb-6">
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">Verkäufe</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'abgeschlossener Verkauf' : 'abgeschlossene Verkäufe'}
                {searchQuery && ' gefunden'}
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="Suchen nach Verkauf, Kunde, E-Mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-ios"
                aria-label="Verkäufe durchsuchen"
              />
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" aria-hidden />
              <p className="text-muted-foreground font-medium">
                {searchQuery ? 'Keine Verkäufe gefunden' : 'Noch keine abgeschlossenen Verkäufe'}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]" role="grid" aria-label="Liste der Verkäufe">
                  <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Verkauf
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Kunde
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Betrag
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => router.push(`/sales/orders/${order.id}`)}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary shrink-0" aria-hidden />
                            <span className="text-sm font-mono text-foreground">
                              {order.id.slice(-8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="text-sm text-foreground">{order.userName || 'Gast'}</div>
                          {order.userEmail && (
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {order.userEmail}
                            </div>
                          )}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="text-sm font-semibold text-foreground">
                            {formatSwissPriceWithCHF(order.total)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Abgeschlossen
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <Link
                            href={`/sales/orders/${order.id}`}
                            className="text-primary hover:text-primary/90 font-medium text-sm transition-ios inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Details
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
