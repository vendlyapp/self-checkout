'use client';

import { Wifi, WifiOff, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useStoreState } from '@/lib/stores';

interface SystemStatusWidgetProps {
  className?: string;
}

const SystemStatusWidget = ({ className = '' }: SystemStatusWidgetProps) => {
  const { getStoreStatus } = useStoreState();
  const storeStatus = getStoreStatus();

  // Mock data - en una app real esto vendría de un hook o API
  const systemData = {
    isOnline: true,
    lastSync: '2 min ago',
    activeUsers: 3,
    systemHealth: 'excellent' as 'excellent' | 'good' | 'warning' | 'error',
    uptime: '99.9%'
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">System Status</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(systemData.systemHealth)}`}>
          {getHealthIcon(systemData.systemHealth)}
          <span className="capitalize">{systemData.systemHealth}</span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Store Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${storeStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs text-gray-500">Store</p>
            <p className="text-sm font-medium text-gray-900">{storeStatus.statusText}</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {systemData.isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <div>
            <p className="text-xs text-gray-500">Connection</p>
            <p className="text-sm font-medium text-gray-900">
              {systemData.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">Active Users</p>
            <p className="text-sm font-medium text-gray-900">{systemData.activeUsers}</p>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Last Sync</p>
            <p className="text-sm font-medium text-gray-900">{systemData.lastSync}</p>
          </div>
        </div>
      </div>

      {/* Uptime Bar */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>System Uptime</span>
          <span>{systemData.uptime}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: '99.9%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemStatusWidget;
