'use client';

import { Bell, Menu, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import { lightFeedback } from '@/lib/utils/safeFeedback';
import { useStoreState } from '@/lib/stores';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { clearAllSessionData } from '@/lib/utils/sessionUtils';
import { devError, devWarn } from '@/lib/utils/logger';
import LogoutModal from '@/components/ui/LogoutModal';
import { useNotifications } from '@/hooks/queries/useNotifications';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  const storeStatus = getStoreStatus();
  const { unreadCount } = useNotifications({ limit: 20 });

  const handleButtonPress = useCallback((buttonId: string) => {
    setPressedButton(buttonId);
    setTimeout(() => setPressedButton(null), 150);
  }, []);

  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    lightFeedback(e.currentTarget);
  }, []);

  const handleClickOutside = useCallback(() => {
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  }, [showUserMenu]);


  return (
    <>
      <LogoutModal isOpen={isLoggingOut} />
      {showUserMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={handleClickOutside}
          aria-hidden="true"
        />
      )}

      <header className={clsx(
        "bg-white transition-ios-slow shrink-0 z-[45]",
        isMobile ? "h-[calc(80px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] border-b border-gray-100" : (isDesktop || sidebarVisible) ? "h-0 min-h-0 border-0 overflow-hidden shrink-0" : "h-16 border-b border-gray-100"
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
             

              {/* Notifications: ir a página de notificaciones */}
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
                      devWarn('SignOut context error (ignored):', contextError);
                    }
                    toast.success('Erfolgreich abgemeldet');
                    setTimeout(() => {
                      router.push('/');
                      setTimeout(() => { window.location.href = '/'; }, 100);
                    }, 300);
                  } catch (error) {
                    devError('Logout failed:', error);
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

              <Link
                href="/store/notifications"
                className={clsx(
                  "p-2 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0",
                  pressedButton === 'notifications' && "scale-95"
                )}
                onTouchStart={() => handleButtonPress('notifications')}
                onMouseDown={(e) => {
                  handleButtonPress('notifications');
                  handleValidInteraction(e);
                }}
                onClick={handleValidInteraction}
                aria-label={unreadCount > 0 ? `Benachrichtigungen (${unreadCount} ungelesen)` : 'Benachrichtigungen'}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full" aria-hidden />
                )}
              </Link>

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
                      devWarn('SignOut context error (ignored):', contextError);
                    }
                    toast.success('Erfolgreich abgemeldet');
                    setTimeout(() => {
                      router.push('/');
                      setTimeout(() => { window.location.href = '/'; }, 100);
                    }, 300);
                  } catch (error) {
                    devError('Logout failed:', error);
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

      </header>
    </>
  );
}
