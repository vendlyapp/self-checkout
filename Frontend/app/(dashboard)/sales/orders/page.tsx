'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrders } from '@/hooks/queries/useOrders';
import { ShoppingCart, Calendar, DollarSign, User, ChevronRight, FileText, XCircle, Filter, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { Loader } from '@/components/ui/Loader';
import { useCancelOrder } from '@/hooks/mutations/useOrderMutations';
import { toast } from 'sonner';
import CancelOrderModal from '@/components/orders/CancelOrderModal';
import { OrdersProvider, useOrdersContext } from '@/components/dashboard/orders/OrdersContext';

function SalesOrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();
  const cancelOrder = useCancelOrder();
  
  // Obtener filtro de status desde query params
  const statusFilter = searchParams?.get('status') as 'pending' | 'processing' | 'completed' | 'cancelled' | undefined;
  
  // Usar React Query hook para obtener órdenes con cache
  // Si hay un filtro de status en la URL, aplicarlo
  const { data: orders = [], isLoading, isFetching, error: queryError } = useOrders({
    limit: 100,
    offset: 0,
    status: statusFilter, // Aplicar filtro de status si existe
  });

  const { searchQuery } = useOrdersContext();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{ id: string; orderNumber: string } | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

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
        return { 
          label: 'Abgeschlossen', 
          color: 'bg-green-100 text-green-700', 
          iconColor: 'text-green-600',
          bgColor: 'bg-[#D3F6E4]',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case 'pending':
        return { 
          label: 'Ausstehend', 
          color: 'bg-yellow-100 text-yellow-700', 
          iconColor: 'text-yellow-600',
          bgColor: 'bg-[#FEF3C7]',
          icon: <Clock className="w-5 h-5" />
        };
      case 'processing':
        return { 
          label: 'In Bearbeitung', 
          color: 'bg-blue-100 text-blue-700', 
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: <Clock className="w-5 h-5" />
        };
      case 'cancelled':
        return { 
          label: 'Storniert', 
          color: 'bg-red-100 text-red-700', 
          iconColor: 'text-red-600',
          bgColor: 'bg-[#FEE2E2]',
          icon: <XCircle className="w-5 h-5" />
        };
      default:
        return { 
          label: 'Abgeschlossen', 
          color: 'bg-gray-100 text-gray-700', 
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: <FileText className="w-5 h-5" />
        };
    }
  };

  const handleCancelOrder = (orderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Abrir modal de confirmación - NO ejecutar cancelación aquí
    setOrderToCancel({
      id: orderId,
      orderNumber: orderId.slice(-8).toUpperCase(),
    });
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || isConfirmingCancel) return;
    
    setIsConfirmingCancel(true);
    // Solo aquí se ejecuta la cancelación después de confirmar
    try {
      await cancelOrder.mutateAsync(orderToCancel.id);
      // El hook ya invalida el cache y actualiza la lista automáticamente
      // Si estamos en la vista de canceladas, la orden desaparecerá de la lista
      // Si estamos en la vista general, el status cambiará a 'cancelled'
      setCancelModalOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      // Error ya se maneja en el hook
      // El modal se mantiene abierto si hay error para que el usuario pueda intentar de nuevo
    } finally {
      setIsConfirmingCancel(false);
    }
  };

  const handleCloseCancelModal = () => {
    if (!cancelOrder.isPending && !isConfirmingCancel) {
      setCancelModalOpen(false);
      setOrderToCancel(null);
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
    <>
      {/* Cancellation Confirmation Modal */}
      <CancelOrderModal
        isOpen={cancelModalOpen}
        orderNumber={orderToCancel?.orderNumber}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={cancelOrder.isPending}
      />

      <div className="w-full h-full overflow-auto gpu-accelerated">
        {isMobile && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pt-[175px]">
            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center text-lg font-medium">
                  {statusFilter === 'cancelled'
                    ? 'Noch keine stornierten Bestellungen'
                    : statusFilter === 'completed'
                    ? 'Noch keine abgeschlossenen Bestellungen'
                    : 'Noch keine Bestellungen'}
                </p>
              </div>
            ) : (
              <div className="px-2 pb-24 space-y-3">
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] touch-target overflow-hidden"
                    >
                      <Link
                        href={`/sales/orders/${order.id}`}
                        className="block p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Icono de estado con fondo */}
                          <div className={`w-12 h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <div className={statusConfig.iconColor}>
                              {statusConfig.icon}
                            </div>
                          </div>

                          {/* Contenido principal */}
                          <div className="flex-1 min-w-0">
                            {/* Header con número de orden y estado */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-gray-500 font-mono font-semibold">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            {/* Información de la orden */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{formatDate(order.createdAt)}</span>
                              </div>
                              
                              {order.userName && (
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate font-medium">{order.userName}</span>
                                </div>
                              )}
                              
                              {order.paymentMethod && (
                                <div className="text-xs text-gray-500">
                                  {order.paymentMethod}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Monto y acciones */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="text-right">
                              <p className={`font-bold text-lg ${statusConfig.iconColor}`}>
                                {formatSwissPriceWithCHF(order.total)}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>

                      {/* Botón de cancelar separado */}
                      {order.status !== 'cancelled' && (
                        <div className="px-4 pb-3 border-t border-gray-100 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCancelOrder(order.id, e);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors touch-target active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Stornieren</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header con contexto */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestellungen verwalten</h1>
            <p className="text-gray-600 mb-4">
              Alle Bestellungen anzeigen, Details einsehen und bei Bedarf stornieren
            </p>
          </div>

          {/* Filtros por Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Status filtern:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/sales/orders')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !statusFilter
                    ? 'bg-brand-500 text-white shadow-sm hover:bg-brand-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => router.push('/sales/orders?status=completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Abgeschlossen
              </button>
              <button
                onClick={() => router.push('/sales/orders?status=cancelled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'cancelled'
                    ? 'bg-red-500 text-white shadow-sm hover:bg-red-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Storniert
              </button>
            </div>
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">
                {statusFilter === 'cancelled'
                  ? 'Noch keine stornierten Bestellungen'
                  : statusFilter === 'completed'
                  ? 'Noch keine abgeschlossenen Bestellungen'
                  : 'Noch keine Bestellungen'}
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
                                className="text-brand-600 hover:text-brand-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Details anzeigen
                              </Link>
                              {order.status !== 'cancelled' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCancelOrder(order.id, e);
                                  }}
                                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Bestellung stornieren"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Stornieren</span>
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
    </>
  );
}

export default function SalesOrdersPage() {
  return (
    <OrdersProvider>
      <SalesOrdersPageContent />
    </OrdersProvider>
  );
}
