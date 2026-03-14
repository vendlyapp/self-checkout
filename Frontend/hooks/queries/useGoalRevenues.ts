'use client';

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/lib/services/orderService';
import { useMyStore } from '@/hooks/queries/useMyStore';
import { getLocalDateString } from '@/lib/utils';

/** Start of current week (Monday) in local date YYYY-MM-DD */
function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - (day === 0 ? 6 : day - 1); // Monday = 1
  const monday = new Date(d);
  monday.setDate(diff);
  return getLocalDateString(monday);
}

/** First day of current month in local date YYYY-MM-DD */
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

export function useGoalRevenues() {
  const { data: store } = useMyStore();
  const ownerId = store?.ownerId ?? (store as { ownerid?: string } | undefined)?.ownerid ?? undefined;

  return useQuery({
    queryKey: ['goalRevenues', ownerId],
    queryFn: async ({ signal }): Promise<GoalRevenues> => {
      if (!ownerId) return emptyRevenues;
      const today = getLocalDateString();
      const dateFromWeek = getWeekStart();
      const dateTo = today;
      const dateFromMonth = getMonthStart();

      const [todayRes, weekRes, monthRes] = await Promise.all([
        OrderService.getStats({ date: today, ownerId }, { signal }),
        OrderService.getStats({ dateFrom: dateFromWeek, dateTo, ownerId }, { signal }),
        OrderService.getStats({ dateFrom: dateFromMonth, dateTo, ownerId }, { signal }),
      ]);

      return {
        revenueToday: todayRes.success && todayRes.data ? todayRes.data.totalRevenue : 0,
        revenueWeek: weekRes.success && weekRes.data ? weekRes.data.totalRevenue : 0,
        revenueMonth: monthRes.success && monthRes.data ? monthRes.data.totalRevenue : 0,
      };
    },
    enabled: !!ownerId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    throwOnError: false,
  });
}
