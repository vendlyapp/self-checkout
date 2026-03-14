// components/navigation/Header.tsx
'use client';

import { Bell, ChartNoAxesColumn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { useNotifications } from '@/hooks/queries/useNotifications';

function formatNotificationTime(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `Vor ${diffMins} Minute${diffMins === 1 ? '' : 'n'}`;
    if (diffHours < 24) return `Vor ${diffHours} Stunde${diffHours === 1 ? '' : 'n'}`;
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    return date.toLocaleDateString('de-CH', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return createdAt;
  }
}

export default function Header() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const {
    notifications,
    unreadCount,
    hasStore,
    markAsRead,
    markAsReadPending,
  } = useNotifications({ limit: 20 });

  // Manejar presión de botón con vibración háptica
  const handleButtonPress = useCallback((buttonId: string) => {
    setPressedButton(buttonId);

    // Reset después de la animación
    setTimeout(() => setPressedButton(null), 150);
  }, []);

  // Manejar feedback en eventos válidos
  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Feedback seguro con haptic + visual
    lightFeedback(e.currentTarget);
  }, []);

  // Toggle notificaciones
  const handleNotificationToggle = useCallback(() => {
    setShowNotifications(prev => !prev);
    handleButtonPress('notifications');
  }, [handleButtonPress]);

  // Cerrar notificaciones al hacer click fuera
  const handleClickOutside = useCallback(() => {
    if (showNotifications) {
      setShowNotifications(false);
    }
  }, [showNotifications]);

  return (
    <>
      {/* Overlay para cerrar dropdown */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-20"
          onClick={handleClickOutside}
          aria-hidden="true"
        />
      )}

      <header className="dashboard-header h-[calc(85px+env(safe-area-inset-top))] w-full pt-[env(safe-area-inset-top)] border-b border-b-white border-[1px]">
        <div className="dashboard-header-content bg-background-cream h-[85px] w-full">
          {/* Logo */}
          <Link href="/dashboard" className="dashboard-logo-d touch-target tap-highlight-transparent">
              <Image
                src="/logo.svg"
                alt="Self-Checkout Logo"
                width={30}
                height={30}
                priority
                className="h-[30px] w-auto"
              />
          </Link>

          {/* Actions */}
          <div className="header-actions">
            {/* Search Button */}
            <button
              className={clsx(
                "header-action-button rounded-full touch-target",
                pressedButton === 'search' && "button-pressed"
              )}
              onTouchStart={() => handleButtonPress('search')}
              onMouseDown={(e) => {
                handleButtonPress('search');
                handleValidInteraction(e);
              }}
              onClick={handleValidInteraction}
              aria-label="Suchen"
            >
              <ChartNoAxesColumn className="header-icon" />
            </button>

            {/* Notifications Button */}
            <button
              className={clsx(
                "header-action-button rounded-full relative touch-target",
                pressedButton === 'notifications' && "button-pressed"
              )}
              onClick={(e) => {
                handleNotificationToggle();
                handleValidInteraction(e);
              }}
              onTouchStart={() => handleButtonPress('notifications')}
              onMouseDown={(e) => {
                handleButtonPress('notifications');
                handleValidInteraction(e);
              }}
              aria-label={`Benachrichtigungen ${unreadCount > 0 ? `(${unreadCount} ungelesen)` : ''}`}
            >
              <Bell className="header-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge" aria-hidden="true" />
              )}
            </button>


          </div>
        </div>
        <div className="w-full h-px bg-white" />

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3 className="text-sm font-semibold text-gray-900">
                Benachrichtigungen
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">
                  {unreadCount} ungelesen
                </span>
              )}
            </div>

            <div className="notification-list">
              {hasStore && notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={clsx(
                    "notification-item w-full text-left",
                    !notification.read && "bg-brand-50/50"
                  )}
                  onClick={async () => {
                    if (!notification.read) {
                      try {
                        await markAsRead(notification.id);
                      } catch {
                        // ignore
                      }
                    }
                    setShowNotifications(false);
                    const orderId = notification.payload?.orderId;
                    if (orderId) {
                      router.push(`/sales/orders/${orderId}`);
                    }
                  }}
                  disabled={markAsReadPending}
                >
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <span className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {(!hasStore || notifications.length === 0) && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  Keine neuen Benachrichtigungen
                </p>
              </div>
            )}

            {hasStore && (
              <div className="p-3 border-t border-gray-100">
                <Link
                  href="/store/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Alle anzeigen
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
