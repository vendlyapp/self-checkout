import React, { useState } from 'react';
import { ChevronRight, List, X, FileText, ShoppingBasket } from 'lucide-react';
import { QuickAccessItem } from './types';

interface QuickAccessGridProps {
  onSalesAction: () => void;
  onCancelAction: () => void;
  onReceiptsAction: () => void;
  onCartAction: () => void;
  loading?: boolean;
}

const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({ 
  onSalesAction,
  onCancelAction,
  onReceiptsAction,
  onCartAction,
  loading = false 
}) => {
  const [pressedId, setPressedId] = useState<string | null>(null);

  const items: QuickAccessItem[] = [
    { 
      id: 'sales',
      icon: <List className="w-6 h-6" />, 
      title: 'Verkäufe',
      subtitle: 'Ansehen, verwalten',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      action: onSalesAction
    },
    { 
      id: 'cancel',
      icon: <X className="w-6 h-6" />, 
      title: 'Storno',
      subtitle: 'Verkauf stornieren',
      color: 'bg-red-100',
      iconColor: 'text-red-600',
      action: onCancelAction
    },
    { 
      id: 'receipts',
      icon: <FileText className="w-6 h-6" />, 
      title: 'Belege',
      subtitle: 'Ansehen, senden',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      action: onReceiptsAction
    },
    { 
      id: 'cart',
      icon: <ShoppingBasket className="w-6 h-6" />, 
      title: 'Warenkorb',
      subtitle: 'Ansehen',
      color: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      action: onCartAction
    }
  ];

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded-lg w-32 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div 
              key={idx}
              className="bg-card border border-border/50 rounded-2xl p-5 animate-pulse"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 bg-muted rounded-xl"></div>
                <div className="w-5 h-5 bg-muted rounded"></div>
              </div>
              <div className="h-4 bg-muted rounded mb-1 w-20"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Schnellzugriff</h3>
      <div className="grid grid-cols-2 gap-3 ">
        {items.map((item) => (
          <button 
            key={item.id}
            onClick={item.action}
            onKeyDown={(e) => handleKeyDown(e, item.action)}
            className={`group bg-card border border-border/50 rounded-2xl p-5 text-left hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-transform duration-150 ${pressedId === item.id ? 'scale-95' : ''}`}
            aria-label={`${item.title}: ${item.subtitle}`}
            tabIndex={0}
            onTouchStart={() => setPressedId(item.id)}
            onTouchEnd={() => setPressedId(null)}
            onMouseDown={() => setPressedId(item.id)}
            onMouseUp={() => setPressedId(null)}
            onMouseLeave={() => setPressedId(null)}
          >
            <div className="flex justify-between items-start mb-3">
              {/* Icon Container */}
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110`}> {/* group-hover opcional */}
                <div className={`${item.iconColor} transition-colors duration-200`}>
                  {item.icon}
                </div>
              </div>
              {/* Arrow Icon */}
              <ChevronRight className="w-5 h-5 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-1" />
            </div>
            {/* Content */}
            <div className="space-y-1">
              <h4 className="font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                {item.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-tight">
                {item.subtitle}
              </p>
            </div>
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid; 