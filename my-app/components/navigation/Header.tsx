// components/navigation/Header.tsx
'use client';

import { Bell, ChartNoAxesColumn } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { lightFeedback } from '@/lib/utils/safeFeedback';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications - en producción vendrían de una API
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Neue Bestellung',
    message: 'Sie haben eine neue Bestellung erhalten',
    time: 'Vor 5 Minuten',
    read: false,
  },
  {
    id: '2',
    title: 'Produkt aktualisiert',
    message: 'Das Produkt "Coffee Blend" wurde aktualisiert',
    time: 'Vor 1 Stunde',
    read: true,
  },
];

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  // Calcular notificaciones no leídas
  const unreadCount = useMemo(
    () => mockNotifications.filter(n => !n.read).length,
    []
  );

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

      <header className="dashboard-header">
        <div className="dashboard-header-content bg-background-cream ">
          {/* Logo */}
          <Link href="/dashboard" className="dashboard-logo">
            <Image 
              src="/logo.svg" 
              alt="Self-Checkout Logo" 
              width={100} 
              height={100}
              priority
            />
          </Link>

          {/* Actions */}
          <div className="header-actions">
            {/* Search Button */}
            <button
              className={clsx(
                "header-action-button rounded-full",
                pressedButton === 'search' && "button-pressed"
              )}
              onTouchStart={() => handleButtonPress('search')}
              onMouseDown={(e) => {
                handleButtonPress('search');
                handleValidInteraction(e);
              }}
              onClick={handleValidInteraction}
              aria-label="Buscar"
            >
              <ChartNoAxesColumn className="header-icon" />
            </button>

            {/* Notifications Button */}
            <button
              className={clsx(
                "header-action-button rounded-full relative",
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
              aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
            >
              <Bell className="header-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge" aria-hidden="true" />
              )}
            </button>

           
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            
            <div className="notification-list">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={clsx(
                    "notification-item",
                    !notification.read && "bg-brand-50/50"
                  )}
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
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {mockNotifications.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">
                  Keine neuen Benachrichtigungen
                </p>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}