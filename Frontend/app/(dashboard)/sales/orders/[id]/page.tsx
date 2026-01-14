'use client';

import { useParams, useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks';
import { useOrder } from '@/hooks/queries/useOrder';
import { useInvoicesByOrderId } from '@/hooks/queries/useInvoicesByOrderId';
import { AlertCircle, ShoppingCart, FileText, Calendar, DollarSign, User, Package, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';
import { formatSwissPriceWithCHF } from '@/lib/utils';
import Link from 'next/link';
import { useCancelOrder } from '@/hooks/mutations/useOrderMutations';
import { useEffect } from 'react';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const orderId = params.id as string;
  const cancelOrder = useCancelOrder();
  
  // Usar React Query hooks para obtener orden e invoices con cache
  const { data: order, isLoading: orderLoading, error: orderError, isFetching: orderFetching } = useOrder(orderId);
  const { data: invoices = [], isLoading: invoicesLoading, error: invoicesError } = useInvoicesByOrderId(orderId);

  // Mostrar toast de error si hay error
  useEffect(() => {
    if (orderError) {
      const errorMessage = orderError instanceof Error ? orderError.message : 'Bestellung nicht gefunden';
      toast.error(errorMessage);
    }
  }, [orderError]);

  const loading = orderLoading || orderFetching;
  const error = orderError instanceof Error ? orderError.message : orderError ? String(orderError) : null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
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

  const handleCancelOrder = async () => {
    if (confirm('Möchten Sie diese Bestellung wirklich stornieren? Dies wird auch alle zugehörigen Rechnungen stornieren.')) {
      try {
        await cancelOrder.mutateAsync(orderId);
        router.push('/sales/orders');
      } catch (error) {
        // Error ya se maneja en el hook
      }
    }
  };

  if (loading && !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader size="lg" />
        <p className="text-gray-600 font-medium mt-4">Bestellung wird geladen...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="w-full h-full">
        {isMobile && (
          <div className="w-full p-4">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bestellung nicht gefunden</h2>
                <p className="text-gray-600 mb-6">{error || 'Die angeforderte Bestellung konnte nicht gefunden werden.'}</p>
                <button
                  onClick={() => router.push('/sales/orders')}
                  className="w-full bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors touch-target"
                >
                  Zurück zu Bestellungen
                </button>
              </div>
            </div>
          </div>
        )}
        {!isMobile && (
          <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bestellung nicht gefunden</h2>
              <p className="text-gray-600 mb-6">{error || 'Die angeforderte Bestellung konnte nicht gefunden werden.'}</p>
              <button
                onClick={() => router.push('/sales/orders')}
                className="bg-[#25D076] hover:bg-[#25D076]/90 text-white rounded-xl py-3 px-6 font-semibold transition-colors"
              >
                Zurück zu Bestellungen
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="w-full h-full overflow-auto gpu-accelerated">
      {isMobile && (
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="pl-4 pr-4 space-y-4 justify-center items-center">
              {/* Order Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-gray-400" />
                    <span className="text-sm font-mono text-gray-500">
                      {order.id.slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 text-lg">
                      {formatSwissPriceWithCHF(order.total)}
                    </span>
                  </div>
                  {order.userEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{order.userEmail}</span>
                    </div>
                  )}
                  {order.paymentMethod && (
                    <div className="text-sm text-gray-600">
                      Zahlung: <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                  )}
                </div>

                {order.status !== 'cancelled' && (
                  <button
                    onClick={handleCancelOrder}
                    className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2.5 px-4 font-semibold transition-colors touch-target flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Bestellung stornieren
                  </button>
                )}
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Produkte
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={item.id || index} className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.productName || 'Produkt'}
                          </div>
                          {item.productSku && (
                            <div className="text-xs text-gray-500 mt-0.5">SKU: {item.productSku}</div>
                          )}
                          <div className="text-sm text-gray-600 mt-1">
                            Menge: {item.quantity} × {formatSwissPriceWithCHF(item.price)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatSwissPriceWithCHF(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {invoicesLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <Loader size="md" />
                </div>
              ) : invoices.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Rechnungen ({invoices.length})
                  </h3>
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/sales/invoices/${invoice.id}`}
                        className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {formatDate(invoice.issuedAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatSwissPriceWithCHF(invoice.total)}
                            </span>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Keine Rechnung für diese Bestellung</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="p-6 max-w-5xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestellung</h1>
                <p className="text-gray-600">
                  {order.id.slice(-8).toUpperCase()} • {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                {order.status !== 'cancelled' && (
                  <button
                    onClick={handleCancelOrder}
                    className="bg-red-50 hover:bg-red-100 text-red-600 rounded-xl py-2 px-4 font-semibold transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Stornieren
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Order Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Bestellinformationen
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Bestellnummer</div>
                  <div className="font-mono text-gray-900">{order.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Datum</div>
                  <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Gesamtbetrag</div>
                  <div className="text-2xl font-bold text-[#25D076]">
                    {formatSwissPriceWithCHF(order.total)}
                  </div>
                </div>
                {order.userEmail && (
                  <div>
                    <div className="text-sm text-gray-600">Kunde</div>
                    <div className="text-gray-900">{order.userName || order.userEmail}</div>
                    <div className="text-sm text-gray-500">{order.userEmail}</div>
                  </div>
                )}
                {order.paymentMethod && (
                  <div>
                    <div className="text-sm text-gray-600">Zahlungsmethode</div>
                    <div className="text-gray-900">{order.paymentMethod}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Rechnungen ({invoices.length})
              </h2>
              {invoicesLoading ? (
                <Loader size="md" />
              ) : invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/sales/invoices/${invoice.id}`}
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            {formatDate(invoice.issuedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatSwissPriceWithCHF(invoice.total)}
                          </span>
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Keine Rechnung für diese Bestellung</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produkte ({order.items.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Produkt</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Menge</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preis</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Gesamt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{item.productName || 'Produkt'}</div>
                          {item.productSku && (
                            <div className="text-xs text-gray-500">SKU: {item.productSku}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-600">{formatSwissPriceWithCHF(item.price)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatSwissPriceWithCHF(item.price * item.quantity)}
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

