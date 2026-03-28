'use client';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body>
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          paddingTop: 'max(24px, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#F2EDE8',
        }}>
          <div style={{
            maxWidth: 400,
            width: '100%',
            padding: 32,
            borderRadius: 16,
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#111' }}>
              Etwas ist schiefgelaufen
            </h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
              Ein schwerwiegender Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#25D076',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
