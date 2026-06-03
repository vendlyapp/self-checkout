/**
 * Resolve post-login destination from URL search params.
 * Middleware uses `redirect`; legacy login used `returnUrl`.
 */
export function getPostLoginPath(searchParams: URLSearchParams | null): string {
  const raw =
    searchParams?.get('redirect') ||
    searchParams?.get('returnUrl') ||
    '/dashboard';
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return '/dashboard';
  }
  return raw;
}

/** Sync role cookie for middleware, then hard-navigate so cookies are sent on the next request. */
export async function completeLoginNavigation(destination: string): Promise<void> {
  try {
    await fetch('/api/auth/sync-role', { method: 'POST', credentials: 'include' });
  } catch {
    // middleware falls back to profile fetch
  }
  window.location.assign(destination);
}
