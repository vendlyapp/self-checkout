/**
 * Servicio de notificaciones para el admin de tienda
 */

import { buildApiUrl, getAuthHeaders, API_CONFIG } from '@/lib/config/api';

export interface NotificationPayload {
  orderId?: string;
  total?: number;
  paymentMethod?: string | null;
  status?: string;
}

export interface Notification {
  id: string;
  storeId: string | null;
  type: string;
  title: string;
  message: string;
  payload: NotificationPayload;
  read: boolean;
  createdAt: string;
}

interface GetNotificationsParams {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  total?: number;
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function getAuthToken(): Promise<string | null> {
  const { supabase } = await import('@/lib/supabase/client');
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export const notificationService = {
  async getNotifications(
    params: GetNotificationsParams = {}
  ): Promise<GetNotificationsResponse> {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, data: [], unreadCount: 0 };
    }
    const { limit = 20, offset = 0, unreadOnly = false } = params;
    const searchParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      unreadOnly: String(unreadOnly),
    });
    const url = `${buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS)}?${searchParams}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    const json = (await response.json()) as GetNotificationsResponse & { success?: boolean };
    if (!response.ok) {
      return {
        success: false,
        data: [],
        unreadCount: 0,
        error: json.error || `HTTP ${response.status}`,
      };
    }
    return {
      success: true,
      data: json.data ?? [],
      unreadCount: json.unreadCount ?? 0,
      total: json.total,
    };
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No session' };
    }
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION_READ(id));
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
    });
    const json = (await response.json()) as ApiResponse<Notification>;
    if (!response.ok) {
      return { success: false, error: json.error || `HTTP ${response.status}` };
    }
    return json;
  },

  async markAllAsRead(): Promise<ApiResponse<unknown>> {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'No session' };
    }
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS_READ_ALL);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getAuthHeaders(token),
    });
    const json = (await response.json()) as ApiResponse<unknown>;
    if (!response.ok) {
      return { success: false, error: json.error || `HTTP ${response.status}` };
    }
    return json;
  },
};
