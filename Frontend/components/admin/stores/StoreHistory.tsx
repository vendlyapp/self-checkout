'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History, Clock, User, Settings, ShoppingCart, Package, Store } from 'lucide-react';
import { type Store as StoreType } from '@/lib/services/superAdminService';

interface StoreHistoryProps {
  storeId: string;
  store: StoreType | null;
}

export default function StoreHistory({ store }: StoreHistoryProps) {
  // Mock history data - in production, this would come from an API
  const historyEvents = [
    {
      id: '1',
      type: 'status_change',
      action: 'Geschäft aktiviert',
      description: 'Das Geschäft wurde vom Super Administrator aktiviert',
      user: 'Super Admin',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: Settings,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/15',
    },
    {
      id: '2',
      type: 'order',
      action: 'Neue Bestellung abgeschlossen',
      description: `Bestellung #ORD-0001 erfolgreich abgeschlossen`,
      user: 'System',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      icon: ShoppingCart,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-500/15',
    },
    {
      id: '3',
      type: 'product',
      action: 'Produkt hinzugefügt',
      description: 'Neues Produkt zum Katalog hinzugefügt',
      user: store?.ownerName || 'N/A',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Package,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-500/15',
    },
    {
      id: '4',
      type: 'config',
      action: 'Konfiguration aktualisiert',
      description: 'Die Geschäftseinstellungen wurden geändert',
      user: 'Super Admin',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      icon: Settings,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-500/15',
    },
    {
      id: '5',
      type: 'created',
      action: 'Geschäft erstellt',
      description: 'Das Geschäft wurde im System registriert',
      user: store?.ownerName || 'N/A',
      timestamp: store?.createdAt || new Date().toISOString(),
      icon: Store,
      color: 'text-brand-600 dark:text-brand-400',
      bgColor: 'bg-brand-50 dark:bg-brand-500/15',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Vor ${diffMins} ${diffMins === 1 ? 'Minute' : 'Minuten'}`;
    } else if (diffHours < 24) {
      return `Vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
    } else if (diffDays < 7) {
      return `Vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
    } else {
      return date.toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <Card className="bg-card rounded-2xl border border-border/50 transition-ios hover:shadow-md">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg lg:text-xl mb-2">
          <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Aktivitätsverlauf
        </CardTitle>
        <CardDescription className="text-sm">
          Protokoll aller in diesem Geschäft durchgeführten Aktionen
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-4">
        <div className="space-y-4">
          {historyEvents.map((event, index) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative flex items-start gap-4">
                {/* Timeline line */}
                {index < historyEvents.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-full bg-border" />
                )}
                
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl ${event.bgColor} flex items-center justify-center ${event.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {event.action}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(event.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span>Von: <span className="font-medium text-foreground">{event.user}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if no events */}
        {historyEvents.length === 0 && (
          <div className="text-center py-16">
            <History className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Keine Aktivität registriert</h3>
            <p className="text-sm text-muted-foreground">
              Der Aktivitätsverlauf wird hier angezeigt
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
