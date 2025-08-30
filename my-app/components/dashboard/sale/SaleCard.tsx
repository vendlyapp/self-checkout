'use client';

import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SaleCardProps } from '../types';
import { formatSwissPriceWithCHF } from '@/lib/utils';

const SaleCard = ({ sale }: SaleCardProps) => {
  // Get status configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bgColor: 'bg-[#D3F6E4]',
          textColor: 'text-brand-600',
          amountColor: 'text-brand-600',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Abgeschlossen'
        };
      case 'pending':
        return {
          bgColor: 'bg-[#FEF3C7]',
          textColor: 'text-yellow-600',
          amountColor: 'text-yellow-600',
          icon: <Clock className="w-4 h-4" />,
          label: 'In Bearbeitung'
        };
      case 'cancelled':
        return {
          bgColor: 'bg-[#FEE2E2]',
          textColor: 'text-red-600',
          amountColor: 'text-red-600',
          icon: <XCircle className="w-4 h-4" />,
          label: 'Storniert'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          amountColor: 'text-gray-900',
          icon: <FileText className="w-4 h-4" />,
          label: 'Unbekannt'
        };
    }
  };

  const statusConfig = getStatusConfig(sale.status);

  return (
    <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${statusConfig.bgColor} rounded-xl flex items-center justify-center`}>
              <div className={statusConfig.textColor}>
                {statusConfig.icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{sale.name}</h3>
              <p className="text-sm text-gray-600">{sale.receipt} • {sale.time}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className={`font-bold ${statusConfig.amountColor}`}>
              {formatSwissPriceWithCHF(sale.amount)}
            </p>
            <p className="text-xs text-gray-500">{sale.paymentMethod}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleCard;
