'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Calendar, DollarSign, Package, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { SuperAdminService, type Store } from '@/lib/services/superAdminService';
import { formatSwissPrice } from '@/lib/utils';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  itemsCount: number;
  paymentMethod: string;
}

interface StoreOrdersProps {
  storeId: string;
  store: Store | null;
}

export default function StoreOrders({ storeId, store }: StoreOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SuperAdminService.getStoreOrders(storeId, {
        limit: 100
      });

      if (response.success && response.data) {
        const ordersData = Array.isArray(response.data) ? response.data : [];
        setOrders(ordersData as Order[]);
      } else {
        throw new Error(response.error || 'Error al cargar las órdenes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las órdenes');
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = (store: Store | null): Order[] => {
    const orderCount = store?.orderCount || 0;
    return Array.from({ length: Math.min(orderCount || 10, 20) }, (_, i) => ({
      id: `order-${i + 1}`,
      orderNumber: `ORD-${String(i + 1).padStart(4, '0')}`,
      customerName: `Cliente ${i + 1}`,
      customerEmail: `cliente${i + 1}@example.com`,
      total: Math.floor(Math.random() * 500) + 50,
      status: ['completed', 'pending', 'cancelled'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      itemsCount: Math.floor(Math.random() * 5) + 1,
      paymentMethod: ['Tarjeta', 'Efectivo', 'Transferencia', 'Digital'][Math.floor(Math.random() * 4)],
    }));
  };

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completada',
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 'pending':
        return {
          label: 'Pendiente',
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
          icon: Clock,
          iconColor: 'text-orange-600 dark:text-orange-400',
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
          icon: XCircle,
          iconColor: 'text-red-600 dark:text-red-400',
        };
      default:
        return {
          label: status,
          color: 'bg-muted text-muted-foreground',
          icon: Clock,
          iconColor: 'text-muted-foreground',
        };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card rounded-xl border border-border/50">
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card rounded-2xl border border-border/50">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-muted rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = completedOrders.length > 0 
    ? totalRevenue / completedOrders.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Total Órdenes</p>
                <p className="text-2xl font-bold text-foreground mb-1">{orders.length}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {completedOrders.length} completadas
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Revenue Total</p>
                <p className="text-xl font-bold text-foreground mb-1">
                  CHF {formatSwissPrice(totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Promedio: CHF {formatSwissPrice(averageOrderValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card rounded-xl border border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Órdenes Completadas</p>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {completedOrders.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0}% del total
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
                <ShoppingCart className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                Órdenes Recientes
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredOrders.length} de {orders.length} órdenes
              </p>
            </div>
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por número, cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          {error && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-lg flex items-center justify-between">
              <p className="text-sm text-orange-700 dark:text-orange-400">{error}</p>
              <button
                onClick={fetchOrders}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No se encontraron órdenes' : 'No hay órdenes en esta tienda'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Las órdenes de esta tienda aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={order.id}
                    className="group flex items-start gap-4 p-5 border border-border rounded-xl hover:bg-muted/30 hover:border-brand-300/50 dark:hover:border-brand-500/30 transition-all duration-200"
                  >
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.color}`}>
                      <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor}`} />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2.5">
                            <h3 className="font-semibold text-foreground text-base group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5" />
                              {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'}
                            </span>
                            <span>•</span>
                            <span>{order.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-brand-600 dark:text-brand-400 mb-1">
                            CHF {formatSwissPrice(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="pt-4 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Cliente: </span>
                            <span className="font-medium text-foreground">{order.customerName}</span>
                          </div>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground truncate">{order.customerEmail}</span>
                          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
