// lib/database.js — PostgreSQL client with connection pooling
const { Pool } = require('pg');
const format = require('pg-format');
require('dotenv').config();
const logger = require('../src/utils/logger');

// Use direct connection in development if available, otherwise use pooler
const resolvedConnectionString =
  process.env.NODE_ENV === 'development' && process.env.DIRECT_URL
    ? process.env.DIRECT_URL
    : process.env.DATABASE_URL;

const isUsingPooler =
  resolvedConnectionString?.includes(':6543') ||
  resolvedConnectionString?.includes('pooler.supabase.com');

const pool = new Pool({
  connectionString: resolvedConnectionString,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: false,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Attach safe error handler to each checked-out pg Client.
// Without this, a connection drop can emit an unhandled "error" event
// and crash the Node process.
const attachClientErrorHandler = (client, context = 'db-client') => {
  const onClientError = (err) => {
    const code = err?.code || 'N/A';
    const message = err?.message || 'Unknown client error';
    if (code === 'XX000' || code === '57P01' || message.includes('Connection terminated')) {
      // Expected — pool handles reconnection automatically
      return;
    }
    logger.error(`[${context}] pg client error`, { message, code });
  };
  client.on('error', onClientError);
  return () => client.removeListener('error', onClientError);
};

// Set a per-query statement timeout so slow queries release pool connections promptly
pool.on('connect', (client) => {
  client.query('SET statement_timeout = 25000').catch(() => {
    // Non-fatal — pooler may not support SET
  });
});

// Pool-level error handler (log only, never crash)
pool.on('error', (err) => {
  if (err.code === 'XX000') {
    // Common on Supabase when connection limits are exceeded
    logger.warn('[pool] Supabase closed the connection (possible connection limit). Pool will reconnect.');
    return;
  }
  if (err.code === '57P01') {
    logger.warn('[pool] Connection closed by server. Pool will reconnect.');
    return;
  }
  if (err.severity === 'FATAL') {
    logger.error('[pool] Fatal error', { message: err.message, code: err.code });
  } else if (process.env.NODE_ENV === 'development') {
    logger.warn('[pool] Non-critical error', { message: err.message });
  }
});

/**
 * Test database connection with retries and exponential backoff.
 * @param {number} maxRetries
 * @param {number} retryDelay - Base delay in ms
 * @returns {Promise<boolean>}
 */
async function testConnection(maxRetries = 3, retryDelay = 2000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.info('Retrying database connection', { attempt: attempt + 1, maxAttempts: maxRetries + 1 });
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }

      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established', { now: result.rows[0].now });
      return true;
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || 'Unknown error';
      const errorCode = error.code || 'N/A';

      if (attempt < maxRetries) {
        logger.warn('Database connection error, retrying', {
          attempt: attempt + 1,
          maxAttempts: maxRetries + 1,
          error: errorMsg,
          code: errorCode,
          retryInMs: retryDelay * (attempt + 1),
        });
      } else {
        logger.error('Database connection failed after retries', { error: errorMsg, code: errorCode });
        if (errorCode === 'ETIMEDOUT' || errorMsg.includes('timeout')) {
          logger.error('Tip: Check that your Supabase project is active and DATABASE_URL is correct.');
        } else if (errorCode === 'XX000' || errorCode === '57P01') {
          logger.error('Tip: Supabase may be limiting connections. Reduce pool max or check for multiple instances.');
        }
      }
    }
  }

  return false;
}

/**
 * Execute a SQL query with automatic retry on connection errors.
 *
 * When using Supabase Transaction Pooler (port 6543), prepared statements are
 * not supported. In that case we use pg-format to safely escape parameters.
 *
 * @param {string} text - SQL query with $1, $2, ... placeholders
 * @param {any[]} params - Parameter values
 * @param {number} retries - Number of retries on connection errors
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = [], retries = 1) {
  let client;
  let detachClientErrorHandler = null;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      client = await pool.connect();
      detachClientErrorHandler = attachClientErrorHandler(client, 'query');

      let result;
      if (isUsingPooler && params.length > 0) {
        // Transaction Pooler does NOT support PREPARE statements.
        // Use pg-format to safely escape parameters instead.
        let formattedText = text;
        const paramPlaceholders = [];

        // $N::foo[] + JS-Array: der Code unten matcht nur $N::foo (Regex \w stoppt vor '[').
        // Dann entsteht z. B. ANY(%L::foo[]) → pg-format liefert ANY('a','b'::text[]) oder
        // ANY('uuid'::text[]) → Postgres: syntax error / malformed array literal.
        // Lösung: expliziten Array-Cast am Placeholder entfernen; Array-Zweig setzt ARRAY[...]::text[].
        for (let i = params.length; i >= 1; i--) {
          if (Array.isArray(params[i - 1])) {
            formattedText = formattedText.replace(
              new RegExp(`\\$${i}::\\w+\\[\\]`, 'g'),
              `$${i}`,
            );
          }
        }

        for (let i = 1; i <= params.length; i++) {
          const paramValue = params[i - 1];
          const placeholderPattern = `\\$${i}(::\\w+)?\\b`;
          const placeholderRegex = new RegExp(placeholderPattern, 'g');

          const matches = formattedText.match(new RegExp(placeholderPattern, 'g'));
          if (!matches || matches.length === 0) continue;

          const occurrences = matches.length;
          const firstMatch = formattedText.match(new RegExp(placeholderPattern));
          const hasCasting = firstMatch && firstMatch[0] && firstMatch[0].includes('::');

          if (hasCasting) {
            const casting = firstMatch[0].substring(firstMatch[0].indexOf('::'));
            formattedText = formattedText.replace(placeholderRegex, `%L${casting}`);
            for (let j = 0; j < occurrences; j++) paramPlaceholders.push(paramValue);
          } else if (Array.isArray(paramValue)) {
            const escapedArray = paramValue.map((val) => {
              if (val === null || val === undefined) return 'NULL';
              const str = String(val).replace(/'/g, "''").replace(/\\/g, '\\\\');
              return `'${str}'`;
            });
            const arrayLiteral =
              escapedArray.length > 0
                ? `ARRAY[${escapedArray.join(',')}]::text[]`
                : `ARRAY[]::text[]`;
            formattedText = formattedText.replace(new RegExp(`\\$${i}\\b`, 'g'), arrayLiteral);
          } else {
            formattedText = formattedText.replace(new RegExp(`\\$${i}\\b`, 'g'), `%L`);
            for (let j = 0; j < occurrences; j++) paramPlaceholders.push(paramValue);
          }
        }

        const finalQuery =
          paramPlaceholders.length > 0
            ? format(formattedText, ...paramPlaceholders)
            : formattedText;
        result = await client.query(finalQuery);
      } else {
        // Direct connection — use native prepared statements (safer)
        result = await client.query(text, params);
      }

      if (detachClientErrorHandler) detachClientErrorHandler();
      client.release();
      return result;
    } catch (error) {
      lastError = error;
      if (client) {
        try {
          if (detachClientErrorHandler) detachClientErrorHandler();
          client.release();
        } catch (_) {
          // Client in bad state — pool will handle it
        }
        client = null;
      }

      const isConnectionError =
        error.code === 'XX000' ||
        error.code === '57P01' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Connection terminated');

      if (isConnectionError && attempt < retries) {
        const delay = 500 * Math.pow(2, attempt);
        logger.warn('Query connection error, retrying', {
          attempt: attempt + 1,
          maxAttempts: retries + 1,
          retryInMs: delay,
          code: error.code,
          error: error.message,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (attempt === retries) {
        logger.error('Query failed after retries', {
          error: error.message,
          queryPrefix: text.substring(0, 100),
        });
      }
    }
  }

  throw lastError;
}

/**
 * Execute a callback inside a database transaction.
 * Automatically rolls back on error.
 */
async function transaction(callback) {
  let client;
  let detachClientErrorHandler = null;
  try {
    client = await pool.connect();
    detachClientErrorHandler = attachClientErrorHandler(client, 'transaction');
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        logger.error('Rollback failed', { error: rollbackError.message });
      }
    }
    throw error;
  } finally {
    if (client) {
      try {
        if (detachClientErrorHandler) detachClientErrorHandler();
        client.release();
      } catch (releaseError) {
        logger.error('Client release failed in transaction', { error: releaseError.message });
      }
    }
  }
}

/** Close the connection pool safely */
async function closePool() {
  try {
    await pool.end();
    logger.info('Connection pool closed');
  } catch (error) {
    logger.error('Error closing pool', { error: error.message });
  }
}

// NOTE: SIGINT/SIGTERM handlers are in server.js (single source of truth)

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool,
};
