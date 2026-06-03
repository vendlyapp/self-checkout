import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient for use outside React (e.g. Zustand stores).
 * Set once from QueryProvider on mount.
 */
let appQueryClient: QueryClient | null = null;

export function setAppQueryClient(client: QueryClient | null) {
  appQueryClient = client;
}

export function getAppQueryClient(): QueryClient | null {
  return appQueryClient;
}
