'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import { API_CONFIG } from '@/lib/config/api';

const HEARTBEAT_INTERVAL_MS = 30_000;
const SESSION_ID_KEY = 'vendly_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

interface UseHeartbeatOptions {
  storeId: string | null | undefined;
}

export function useHeartbeat({ storeId }: UseHeartbeatOptions) {
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const storeIdRef = useRef(storeId);
  storeIdRef.current = storeId;

  useEffect(() => {
    if (!storeIdRef.current) return;

    const sendHeartbeat = async () => {
      const currentStoreId = storeIdRef.current;
      if (!currentStoreId) return;

      try {
        const cartValue = getSubtotal();
        const sessionId = getOrCreateSessionId();

        await fetch(`${API_CONFIG.BASE_URL}/api/telemetry/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: currentStoreId,
            sessionId,
            role: 'CUSTOMER',
            cartValue,
          }),
        });
      } catch {
        // Silencioso — el heartbeat nunca debe romper la UX
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [storeId, getSubtotal]);
}
