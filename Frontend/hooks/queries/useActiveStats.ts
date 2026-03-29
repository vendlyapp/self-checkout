import { useQuery } from '@tanstack/react-query';
import { API_CONFIG } from '@/lib/config/api';
import { supabase } from '@/lib/supabase/client';
import { devWarn } from '@/lib/utils/logger';

export interface ActiveStatsData {
  activeCustomers: number;
  openCartsValue: number;
  lastSeen: string | null;
}

const FALLBACK: ActiveStatsData = { activeCustomers: 0, openCartsValue: 0, lastSeen: null };

async function fetchActiveStats(): Promise<ActiveStatsData> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch(`${API_CONFIG.BASE_URL}/api/telemetry/active-stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      devWarn(`[useActiveStats] ${res.status}`);
      throw new Error(`active-stats ${res.status}`);
    }

    const json = await res.json();
    return (json.data as ActiveStatsData) ?? FALLBACK;
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('active-stats')) throw e;
    devWarn('[useActiveStats] Netzwerkfehler', e);
    throw e instanceof Error ? e : new Error('active-stats failed');
  }
}

export function useActiveStats() {
  return useQuery<ActiveStatsData>({
    queryKey: ['active-stats'],
    queryFn: fetchActiveStats,
    refetchInterval: 30_000,
    staleTime: 20_000,
    retry: false,
  });
}
