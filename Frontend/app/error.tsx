'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring in production instead of console
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error boundary caught:', error);
    }
  }, [error]);

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">Etwas ist schiefgelaufen</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
