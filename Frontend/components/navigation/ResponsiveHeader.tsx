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

interface ResponsiveHeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
  isDesktop?: boolean;
}

export default function ResponsiveHeader({
  onMenuToggle,
  showMenuButton = false,
  isMobile = false,
  isDesktop = false
}: ResponsiveHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { getStoreStatus } = useStoreState();
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  // Obtener estado de la tienda
  const storeStatus = getStoreStatus();

  // Calcular notificaciones no leídas
  const unreadCount = useMemo(
    () => mockNotifications.filter(n => !n.read).length,
    []
  );

  // Manejar presión de botón con vibración háptica
  const handleButtonPress = useCallback((buttonId: string) => {
    setPressedButton(buttonId);
    setTimeout(() => setPressedButton(null), 150);
  }, []);

  // Manejar feedback en eventos válidos
  const handleValidInteraction = useCallback((e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
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
    if (showUserMenu) {
      setShowUserMenu(false);
    }
  }, [showNotifications, showUserMenu]);


  return (
    <>
      {/* Modal de logout elegante */}
      <LogoutModal isOpen={isLoggingOut} />
      
      {/* Overlay para cerrar dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-20"
          onClick={handleClickOutside}
          aria-hidden="true"
        />
      )}

      <header className={clsx(
        "bg-white border-b border-gray-200 transition-all duration-300",
        isMobile ? "h-[calc(85px+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]" : "h-20"
      )}>
        {isDesktop ? (
          // Header completo para desktop
          <div className="w-full h-full">
            {/* Barra superior con info del negocio */}
            <div className="h-full bg-gray-50 border-b border-gray-100 flex items-center justify-between px-6 text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <span>Heiniger&apos;s Hofladen</span>
                <span>•</span>
                <span>Admin Dashboard</span>
                <span>•</span>
                <span className={clsx(
                  "font-medium flex items-center gap-1",
                  storeStatus.isOpen ? "text-green-600" : "text-red-600"
                )}>
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    storeStatus.isOpen ? "bg-green-500" : "bg-red-500"
                  )} />
                  {storeStatus.statusText}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Última actualización: {new Date(storeStatus.lastUpdated).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                <span>•</span>
                <span>CHF 1,234.56 hoy</span>
              </div>
            </div>

          </div>
        ) : isMobile ? (
          // Header original para móvil (sin cambios)
          <div className="dashboard-header-content bg-background-cream h-[85px] w-full">
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
                aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
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
                    // Limpiar toda la sesión usando la utilidad centralizada
                    await clearAllSessionData();
                    
                    // También cerrar sesión en el contexto
                    try {
                      await signOut();
                    } catch (contextError) {
                      console.warn('Error en contexto de logout (puede ignorarse):', contextError);
                    }
                    
                    toast.success('Erfolgreich abgemeldet');
                    
                    // Redirigir a la ruta raíz
                    setTimeout(() => {
                      router.push('/');
                      setTimeout(() => {
                        window.location.href = '/';
                      }, 100);
                    }, 300);
                  } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    toast.error('Fehler beim Abmelden');
                    
                    // Forzar limpieza y redirección
                    try {
                      await clearAllSessionData();
                    } catch {
                      if (typeof window !== 'undefined') {
                        localStorage.clear();
                        sessionStorage.clear();
                      }
                    }
                    
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 300);
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
          // Header para tablet
          <div className="flex items-center justify-between px-4 h-full w-full">
            {/* Logo y Menu Button */}
            <div className="flex items-center gap-3">
              {showMenuButton && (
                <button
                  onClick={onMenuToggle}
                  className={clsx(
                    "p-2 rounded-lg hover:bg-gray-100 transition-colors",
                    pressedButton === 'menu' && "scale-95"
                  )}
                  onTouchStart={() => handleButtonPress('menu')}
                  onMouseDown={(e) => {
                    handleButtonPress('menu');
                    handleValidInteraction(e);
                  }}
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}

              <div className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="Self-Checkout Logo"
                  width={32}
                  height={32}
                  priority
                  className="h-[32px] w-auto"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-base">
                    Self-Checkout
                  </span>
                  <span className="text-xs text-gray-500">
                    {pathname === '/dashboard' && 'Übersicht'}
                    {pathname?.startsWith('/charge') && 'Verkauf & Kasse'}
                    {pathname?.startsWith('/products') && 'Produktverwaltung'}
                    {pathname?.startsWith('/store') && 'Geschäftseinstellungen'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Store Status */}
              <div className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                storeStatus.isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                <div className={clsx(
                  "w-2 h-2 rounded-full",
                  storeStatus.isOpen ? "bg-green-500" : "bg-red-500"
                )} />
                {storeStatus.statusText}
              </div>

              {/* Notifications Button */}
              <button
                className={clsx(
                  "p-2 rounded-lg hover:bg-gray-100 transition-colors relative",
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
                aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </button>

              {/* Logout Button */}
              <button
                className={clsx(
                  "p-2 rounded-lg hover:bg-red-50 transition-colors group",
                  pressedButton === 'logout' && "scale-95",
                  isLoggingOut && "opacity-50 cursor-not-allowed"
                )}
                onClick={async (e) => {
                  if (isLoggingOut) return;
                  
                  handleButtonPress('logout');
                  handleValidInteraction(e);
                  setIsLoggingOut(true);
                  
                  try {
                    // Limpiar toda la sesión usando la utilidad centralizada
                    await clearAllSessionData();
                    
                    // También cerrar sesión en el contexto
                    try {
                      await signOut();
                    } catch (contextError) {
                      console.warn('Error en contexto de logout (puede ignorarse):', contextError);
                    }
                    
                    toast.success('Erfolgreich abgemeldet');
                    
                    // Redirigir a la ruta raíz
                    setTimeout(() => {
                      router.push('/');
                      setTimeout(() => {
                        window.location.href = '/';
                      }, 100);
                    }, 300);
                  } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    toast.error('Fehler beim Abmelden');
                    
                    // Forzar limpieza y redirección
                    try {
                      await clearAllSessionData();
                    } catch {
                      if (typeof window !== 'undefined') {
                        localStorage.clear();
                        sessionStorage.clear();
                      }
                    }
                    
                    setTimeout(() => {
                      window.location.href = '/';
                    }, 300);
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
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-500">
                  {unreadCount} sin leer
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
