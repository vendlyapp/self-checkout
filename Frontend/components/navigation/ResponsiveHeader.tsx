'use client';

import { Bell, ChartNoAxesColumn, Menu, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { useStoreState } from '@/lib/stores';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { clearAllSessionData } from '@/lib/utils/sessionUtils';
import LogoutModal from '@/components/ui/LogoutModal';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Mock notifications (replace with API in production)
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

interface ResponsiveHeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
  /** When left sidebar is visible (tablet/desktop), hide top bar to avoid duplicate logo */
  sidebarVisible?: boolean;
}

export default function ResponsiveHeader({
  onMenuToggle,
  showMenuButton = false,
  isMobile = false,
  isDesktop = false,
  sidebarVisible = false,
}: ResponsiveHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { getStoreStatus } = useStoreState();
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const storeStatus = getStoreStatus();
  const unreadCount = useMemo(
    () => mockNotifications.filter(n => !n.read).length,
    []
  );

  const handleButtonPress = useCallback((buttonId: string) => {
    setPressedButton(buttonId);
    setTimeout(() => setPressedButton(null), 150);
  }, []);

  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    lightFeedback(e.currentTarget);
  }, []);

  const handleNotificationToggle = useCallback(() => {
    setShowNotifications(prev => !prev);
    handleButtonPress('notifications');
  }, [handleButtonPress]);

  const handleClickOutside = useCallback(() => {
    if (showNotifications) {
      setShowNotifications(false);
    }
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  }, [showNotifications, showUserMenu]);


  return (
    <>
      <LogoutModal isOpen={isLoggingOut} />
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-20"
          onClick={handleClickOutside}
          aria-hidden="true"
        />
      )}

      <header className={clsx(
        "bg-white transition-ios-slow",
        isMobile ? "h-[calc(80px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-gray-100" : (isDesktop || sidebarVisible) ? "h-0 min-h-0 border-0 overflow-hidden" : "h-16 border-b border-gray-100"
      )}>
        {(isDesktop || sidebarVisible) ? null : isMobile ? (
          // Header original para móvil (sin cambios)
          <div className="dashboard-header-content bg-background-cream h-[80px] w-full">
            {/* Logo */}
            <Link href="/dashboard" className="dashboard-logo-d touch-target tap-highlight-transparent">
              <Image
                src="/logo.svg"
                alt="Self-Checkout Logo"
                width={32}
                height={32}
                priority
                className="h-[32px] w-auto"
              />
            </Link>

            {/* Actions */}
            <div className="header-actions">
             

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

              {/* Logout Button */}
              <button
                className={clsx(
                  "header-action-button rounded-full touch-target",
                  pressedButton === 'logout' && "button-pressed"
                )}
                onClick={async (e) => {
                  if (isLoggingOut) return;
                  
                  handleButtonPress('logout');
                  handleValidInteraction(e);
                  setIsLoggingOut(true);
                  
                  try {
                    await clearAllSessionData();
                    try {
                      await signOut();
                    } catch (contextError) {
                      console.warn('SignOut context error (ignored):', contextError);
                    }
                    toast.success('Erfolgreich abgemeldet');
                    setTimeout(() => {
                      router.push('/');
                      setTimeout(() => { window.location.href = '/'; }, 100);
                    }, 300);
                  } catch (error) {
                    console.error('Logout failed:', error);
                    toast.error('Fehler beim Abmelden');
                    try {
                      await clearAllSessionData();
                    } catch {
                      if (typeof window !== 'undefined') {
                        localStorage.clear();
                        sessionStorage.clear();
                      }
                    }
                    setTimeout(() => { window.location.href = '/'; }, 300);
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                onTouchStart={() => handleButtonPress('logout')}
                onMouseDown={(e) => {
                  handleButtonPress('logout');
                  handleValidInteraction(e);
                }}
                disabled={isLoggingOut}
                aria-label="Abmelden"
              >
                <LogOut className="header-icon" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 h-full w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {showMenuButton && (
                <button
                  onClick={onMenuToggle}
                  className={clsx(
                    "p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0",
                    pressedButton === 'menu' && "scale-95"
                  )}
                  onTouchStart={() => handleButtonPress('menu')}
                  onMouseDown={(e) => {
                    handleButtonPress('menu');
                    handleValidInteraction(e);
                  }}
                  aria-label="Menü öffnen"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}

              <div className="flex items-center gap-3 min-w-0">
                <Image
                  src="/logo.svg"
                  alt="Self-Checkout Logo"
                  width={32}
                  height={32}
                  priority
                  className="h-8 w-auto flex-shrink-0"
                />
               
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={clsx(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                storeStatus.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                <span className={clsx(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  storeStatus.isOpen ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="truncate max-w-[100px]">{storeStatus.statusText}</span>
              </div>

              <button
                className={clsx(
                  "p-2 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0",
                  pressedButton === 'notifications' && "scale-95"
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
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full" aria-hidden />
                )}
              </button>

              <button
                className={clsx(
                  "p-2 rounded-lg hover:bg-red-50 transition-colors group flex-shrink-0",
                  pressedButton === 'logout' && "scale-95",
                  isLoggingOut && "opacity-50 cursor-not-allowed"
                )}
                onClick={async (e) => {
                  if (isLoggingOut) return;
                  
                  handleButtonPress('logout');
                  handleValidInteraction(e);
                  setIsLoggingOut(true);
                  
                  try {
                    await clearAllSessionData();
                    try {
                      await signOut();
                    } catch (contextError) {
                      console.warn('SignOut context error (ignored):', contextError);
                    }
                    toast.success('Erfolgreich abgemeldet');
                    setTimeout(() => {
                      router.push('/');
                      setTimeout(() => { window.location.href = '/'; }, 100);
                    }, 300);
                  } catch (error) {
                    console.error('Logout failed:', error);
                    toast.error('Fehler beim Abmelden');
                    try {
                      await clearAllSessionData();
                    } catch {
                      if (typeof window !== 'undefined') {
                        localStorage.clear();
                        sessionStorage.clear();
                      }
                    }
                    setTimeout(() => { window.location.href = '/'; }, 300);
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                onTouchStart={() => handleButtonPress('logout')}
                onMouseDown={(e) => {
                  handleButtonPress('logout');
                  handleValidInteraction(e);
                }}
                disabled={isLoggingOut}
                aria-label="Abmelden"
              >
                <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className={clsx(
            "absolute top-full right-4 z-30 bg-white rounded-xl shadow-lg border border-gray-100",
            isMobile ? "w-80" : "w-96"
          )}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">
                Benachrichtigungen
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">
                  {unreadCount} ungelesen
                </span>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={clsx(
                    "p-4 hover:bg-gray-50 transition-colors",
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

              {mockNotifications.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">
                    Keine neuen Benachrichtigungen
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
