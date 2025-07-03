'use client';

import { FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SaleCardProps } from '../types';

const SaleCard = ({ sale }: SaleCardProps) => (
  <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D3F6E4] rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{sale.name}</h3>
            <p className="text-sm text-gray-600">{sale.receipt} • {sale.time}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-bold text-gray-900">
            {sale.amount.toFixed(sale.amount % 1 === 0 ? 0 : 2)}.-
          </p>
          <p className="text-xs text-gray-500">{sale.paymentMethod}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SaleCard; 