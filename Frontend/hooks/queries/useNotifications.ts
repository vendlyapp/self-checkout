'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type Notification } from '@/lib/services/notificationService';
import { useMyStore } from './useMyStore';

const NOTIFICATIONS_QUERY_KEY = 'notifications';

export interface UseNotificationsOptions {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { data: store } = useMyStore();
  const storeId = store?.id ?? null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, storeId, options.limit, options.offset, options.unreadOnly],
    queryFn: async () => {
      const result = await notificationService.getNotifications(options);
      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Laden der Benachrichtigungen');
      }
      return { data: result.data, unreadCount: result.unreadCount, total: result.total ?? 0 };
    },
    enabled: !!storeId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // poll every 60s
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_data, _id) => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
    },
  });

  const notifications: Notification[] = query.data?.data ?? [];
  const unreadCount = query.data?.unreadCount ?? 0;
  const total = query.data?.total ?? 0;

  return {
    notifications,
    unreadCount,
    total,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAsReadPending: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    markAllAsReadPending: markAllAsReadMutation.isPending,
    hasStore: !!storeId,
  };
}
