'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { getLocalDateString } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return getLocalDateString(monday);
}

function getMonthStart(): string {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return getLocalDateString(first);
}

export interface GoalRevenues {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
}

const emptyRevenues: GoalRevenues = {
  revenueToday: 0,
  revenueWeek: 0,
  revenueMonth: 0,
};

const STATS_TIMEOUT_MS = 12_000;

async function fetchStatsSafe(
  opts: { date?: string; dateFrom?: string; dateTo?: string; ownerId?: string },
  signal?: AbortSignal
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), STATS_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);

  try {
    return await OrderService.getStats(opts, {
      signal: signal ?? controller.signal,
    });
  } catch {
    return { success: false as const, error: 'timeout' };
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  }
}

export function useGoalRevenues() {
  const { session, loading: authLoading } = useAuth();
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId ?? session?.user?.id;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.orders.goalRevenues(ownerId),
    queryFn: async ({ signal }): Promise<GoalRevenues> => {
      if (!ownerId) return emptyRevenues;

      const today = getLocalDateString();
      const dateFromWeek = getWeekStart();
      const dateTo = today;
      const dateFromMonth = getMonthStart();

      const todayStatsKey = queryKeys.orders.stats(today, ownerId);
      const weekKey = queryKeys.orders.stats(`${dateFromWeek}:${dateTo}`, ownerId);
      const monthKey = queryKeys.orders.stats(`${dateFromMonth}:${dateTo}`, ownerId);

      const cachedToday = queryClient.getQueryData<{ totalRevenue?: number }>(todayStatsKey);
      const cachedWeek = queryClient.getQueryData<{ totalRevenue?: number }>(weekKey);
      const cachedMonth = queryClient.getQueryData<{ totalRevenue?: number }>(monthKey);

      const [todayRes, weekRes, monthRes] = await Promise.allSettled([
        cachedToday
          ? Promise.resolve({ success: true as const, data: cachedToday })
          : fetchStatsSafe({ date: today, ownerId }, signal).then((res) => {
              if (res.success && res.data) queryClient.setQueryData(todayStatsKey, res.data);
              return res;
            }),
        cachedWeek
          ? Promise.resolve({ success: true as const, data: cachedWeek })
          : fetchStatsSafe({ dateFrom: dateFromWeek, dateTo, ownerId }, signal).then((res) => {
              if (res.success && res.data) queryClient.setQueryData(weekKey, res.data);
              return res;
            }),
        cachedMonth
          ? Promise.resolve({ success: true as const, data: cachedMonth })
          : fetchStatsSafe({ dateFrom: dateFromMonth, dateTo, ownerId }, signal).then((res) => {
              if (res.success && res.data) queryClient.setQueryData(monthKey, res.data);
              return res;
            }),
      ]);

      const pickRevenue = (
        result: PromiseSettledResult<{ success?: boolean; data?: { totalRevenue?: number } }>
      ) => {
        if (result.status !== 'fulfilled') return 0;
        const res = result.value;
        return res.success && res.data ? (res.data.totalRevenue ?? 0) : 0;
      };

      return {
        revenueToday: pickRevenue(todayRes),
        revenueWeek: pickRevenue(weekRes),
        revenueMonth: pickRevenue(monthRes),
      };
    },
    enabled: !authLoading && !!session?.access_token && !!ownerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: true,
    throwOnError: false,
  });
}
