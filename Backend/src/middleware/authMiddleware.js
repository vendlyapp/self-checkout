const { createClient } = require('@supabase/supabase-js');
const { query } = require('../../lib/database');
const { HTTP_STATUS } = require('../types');
const storeService = require('../services/StoreService');
const logger = require('../utils/logger');

// ─── In-memory user cache ─────────────────────────────────────────────────────
// Caches the DB user-lookup result (name, role, storeId) keyed by Supabase userId.
// TTL of 60 seconds — eliminates 2-3 DB queries on every authenticated request
// while still reflecting role/store changes within 1 minute.
// Max 1000 entries to prevent unbounded memory growth under heavy concurrent load.
const USER_CACHE_TTL_MS = 60 * 1000;
const USER_CACHE_MAX_SIZE = 1000;
const userCache = new Map();

const getCachedUser = (userId) => {
  const entry = userCache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(userId);
    return null;
  }
  return entry.payload;
};

const setCachedUser = (userId, payload) => {
  // Evict oldest entry if at capacity to enforce max size
  if (userCache.size >= USER_CACHE_MAX_SIZE) {
    const oldestKey = userCache.keys().next().value;
    userCache.delete(oldestKey);
  }
  userCache.set(userId, { payload, expiresAt: Date.now() + USER_CACHE_TTL_MS });
};

// Evict expired entries periodically to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of userCache) {
    if (now > entry.expiresAt) userCache.delete(key);
  }
}, 5 * 60 * 1000);

// Supabase admin client for token verification
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
      },
    },
  }
);

// ─── Shared user resolution ──────────────────────────────────────────────────
// Used by both authMiddleware and optionalAuth to avoid code duplication.
// Returns the user payload or null if resolution fails.
async function resolveUser(supabaseUser) {
  const { id, email, user_metadata, email_confirmed_at } = supabaseUser;

  // Cache hit
  const cached = getCachedUser(id);
  if (cached) return cached;

  // Cache miss — resolve from DB
  let userRole = 'ADMIN';
  let userName =
    user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || 'User';
  let resolvedStoreId = null;

  // Single query: user + store in one round-trip
  const userResult = await query(
    `SELECT u.name, u.role, s.id AS "storeId"
     FROM "User" u
     LEFT JOIN "Store" s ON s."ownerId" = u.id
     WHERE u.id = $1`,
    [id]
  );

  if (userResult.rows.length > 0) {
    userName = userResult.rows[0].name;
    userRole = userResult.rows[0].role;
    resolvedStoreId = userResult.rows[0].storeId || null;
  } else {
    // First login — auto-create user record.
    // Role is always ADMIN for self-registered users; SUPER_ADMIN can only be
    // assigned directly in the database to prevent privilege escalation via metadata.
    const metadataRole = 'ADMIN';
    if (!userName || userName.trim() === '') {
      userName = email.split('@')[0] || 'User';
    }

    logger.info('Creating user in DB', { userId: id, email, role: metadataRole });

    try {
      await query(
        `INSERT INTO "User" (id, email, name, role, password)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [id, email, userName.trim(), metadataRole, 'oauth']
      );
    } catch (insertError) {
      if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
        logger.debug('User already exists (race condition), continuing');
        const existing = await query('SELECT name, role FROM "User" WHERE id = $1', [id]);
        if (existing.rows.length > 0) {
          userName = existing.rows[0].name;
          userRole = existing.rows[0].role;
        }
      } else {
        throw insertError;
      }
    }

    userRole = metadataRole;

    // Auto-create store for new ADMIN users
    if (metadataRole === 'ADMIN') {
      try {
        logger.info('Creating store for new ADMIN user', { userId: id });
        await storeService.create(id, { name: `${userName}'s Store`, logo: null });
      } catch (storeError) {
        logger.error('Failed to create store', { error: storeError.message });
      }
    }
  }

  const userPayload = {
    userId: id,
    email,
    name: userName,
    role: userRole,
    emailConfirmed: !!email_confirmed_at,
  };

  // Resolve storeId
  if (resolvedStoreId) {
    userPayload.storeId = resolvedStoreId;
  } else if (userRole === 'ADMIN') {
    // Fallback: store just created in this same request
    try {
      const storeResult = await query(
        'SELECT id FROM "Store" WHERE "ownerId" = $1 LIMIT 1',
        [id]
      );
      if (storeResult.rows.length > 0) {
        userPayload.storeId = storeResult.rows[0].id;
      }
    } catch (err) {
      logger.error('Failed to lookup storeId', { error: err.message });
    }
  }

  setCachedUser(id, userPayload);
  return userPayload;
}

// ─── Extract and verify token from Authorization header ─────────────────────
async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user || !data.user.id || !data.user.email) return null;
  return data.user;
}

/**
 * Required authentication middleware.
 * Returns 401 if no valid token is provided.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const supabaseUser = await verifyToken(req);

    if (!supabaseUser) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Invalid or missing authentication token',
      });
    }

    req.user = await resolveUser(supabaseUser);
    next();
  } catch (error) {
    logger.error('Critical error in authMiddleware', {
      message: error.message,
      code: error.code,
    });

    if (error.code && (error.code.startsWith('23') || error.code.startsWith('42'))) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Database error during authentication',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Authentication error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Role-based access control middleware.
 * Must be used after authMiddleware.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: 'Access denied',
      });
    }

    next();
  };
};

/**
 * Optional authentication — does NOT fail if token is missing or invalid.
 * Populates req.user when a valid token is present.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const supabaseUser = await verifyToken(req);
    if (!supabaseUser) return next();

    try {
      req.user = await resolveUser(supabaseUser);
    } catch (dbError) {
      logger.error('Error in optionalAuth DB lookup', { error: dbError.message });
      // Non-fatal — continue without user context
    }

    next();
  } catch (error) {
    // Never block the request
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth,
};
