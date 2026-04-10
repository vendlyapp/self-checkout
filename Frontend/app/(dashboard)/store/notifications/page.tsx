'use client'

import { useResponsive } from '@/hooks'
import { Bell, CheckCheck, Loader, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/queries/useNotifications'
import { DashboardLoadingState } from '@/components/ui/DashboardLoadingState'

function formatNotificationTime(createdAt: string): string {
  try {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `Vor ${diffMins} Min.`
    if (diffHours < 24) return `Vor ${diffHours} Std.`
    if (diffDays < 7) return `Vor ${diffDays} T.`
    return date.toLocaleDateString('de-CH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return createdAt
  }
}

export default function NotificationsPage() {
  const { isMobile } = useResponsive()
  const router = useRouter()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    markAllAsReadPending,
    hasStore,
  } = useNotifications({ limit: 50 })

  const handleNotificationClick = async (notification: { id: string; read: boolean; payload?: { orderId?: string } }) => {
    if (!notification.read) {
      try {
        await markAsRead(notification.id)
      } catch {
        // ignore
      }
    }
    if (notification.payload?.orderId) {
      router.push(`/sales/orders/${notification.payload.orderId}`)
    }
  }

  return (
    <div className="w-full min-h-0 min-w-0 animate-fade-in">
      {isMobile ? (
        <div className="bg-background-cream safe-area-bottom pb-28">
          <div className="px-4 pt-4 pb-4 space-y-6">
            {/* Acción principal: marcar todas como leídas */}
            {unreadCount > 0 && (
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  disabled={markAllAsReadPending}
                  className="flex w-full min-h-[52px] items-center justify-between gap-3 px-4 py-3.5 active:bg-gray-50/80 touch-manipulation disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15">
                      {markAllAsReadPending ? (
                        <Loader className="w-5 h-5 animate-spin text-brand-600" />
                      ) : (
                        <CheckCheck className="w-5 h-5 text-brand-600" />
                      )}
                    </span>
                    <span className="text-[17px] font-semibold text-gray-900">
                      Alle als gelesen markieren
                    </span>
                  </span>
                </button>
              </div>
            )}

            {isLoading && <DashboardLoadingState mode="section" message="Benachrichtigungen werden geladen..." />}

            {error && (
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-[15px] text-red-600">
                  Fehler beim Laden.{' '}
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="font-semibold text-brand-600 underline"
                  >
                    Erneut versuchen
                  </button>
                </p>
              </div>
            )}

            {!isLoading && !error && (!hasStore || notifications.length === 0) && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="mt-4 text-[17px] font-semibold text-gray-900">Keine Benachrichtigungen</p>
                <p className="mt-1 text-[15px] text-gray-500">
                  Hier erscheinen neue Bestellungen und Hinweise.
                </p>
              </div>
            )}

            {!isLoading && !error && hasStore && notifications.length > 0 && (
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full items-start gap-3 px-4 py-4 text-left active:bg-gray-50/80 touch-manipulation min-h-[72px] ${
                          !notification.read ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        {!notification.read && (
                          <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-500" />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[17px] font-semibold text-gray-900 leading-snug">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-[15px] text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-1.5 text-[13px] text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                          {notification.payload?.orderId && (
                            <p className="mt-2 text-[15px] font-medium text-brand-600 flex items-center gap-1">
                              Bestellung anzeigen
                              <ChevronRight className="h-4 w-4" />
                            </p>
                          )}
                        </div>
                        {notification.payload?.orderId && (
                          <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0 mt-1" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop: mismo contenido, contenedor centrado */
        <div className="bg-background-cream py-8">
          <div className="mx-auto max-w-2xl px-4 md:px-6">
            {unreadCount > 0 && (
              <div className="mb-6 rounded-2xl overflow-hidden bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  disabled={markAllAsReadPending}
                  className="flex w-full min-h-[52px] items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50/80 transition-colors disabled:opacity-50"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15">
                      {markAllAsReadPending ? (
                        <Loader className="w-5 h-5 animate-spin text-brand-600" />
                      ) : (
                        <CheckCheck className="w-5 h-5 text-brand-600" />
                      )}
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      Alle als gelesen markieren
                    </span>
                  </span>
                </button>
              </div>
            )}

            {isLoading && <DashboardLoadingState mode="section" message="Benachrichtigungen werden geladen..." />}

            {error && (
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-red-600">
                  Fehler beim Laden.{' '}
                  <button type="button" onClick={() => refetch()} className="font-semibold text-brand-600 underline">
                    Erneut versuchen
                  </button>
                </p>
              </div>
            )}

            {!isLoading && !error && (!hasStore || notifications.length === 0) && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-900">Keine Benachrichtigungen</p>
                <p className="mt-1 text-gray-500">Hier erscheinen neue Bestellungen und Hinweise.</p>
              </div>
            )}

            {!isLoading && !error && hasStore && notifications.length > 0 && (
              <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
                <ul className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-gray-50/80 transition-colors min-h-[72px] ${
                          !notification.read ? 'bg-brand-50/40' : ''
                        }`}
                      >
                        {!notification.read && (
                          <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-brand-500" />
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-semibold text-gray-900">{notification.title}</p>
                          <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                          <p className="mt-1.5 text-xs text-gray-400">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                          {notification.payload?.orderId && (
                            <p className="mt-2 text-sm font-medium text-brand-600 flex items-center gap-1">
                              Bestellung anzeigen <ChevronRight className="h-4 w-4" />
                            </p>
                          )}
                        </div>
                        {notification.payload?.orderId && (
                          <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0 mt-1" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
