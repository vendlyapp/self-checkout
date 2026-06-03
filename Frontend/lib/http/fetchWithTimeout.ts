import { API_CONFIG } from '@/lib/config/api';

export type RequestSignalHandle = {
  signal: AbortSignal;
  cleanup: () => void;
};

/** Combina signal externo (React Query) con timeout para evitar requests colgados. */
export function createRequestSignal(
  externalSignal?: AbortSignal | null,
  timeoutMs: number = API_CONFIG.TIMEOUT
): RequestSignalHandle {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort(new DOMException('Request timeout', 'TimeoutError'));
  }, timeoutMs);

  const cleanup = () => clearTimeout(timeoutId);

  if (!externalSignal) {
    return { signal: timeoutController.signal, cleanup };
  }

  if (externalSignal.aborted) {
    cleanup();
    return { signal: externalSignal, cleanup: () => {} };
  }

  if (typeof AbortSignal.any === 'function') {
    return {
      signal: AbortSignal.any([externalSignal, timeoutController.signal]),
      cleanup,
    };
  }

  const combined = new AbortController();
  const abortCombined = () => {
    if (!combined.signal.aborted) {
      combined.abort(externalSignal.reason ?? timeoutController.signal.reason);
    }
  };

  externalSignal.addEventListener('abort', abortCombined);
  timeoutController.signal.addEventListener('abort', abortCombined);

  return {
    signal: combined.signal,
    cleanup: () => {
      cleanup();
      externalSignal.removeEventListener('abort', abortCombined);
      timeoutController.signal.removeEventListener('abort', abortCombined);
    },
  };
}
