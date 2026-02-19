'use client';

import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SaleCardProps } from '../types';
import { formatSwissPriceWithCHF } from '@/lib/utils';

const SaleCard = ({ sale }: SaleCardProps) => {
  const router = useRouter();

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

  const handleClick = () => {
    if (sale.id) {
      router.push(`/sales/orders/${sale.id}`);
    }
  };

  return (
    <Card 
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] touch-target"
      onClick={handleClick}
    >
      <CardContent className="p-3 md:p-4 lg:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 min-w-0 flex-1">
            <div className={`w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 ${statusConfig.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <div className={`${statusConfig.textColor} md:scale-100 lg:scale-110`}>
                {statusConfig.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{sale.name}</h3>
              <p className="text-xs text-gray-500 truncate" title={sale.time}>{sale.receipt} · {sale.time}</p>
              <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                <span className={`text-xs md:text-sm font-medium ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className={`font-bold text-sm md:text-base lg:text-lg ${statusConfig.amountColor}`}>
              {formatSwissPriceWithCHF(sale.amount)}
            </p>
            <p className="text-xs md:text-sm text-gray-500">{sale.paymentMethod}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaleCard;
