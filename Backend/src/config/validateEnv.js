/**
 * Validación de variables de entorno requeridas en startup.
 * Ejecutado antes de iniciar el servidor para fail-fast si faltan vars críticas.
 */

const REQUIRED = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
];

const REQUIRED_IN_PROD = [
  'CORS_ORIGIN',
  'SUPABASE_SERVICE_ROLE_KEY',
];

module.exports = function validateEnv() {
  const missing = REQUIRED.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`[startup] Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    const missingProd = REQUIRED_IN_PROD.filter(k => !process.env[k]);
    if (missingProd.length) {
      console.error(`[startup] Missing required env vars in production: ${missingProd.join(', ')}`);
      process.exit(1);
    }

    // Warn si SERVICE_ROLE_KEY == ANON_KEY (el fallback silencioso del authMiddleware)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.SUPABASE_ANON_KEY) {
      console.warn('[startup] WARNING: SUPABASE_SERVICE_ROLE_KEY equals ANON_KEY — auth admin requests will have reduced permissions');
    }
  }

  console.log('[startup] ✓ All required env vars present');
};
