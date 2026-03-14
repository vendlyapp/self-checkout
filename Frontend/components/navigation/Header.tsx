// components/navigation/Header.tsx
'use client';

import { Bell, ChartNoAxesColumn } from 'lucide-react';
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { useNotifications } from '@/hooks/queries/useNotifications';

export default function Header() {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const { unreadCount } = useNotifications({ limit: 20 });

  const handleButtonPress = useCallback((buttonId: string) => {
    setPressedButton(buttonId);
    setTimeout(() => setPressedButton(null), 150);
  }, []);

  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLElement>) => {
    lightFeedback(e.currentTarget);
  }, []);

  return (
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

          {/* Notifications: navegar a la página de notificaciones */}
          <Link
            href="/store/notifications"
            className={clsx(
              "header-action-button rounded-full relative touch-target flex items-center justify-center",
              pressedButton === 'notifications' && "button-pressed"
            )}
            onTouchStart={() => handleButtonPress('notifications')}
            onMouseDown={(e) => {
              handleButtonPress('notifications');
              handleValidInteraction(e);
            }}
            onClick={handleValidInteraction}
            aria-label={unreadCount > 0 ? `Benachrichtigungen (${unreadCount} ungelesen)` : 'Benachrichtigungen'}
          >
            <Bell className="header-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge" aria-hidden="true" />
            )}
          </Link>
        </div>
      </div>
      <div className="w-full h-px bg-white" />
    </header>
  );
}
