/**
 * Logger that only runs in development.
 * Use instead of console.log/warn/error to avoid noise and leaks in production.
 */

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export function devLog(...args: unknown[]): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

export function devWarn(...args: unknown[]): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

export function devError(...args: unknown[]): void {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}
