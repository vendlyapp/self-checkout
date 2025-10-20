const { createClient } = require('@supabase/supabase-js');
const { query } = require('../../lib/database');
const { HTTP_STATUS } = require('../types');
const storeService = require('../services/StoreService');

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

    // Obtener información adicional del usuario desde la base de datos
    let userRole = 'ADMIN'; // Por defecto ADMIN para nuevos usuarios
    let userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuario';

    try {
      const userResult = await query(
        'SELECT name, role FROM "User" WHERE id = $1',
        [data.user.id]
      );

      if (userResult.rows.length > 0) {
        // Usuario existe, usar sus datos
        userName = userResult.rows[0].name;
        userRole = userResult.rows[0].role;
      } else {
        // Usuario NO existe (probablemente autenticado con Google)
        // Crear automáticamente en la tabla User
        console.log('🆕 Creando usuario automáticamente:', data.user.email);
        
        // Obtener role del user_metadata si existe
        const metadataRole = data.user.user_metadata?.role || 'ADMIN';
        
        await query(
          `INSERT INTO "User" (id, email, name, role, password) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT (id) DO NOTHING`,
          [data.user.id, data.user.email, userName, metadataRole, 'oauth']
        );

        userRole = metadataRole;

        // Si es ADMIN, crear tienda automáticamente
        if (metadataRole === 'ADMIN') {
          try {
            await storeService.create(data.user.id, {
              name: `${userName}'s Store`,
              logo: null
            });
            console.log('🏪 Tienda creada automáticamente para:', userName);
          } catch (storeError) {
            console.error('Error al crear tienda:', storeError.message);
          }
        }
      }
    } catch (dbError) {
      console.error('Error al obtener/crear datos del usuario:', dbError.message);
    }

    // Agregar información del usuario al request
    req.user = {
      userId: data.user.id,
      email: data.user.email,
      name: userName,
      role: userRole,
      emailConfirmed: data.user.email_confirmed_at ? true : false
    };

    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Error al verificar autenticación'
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

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      const { data, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && data.user) {
        // Obtener información adicional
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
            // Crear usuario si no existe (igual que en authMiddleware)
            const metadataRole = data.user.user_metadata?.role || 'ADMIN';
            
            await query(
              `INSERT INTO "User" (id, email, name, role, password) 
               VALUES ($1, $2, $3, $4, $5) 
               ON CONFLICT (id) DO NOTHING`,
              [data.user.id, data.user.email, userName, metadataRole, 'oauth']
            );

            userRole = metadataRole;

            if (metadataRole === 'ADMIN') {
              try {
                await storeService.create(data.user.id, {
                  name: `${userName}'s Store`,
                  logo: null
                });
              } catch (storeError) {
                console.error('Error al crear tienda:', storeError.message);
              }
            }
          }
        } catch (dbError) {
          console.error('Error al obtener/crear datos del usuario:', dbError.message);
        }

        req.user = {
          userId: data.user.id,
          email: data.user.email,
          name: userName,
          role: userRole,
          emailConfirmed: data.user.email_confirmed_at ? true : false
        };
      }
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuamos sin usuario
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  optionalAuth
};
