import React, { useState } from "react";
import { ChevronRight, List, XCircle, FileText, ShoppingBasket } from "lucide-react";
import { QuickAccessItem } from "./types";

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
  loading = false,
}) => {
  const [pressedId, setPressedId] = useState<string | null>(null);

  const items: QuickAccessItem[] = [
    {
      id: "sales",
      icon: <List className="w-6 h-6" />,
      title: "Verkäufe",
      subtitle: "Ansehen, verwalten",
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
      action: onSalesAction,
    },
    {
      id: "cancel",
      icon: <XCircle className="w-6 h-6" />,
      title: "Storno",
      subtitle: "Stornierte Bestellungen",
      color: "bg-red-100",
      iconColor: "text-red-600",
      action: onCancelAction,
    },
    {
      id: "receipts",
      icon: <FileText className="w-6 h-6" />,
      title: "Belege",
      subtitle: "Ansehen, senden",
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
      action: onReceiptsAction,
    },
    {
      id: "cart",
      icon: <ShoppingBasket className="w-6 h-6" />,
      title: "Warenkorb",
      subtitle: "Ansehen",
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
      action: onCartAction,
    },
  ];

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
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
            <div key={idx} className="bg-card  rounded-2xl p-5 animate-pulse">
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
    <div className="space-y-3 lg:space-y-4">
      <h3 className="text-lg lg:text-xl font-semibold text-foreground">Schnellzugriff</h3>
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            onKeyDown={(e) => handleKeyDown(e, item.action)}
            className={`group bg-card border border-border/50 rounded-2xl p-5 lg:p-6 text-left hover:shadow-md transition-ios ${
              pressedId === item.id ? "scale-95" : ""
            }`}
            aria-label={`${item.title}: ${item.subtitle}`}
            tabIndex={0}
            onTouchStart={() => setPressedId(item.id)}
            onTouchEnd={() => setPressedId(null)}
            onMouseDown={() => setPressedId(item.id)}
            onMouseUp={() => setPressedId(null)}
            onMouseLeave={() => setPressedId(null)}
          >
            <div className="flex justify-between items-start mb-3 lg:mb-4">
              {/* Icon Container */}
              <div
                className={`w-12 h-12 lg:w-14 lg:h-14 ${item.color} rounded-xl flex items-center justify-center transition-ios`}
              >
                <div
                  className={`${item.iconColor} transition-ios-fast lg:scale-110`}
                >
                  {item.icon}
                </div>
              </div>
              {/* Arrow Icon */}
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-muted-foreground transition-ios group-hover:text-primary group-hover:translate-x-1" />
            </div>
            {/* Content */}
            <div className="space-y-1 lg:space-y-2">
              <h4 className="font-semibold text-foreground lg:text-lg transition-ios-fast group-hover:text-primary">
                {item.title}
              </h4>
              <p className="text-sm lg:text-base text-muted-foreground leading-tight">
                {item.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessGrid;
