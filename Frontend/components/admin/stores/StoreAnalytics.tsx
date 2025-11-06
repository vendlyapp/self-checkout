'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatSwissPrice } from '@/lib/utils';

import { type Store } from '@/lib/services/superAdminService';

interface StoreAnalyticsProps {
  storeId: string;
  store: Store | null;
}

type TimePeriod = 'heute' | 'woche' | 'monat' | 'jahr';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const periodOptions: { value: TimePeriod; label: string }[] = [
  { value: 'heute', label: 'Heute' },
  { value: 'woche', label: 'Woche' },
  { value: 'monat', label: 'Monat' },
  { value: 'jahr', label: 'Jahr' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' 
              ? `CHF ${entry.value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface SalesDataPoint {
  day: string;
  date: string;
  currentWeek: number;
  lastWeek: number;
}

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface OrderData {
  status: string;
  count: number;
  color: string;
}

interface AnalyticsData {
  salesData: SalesDataPoint[];
  revenueData: RevenueDataPoint[];
  categoriesData: CategoryData[];
  paymentMethodsData: PaymentMethodData[];
  ordersData: OrderData[];
  totalSales: number;
  salesGrowth: number;
}

export default function StoreAnalytics({ storeId, store }: StoreAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [salesPeriod] = useState<TimePeriod>('woche');
  const [revenuePeriod] = useState<TimePeriod>('monat');
  const [paymentPeriod] = useState<TimePeriod>('woche');

  useEffect(() => {
    // Generate mock data immediately - no API call needed
    const mockAnalytics = generateMockAnalytics(store);
    setAnalytics(mockAnalytics);
  }, [storeId, store]);

  const generateMockAnalytics = (store: Store | null): AnalyticsData => {
    // Sales data for last 7 days
    const salesData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const baseValue = Math.floor((store?.totalRevenue || 1000) / 7);
      return {
        day: date.toLocaleDateString('de-CH', { weekday: 'short' }),
        date: date.toLocaleDateString('de-CH', { month: 'short', day: 'numeric' }),
        currentWeek: Math.floor(baseValue + Math.random() * baseValue * 0.3),
        lastWeek: Math.floor(baseValue * 0.8 + Math.random() * baseValue * 0.2),
      };
    });

    // Revenue trend for last 30 days
    const revenueData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const baseValue = Math.floor((store?.totalRevenue || 1000) / 30);
      return {
        date: date.toLocaleDateString('de-CH', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(baseValue + Math.random() * baseValue * 0.4),
      };
    });

    // Product categories
    const categoriesData = [
      { name: 'Electrónica', value: 35, count: Math.floor((store?.productCount || 0) * 0.35) },
      { name: 'Ropa', value: 25, count: Math.floor((store?.productCount || 0) * 0.25) },
      { name: 'Hogar', value: 20, count: Math.floor((store?.productCount || 0) * 0.20) },
      { name: 'Deportes', value: 15, count: Math.floor((store?.productCount || 0) * 0.15) },
      { name: 'Otros', value: 5, count: Math.floor((store?.productCount || 0) * 0.05) },
    ];

    // Payment methods
    const totalRevenue = store?.totalRevenue || 1000;
    const paymentMethodsData = [
      { name: 'Tarjeta', value: 45, amount: Math.floor(totalRevenue * 0.45), color: '#10b981' },
      { name: 'Efectivo', value: 30, amount: Math.floor(totalRevenue * 0.30), color: '#3b82f6' },
      { name: 'Transferencia', value: 15, amount: Math.floor(totalRevenue * 0.15), color: '#f59e0b' },
      { name: 'Digital', value: 10, amount: Math.floor(totalRevenue * 0.10), color: '#8b5cf6' },
    ];

    // Orders by status
    const orderCount = store?.orderCount || 0;
    const ordersData = [
      { status: 'Completadas', count: Math.floor(orderCount * 0.75), color: '#10b981' },
      { status: 'Pendientes', count: Math.floor(orderCount * 0.15), color: '#f59e0b' },
      { status: 'Canceladas', count: Math.floor(orderCount * 0.10), color: '#ef4444' },
    ];

    const totalSales = salesData.reduce((sum, d) => sum + d.currentWeek, 0);
    const lastWeekTotal = salesData.reduce((sum, d) => sum + d.lastWeek, 0);
    const salesGrowth = lastWeekTotal > 0 ? Math.round(((totalSales - lastWeekTotal) / lastWeekTotal) * 100) : 0;

    return {
      salesData,
      revenueData,
      categoriesData,
      paymentMethodsData,
      ordersData,
      totalSales,
      salesGrowth,
    };
  };

  if (!analytics) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="bg-card rounded-2xl border border-border/50">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-64 bg-muted rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-card rounded-2xl border border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No hay datos de analytics disponibles</p>
        </CardContent>
      </Card>
    );
  }

  const currentSalesPeriodLabel = periodOptions.find(option => option.value === salesPeriod)?.label || 'Woche';
  const currentRevenuePeriodLabel = periodOptions.find(option => option.value === revenuePeriod)?.label || 'Monat';
  const currentPaymentPeriodLabel = periodOptions.find(option => option.value === paymentPeriod)?.label || 'Woche';

  return (
    <div className="space-y-6">
      {/* Gráfico 1: Ventas (Últimos 7 días) */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg lg:text-xl font-semibold text-foreground">Ventas</h3>
            <div className="relative">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all px-3 py-1.5 rounded-lg hover:bg-muted">
                {currentSalesPeriodLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-muted-foreground">CHF</span>
                <span className="text-3xl font-bold text-foreground">
                  {formatSwissPrice(analytics.totalSales)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {analytics.salesGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`font-medium ${analytics.salesGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {analytics.salesGrowth >= 0 ? '+' : ''}{analytics.salesGrowth}%
                </span>
              </div>
            </div>

            <div className="h-40 lg:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.salesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="lastWeek"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Semana anterior"
                  />
                  <Line
                    type="monotone"
                    dataKey="currentWeek"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    name="Esta semana"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 2: Revenue Trend */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg lg:text-xl font-semibold text-foreground">Revenue Trend</h3>
            <div className="relative">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all px-3 py-1.5 rounded-lg hover:bg-muted">
                {currentRevenuePeriodLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="h-40 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (CHF)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 3: Productos por Categoría */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground">Productos por Categoría</h3>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full lg:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoriesData.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-3">
              {analytics.categoriesData.map((item, index: number) => (
                <div key={index} className="flex items-center justify-between group hover:bg-muted/30 p-3 rounded-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-3 h-6 rounded-sm transition-transform group-hover:scale-110 shadow-sm" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex items-baseline gap-3">
                      <span className="font-bold text-lg">{item.value}%</span>
                      <span className="text-sm text-muted-foreground font-medium">{item.name}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{item.count} productos</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 4: Métodos de Pago */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">Métodos de Pago</h3>
            <div className="relative">
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-all px-3 py-1.5 rounded-lg hover:bg-muted">
                {currentPaymentPeriodLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="space-y-6">
            <div className="flex h-4 bg-muted rounded-lg overflow-hidden">
              {analytics.paymentMethodsData.map((method, index: number) => (
                <div
                  key={method.name}
                  className={`h-full transition-all duration-300 hover:opacity-80 ${
                    index === 0 ? 'rounded-l-lg' : ''
                  } ${index === analytics.paymentMethodsData.length - 1 ? 'rounded-r-lg' : ''}`}
                  style={{ 
                    width: `${method.value}%`,
                    backgroundColor: method.color
                  }}
                />
              ))}
            </div>

            <div className="space-y-3">
              {analytics.paymentMethodsData.map((method) => (
                <div 
                  key={method.name}
                  className="flex items-center justify-between group hover:bg-muted/30 p-3 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-3 h-6 rounded-sm transition-transform group-hover:scale-110 shadow-sm" 
                      style={{ backgroundColor: method.color }}
                    />
                    <div className="flex items-baseline gap-3">
                      <span className="font-bold text-lg">{method.value}%</span>
                      <span className="text-sm text-muted-foreground font-medium">{method.name}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    CHF {method.amount.toLocaleString('de-CH')}.–
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico 5: Órdenes por Estado */}
      <Card className="bg-card rounded-2xl border border-border/50 transition-all duration-200 hover:shadow-md">
        <CardHeader className="px-6 pt-6 pb-4">
          <h3 className="text-lg lg:text-xl font-semibold text-foreground">Órdenes por Estado</h3>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.ordersData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="status" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {analytics.ordersData.map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-3">
            {analytics.ordersData.map((item, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-sm text-foreground">{item.status}</span>
                </div>
                <span className="text-sm font-semibold">{item.count} órdenes</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
