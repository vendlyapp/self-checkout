const { createClient } = require('@supabase/supabase-js');
const { query } = require('../../lib/database');
const { HTTP_STATUS } = require('../types');
const storeService = require('../services/StoreService');

// ─── In-memory user cache ─────────────────────────────────────────────────────
// Caches the DB user-lookup result (name, role, storeId) keyed by Supabase userId.
// TTL of 60 seconds — eliminates 2-3 DB queries on every authenticated request
// while still reflecting role/store changes within 1 minute.
const USER_CACHE_TTL_MS = 60 * 1000;
const userCache = new Map(); // Map<userId, { payload, expiresAt }>

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
  userCache.set(userId, { payload, expiresAt: Date.now() + USER_CACHE_TTL_MS });
};

// Evict cache periodically to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of userCache) {
    if (now > entry.expiresAt) userCache.delete(key);
  }
}, 5 * 60 * 1000);

// Cliente de Supabase con SERVICE_ROLE_KEY para verificar tokens
// Si no hay SERVICE_ROLE_KEY, usa ANON_KEY (menos seguro pero funcional)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''
      }
    }
  }
);

/**
 * Middleware para verificar autenticación con Supabase Auth
 */
const authMiddleware = async (req, res, next) => {
  try {
    console.log(`🔐 authMiddleware llamado para: ${req.method} ${req.path}`);
    
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token no proporcionado. Use: Authorization: Bearer <token>'
      });
    }

    // Extraer el token
    const token = authHeader.replace('Bearer ', '');

    // Verificar el token con Supabase Auth usando admin client
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      console.error('Error verificando token:', error?.message || 'Usuario no encontrado');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    if (!data.user.id) {
      console.error('❌ Error: data.user.id es null o undefined');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Error al verificar autenticación: ID de usuario no disponible'
      });
    }

    if (!data.user.email) {
      console.error('❌ Error: data.user.email es null o undefined');
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Error al verificar autenticación: Email de usuario no disponible'
      });
    }

    // ── Cache hit: skip all DB queries ────────────────────────────────────────
    const cached = getCachedUser(data.user.id);
    if (cached) {
      req.user = cached;
      return next();
    }

    // ── Cache miss: resolve user from DB ─────────────────────────────────────
    let userRole = 'ADMIN';
    let userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario';

    try {
      const userResult = await query(
        'SELECT name, role FROM "User" WHERE id = $1',
        [data.user.id]
      );

      if (userResult.rows.length > 0) {
        userName = userResult.rows[0].name;
        userRole = userResult.rows[0].role;
      } else {
        const metadataRole = data.user.user_metadata?.role || 'ADMIN';
        if (!userName || userName.trim() === '') {
          userName = data.user.email.split('@')[0] || 'Usuario';
        }

        console.log(`📝 Creando usuario en BD: id=${data.user.id}, email=${data.user.email}, name=${userName}, role=${metadataRole}`);

        try {
          await query(
            `INSERT INTO "User" (id, email, name, role, password) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (id) DO NOTHING`,
            [data.user.id, data.user.email, userName.trim(), metadataRole, 'oauth']
          );
          console.log(`✅ Usuario creado exitosamente en BD: ${data.user.id}`);
        } catch (insertError) {
          if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
            console.log('⚠️ Usuario ya existe (posible race condition), continuando...');
            try {
              const existingUser = await query(
                'SELECT name, role FROM "User" WHERE id = $1',
                [data.user.id]
              );
              if (existingUser.rows.length > 0) {
                userName = existingUser.rows[0].name;
                userRole = existingUser.rows[0].role;
              }
            } catch (lookupError) {
              console.error('❌ Error al buscar usuario existente:', lookupError.message);
            }
          } else {
            throw insertError;
          }
        }

        userRole = metadataRole;

        if (metadataRole === 'ADMIN') {
          try {
            console.log(`🏪 Creando tienda para usuario ADMIN: ${data.user.id}`);
            await storeService.create(data.user.id, {
              name: `${userName}'s Store`,
              logo: null
            });
            console.log(`✅ Tienda creada exitosamente para usuario: ${data.user.id}`);
          } catch (storeError) {
            console.error('❌ Error al crear tienda:', storeError.message);
          }
        }
      }
    } catch (dbError) {
      console.error('❌ Error crítico al obtener/crear datos del usuario:', {
        message: dbError.message,
        code: dbError.code,
        userId: data.user.id,
        email: data.user.email
      });
      throw dbError;
    }

    const userPayload = {
      userId: data.user.id,
      email: data.user.email,
      name: userName,
      role: userRole,
      emailConfirmed: data.user.email_confirmed_at ? true : false
    };

    if (userRole === 'ADMIN') {
      try {
        const storeResult = await query(
          'SELECT id FROM "Store" WHERE "ownerId" = $1 LIMIT 1',
          [data.user.id]
        );
        if (storeResult.rows.length > 0) {
          userPayload.storeId = storeResult.rows[0].id;
        }
      } catch (storeLookupError) {
        console.error('Error obteniendo storeId:', storeLookupError.message);
      }
    }

    // Store in cache for subsequent requests
    setCachedUser(data.user.id, userPayload);
    req.user = userPayload;

    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('❌ Error crítico en authMiddleware:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
      name: error.name
    });
    
    // Si es un error de base de datos relacionado con constraints, proporcionar más información
    if (error.code && (error.code.startsWith('23') || error.code.startsWith('42'))) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Error de base de datos al procesar autenticación',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Error al verificar autenticación',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware para verificar rol específico
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: `Acceso denegado. Roles permitidos: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware opcional - No falla si no hay token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user || !data.user.id || !data.user.email) {
      return next();
    }

    // ── Cache hit: skip all DB queries (shared cache with authMiddleware) ───
    const cached = getCachedUser(data.user.id);
    if (cached) {
      req.user = cached;
      return next();
    }

    // ── Cache miss: resolve user from DB ────────────────────────────────────
    let userRole = 'ADMIN';
    let userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email.split('@')[0] || 'Usuario';

    try {
      const userResult = await query(
        'SELECT name, role FROM "User" WHERE id = $1',
        [data.user.id]
      );

      if (userResult.rows.length > 0) {
        userName = userResult.rows[0].name;
        userRole = userResult.rows[0].role;
      } else {
        const metadataRole = data.user.user_metadata?.role || 'ADMIN';
        if (!userName || userName.trim() === '') {
          userName = data.user.email.split('@')[0] || 'Usuario';
        }

        try {
          await query(
            `INSERT INTO "User" (id, email, name, role, password)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [data.user.id, data.user.email, userName.trim(), metadataRole, 'oauth']
          );
        } catch (insertError) {
          if (insertError.code !== '23505' && !insertError.message.includes('duplicate')) {
            console.error('❌ Error al insertar usuario en optionalAuth:', insertError.message);
          }
        }

        userRole = metadataRole;

        if (metadataRole === 'ADMIN') {
          try {
            await storeService.create(data.user.id, { name: `${userName}'s Store`, logo: null });
          } catch (storeError) {
            console.error('❌ Error al crear tienda en optionalAuth:', storeError.message);
          }
        }
      }
    } catch (dbError) {
      console.error('❌ Error en optionalAuth DB lookup:', dbError.message);
      return next(); // Non-fatal — continue without user context
    }

    const userPayload = {
      userId: data.user.id,
      email: data.user.email,
      name: userName,
      role: userRole,
      emailConfirmed: !!data.user.email_confirmed_at,
    };

    if (userRole === 'ADMIN') {
      try {
        const storeResult = await query(
          'SELECT id FROM "Store" WHERE "ownerId" = $1 LIMIT 1',
          [data.user.id]
        );
        if (storeResult.rows.length > 0) {
          userPayload.storeId = storeResult.rows[0].id;
        }
      } catch (storeLookupError) {
        console.error('Error obteniendo storeId en optionalAuth:', storeLookupError.message);
      }
    }

    // Store in shared cache — subsequent requests use this immediately
    setCachedUser(data.user.id, userPayload);
    req.user = userPayload;

    next();
  } catch (error) {
    // Never block the request — continue without user context
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth
};
