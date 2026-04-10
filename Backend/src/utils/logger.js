/**
 * Lightweight structured logger.
 *
 * - Development: colored console output with emoji (matches current behavior)
 * - Production: JSON lines to stdout, no debug-level noise
 *
 * Usage:
 *   const logger = require('./logger');
 *   logger.info('Server started', { port: 5000 });
 *   logger.error('Query failed', { query, error: err.message });
 */

const isProduction = process.env.NODE_ENV === 'production';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = isProduction ? LEVELS.info : LEVELS.debug;

/**
 * Format a log entry.
 * In production: single-line JSON  { level, msg, ts, ...meta }
 * In development: human-readable with optional emoji prefix
 */
function log(level, message, meta) {
  if (LEVELS[level] < MIN_LEVEL) return;

  if (isProduction) {
    const entry = {
      level,
      msg: message,
      ts: new Date().toISOString(),
      ...(meta && typeof meta === 'object' ? meta : {}),
    };
    process.stdout.write(JSON.stringify(entry) + '\n');
    return;
  }

  // Development: colored output
  const prefix = { debug: '🔍', info: '✅', warn: '⚠️', error: '❌' }[level] || '';
  const args = [`${prefix} [${level.toUpperCase()}] ${message}`];
  if (meta !== undefined) args.push(meta);
  console[level === 'debug' ? 'log' : level](...args);
}

const logger = {
  debug: (msg, meta) => log('debug', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
};

module.exports = logger;
