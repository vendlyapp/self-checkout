'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrders } from '@/hooks/queries/useOrders';
import HeaderNav from '@/components/navigation/HeaderNav';
import { ShoppingCart, Search, Calendar, DollarSign, User, ChevronRight, FileText, XCircle } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
import { useCancelOrder } from '@/hooks/mutations/useOrderMutations';
import { toast } from 'sonner';

export default function SalesOrdersPage() {
  const router = useRouter();
  const { isMobile } = useResponsive();
  const cancelOrder = useCancelOrder();
  
  // Usar React Query hook para obtener órdenes con cache
  const { data: orders = [], isLoading, isFetching, error: queryError } = useOrders({
    limit: 100,
    offset: 0,
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
      return date.toLocaleDateString('de-DE', {
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

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700', iconColor: 'text-green-600' };
      case 'pending':
        return { label: 'Ausstehend', color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' };
      case 'processing':
        return { label: 'In Bearbeitung', color: 'bg-blue-100 text-blue-700', iconColor: 'text-blue-600' };
      case 'cancelled':
        return { label: 'Storniert', color: 'bg-red-100 text-red-700', iconColor: 'text-red-600' };
      default:
        return { label: 'Abgeschlossen', color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-600' };
    }
  };

  const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Möchten Sie diese Bestellung wirklich stornieren?')) {
      try {
        await cancelOrder.mutateAsync(orderId);
      } catch (error) {
        // Error ya se maneja en el hook
      }
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
          <p className="text-gray-600 font-medium mt-4">Bestellungen werden geladen...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="w-full h-full overflow-auto gpu-accelerated">
        {isMobile && (
          <div className="flex flex-col h-full">
            <HeaderNav title="Bestellungen" closeDestination="/sales" />
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Fehler</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.push('/sales')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
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
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
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
          <HeaderNav title="Bestellungen" closeDestination="/sales" />
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white text-base"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 px-1">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'Bestellung' : 'Bestellungen'}
                {searchQuery && ` gefunden`}
              </p>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center text-lg font-medium">
                  {searchQuery ? 'Keine Bestellungen gefunden' : 'Noch keine Bestellungen'}
                </p>
              </div>
            ) : (
              <div className="px-4 pb-24 space-y-3">
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <Link
                      key={order.id}
                      href={`/sales/orders/${order.id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 active:shadow-md transition-all p-4 block touch-target"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 font-mono">
                              {order.id.slice(-8).toUpperCase()}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4 text-gray-400" />
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
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={(e) => handleCancelOrder(order.id, e)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-target"
                              title="Bestellung stornieren"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
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

      {!isMobile && (
        <div className="p-6 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestellungen</h1>
            <p className="text-gray-600">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Bestellung' : 'Bestellungen'}
              {searchQuery && ` gefunden`}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Suchen nach Bestellung, Kunde, E-Mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D076] focus:border-[#25D076] bg-white"
              />
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {searchQuery ? 'Keine Bestellungen gefunden' : 'Noch keine Bestellungen'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Bestellung
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Kunde
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Betrag
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/sales/orders/${order.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-5 h-5 text-gray-400" />
                              <span className="text-sm font-mono text-gray-900">
                                {order.id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.userName || 'Gast'}</div>
                            {order.userEmail && (
                              <div className="text-xs text-gray-500">{order.userEmail}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatSwissPriceWithCHF(order.total)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/sales/orders/${order.id}`}
                                className="text-[#25D076] hover:text-[#25D076]/80 font-medium text-sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Details
                              </Link>
                              {order.status !== 'cancelled' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrder(order.id, e);
                                  }}
                                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                                  title="Bestellung stornieren"
                                >
                                  Stornieren
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

