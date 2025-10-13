const { supabase } = require('../../lib/supabase');
const { query } = require('../../lib/database');
const { HTTP_STATUS } = require('../types');

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

    // Verificar el token con Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    // Obtener información adicional del usuario desde la base de datos
    let userRole = 'CUSTOMER';
    let userName = data.user.email;

    try {
      const userResult = await query(
        'SELECT name, role FROM "User" WHERE id = $1',
        [data.user.id]
      );

      if (userResult.rows.length > 0) {
        userName = userResult.rows[0].name;
        userRole = userResult.rows[0].role;
      }
    } catch (dbError) {
      console.error('Error al obtener datos del usuario:', dbError.message);
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
      
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data.user) {
        // Obtener información adicional
        let userRole = 'CUSTOMER';
        let userName = data.user.email;

        try {
          const userResult = await query(
            'SELECT name, role FROM "User" WHERE id = $1',
            [data.user.id]
          );

          if (userResult.rows.length > 0) {
            userName = userResult.rows[0].name;
            userRole = userResult.rows[0].role;
          }
        } catch (dbError) {
          console.error('Error al obtener datos del usuario:', dbError.message);
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
