'use client';

import { TrendingUp, TrendingDown, Banknote, ShoppingCart, Users, Package } from 'lucide-react';

interface QuickMetricsWidgetProps {
  className?: string;
}

const QuickMetricsWidget = ({ className = '' }: QuickMetricsWidgetProps) => {
  // Mock data - en una app real esto vendría de un hook o API
  const metrics = [
    {
      label: 'Revenue Today',
      value: 'CHF 1,580',
      change: '+12.5%',
      trend: 'up' as 'up' | 'down',
      icon: Banknote,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Orders',
      value: '24',
      change: '+8.2%',
      trend: 'up' as 'up' | 'down',
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'New Customers',
      value: '18',
      change: '+15.3%',
      trend: 'up' as 'up' | 'down',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      label: 'Products Sold',
      value: '156',
      change: '-2.1%',
      trend: 'down' as 'up' | 'down',
      icon: Package,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className={`bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-sm md:text-base font-semibold text-gray-900">Quick Metrics</h3>
        <div className="text-xs text-gray-500">Last 24h</div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-3 md:p-3.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-ios-fast">
            <div className="flex items-start justify-between mb-1.5 md:mb-2">
              <div className={`p-1.5 rounded-lg ${metric.color}`}>
                <metric.icon className="w-3 h-3 md:w-4 md:h-4" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{metric.change}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-gray-900 truncate">{metric.value}</p>
              <p className="text-xs text-gray-500 truncate">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Overall Performance</span>
          <span className="text-green-600 font-medium">+8.5% vs yesterday</span>
        </div>
      </div>
    </div>
  );
};

export default QuickMetricsWidget;
