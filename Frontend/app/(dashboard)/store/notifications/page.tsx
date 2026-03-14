'use client'

import { useResponsive } from '@/hooks'
import { Bell, CheckCheck, Loader } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/hooks/queries/useNotifications'

function formatNotificationTime(createdAt: string): string {
  try {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Gerade eben'
    if (diffMins < 60) return `Vor ${diffMins} Minute${diffMins === 1 ? '' : 'n'}`
    if (diffHours < 24) return `Vor ${diffHours} Stunde${diffHours === 1 ? '' : 'n'}`
    if (diffDays < 7) return `Vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`
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

  const content = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            disabled={markAllAsReadPending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-200 disabled:opacity-50"
          >
            {markAllAsReadPending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCheck className="w-4 h-4" />
            )}
            Alle als gelesen markieren
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-brand-600" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-700">
            Fehler beim Laden.{' '}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-medium underline"
            >
              Erneut versuchen
            </button>
          </p>
        </div>
      )}

      {!isLoading && !error && (!hasStore || notifications.length === 0) && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Keine Benachrichtigungen</p>
          <p className="mt-1 text-sm text-gray-500">
            Hier erscheinen neue Bestellungen und wichtige Hinweise.
          </p>
        </div>
      )}

      {!isLoading && !error && hasStore && notifications.length > 0 && (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <button
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  notification.read
                    ? 'border-gray-200 bg-white hover:bg-gray-50'
                    : 'border-brand-200 bg-brand-50/50 hover:bg-brand-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!notification.read && (
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                    {notification.payload?.orderId && (
                      <p className="mt-2 text-xs font-medium text-brand-600">
                        Bestellung anzeigen →
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )

  return (
    <div className="w-full h-full gpu-accelerated animate-fade-in">
      {isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] safe-area-bottom">
          <div className="mx-auto max-w-full px-4 py-6 pb-32">
            <div className="mb-6">
              <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-gray-900">
                Benachrichtigungen
              </h1>
              <p className="text-sm leading-relaxed text-gray-500">
                System-Alerts und neue Bestellungen
              </p>
            </div>
            {content}
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="w-full min-h-screen bg-[#F2EDE8] py-8">
          <div className="mx-auto max-w-4xl px-6">
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                Benachrichtigungen
              </h1>
              <p className="text-base leading-relaxed text-gray-500">
                System-Alerts und neue Bestellungen
              </p>
            </div>
            {content}
          </div>
        </div>
      )}
    </div>
  )
}
