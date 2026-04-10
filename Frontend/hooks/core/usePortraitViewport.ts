'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  const win = typeof window !== 'undefined' ? window : null;
  if (!win) return () => {};

  win.addEventListener('resize', onStoreChange);
  win.addEventListener('orientationchange', onStoreChange);
  const so = win.screen?.orientation;
  so?.addEventListener?.('change', onStoreChange);

  return () => {
    win.removeEventListener('resize', onStoreChange);
    win.removeEventListener('orientationchange', onStoreChange);
    so?.removeEventListener?.('change', onStoreChange);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') return true;
  return window.innerHeight > window.innerWidth;
}

function getServerSnapshot() {
  return true;
}

/**
 * true when the layout viewport is taller than wide (typical phone portrait).
 * Updates on resize and orientation changes — use for QR-Bill fullscreen
 * so landscape phones get the natural horizontal bill without a 90° transform.
 */
export function usePortraitViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
