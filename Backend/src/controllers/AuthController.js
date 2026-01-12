const authService = require('../services/AuthService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de autenticación
 * Maneja todas las operaciones de autenticación y gestión de sesiones usando Supabase Auth
 * @class AuthController
 */
class AuthController {
  /**
   * Registra un nuevo usuario en el sistema usando Supabase Auth
   * Crea un usuario en Supabase Auth y en la base de datos local
   * @route POST /api/auth/register
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos del registro
   * @param {string} req.body.email - Email del usuario
   * @param {string} req.body.password - Contraseña (mínimo 6 caracteres)
   * @param {string} req.body.name - Nombre completo del usuario
   * @param {string} [req.body.role='customer'] - Rol del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con datos del usuario y token de acceso
   * @throws {400} Si el email ya está registrado o los datos son inválidos
   * @throws {500} Si hay error en el servidor
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = 
        error.message.includes('ya está registrado') ||
        error.message.includes('inválido') ||
        error.message.includes('requeridos') ||
        error.message.includes('al menos') ||
        error.message.includes('User already registered')
          ? HTTP_STATUS.BAD_REQUEST
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Autentica un usuario existente usando Supabase Auth
   * Valida credenciales y retorna token de sesión
   * @route POST /api/auth/login
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Credenciales de login
   * @param {string} req.body.email - Email del usuario
   * @param {string} req.body.password - Contraseña del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con datos del usuario y token de acceso
   * @throws {401} Si las credenciales son inválidas
   * @throws {500} Si hay error en el servidor
   */
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = 
        error.message.includes('Credenciales inválidas') ||
        error.message.includes('Invalid login credentials') ||
        error.message.includes('requeridos')
          ? HTTP_STATUS.UNAUTHORIZED
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Verifica la validez de un token de Supabase Auth
   * Valida el token JWT y retorna información del usuario
   * @route GET /api/auth/verify
   * @param {Object} req - Request object de Express
   * @param {Object} req.headers - Headers HTTP
   * @param {string} req.headers.authorization - Bearer token (formato: "Bearer <token>")
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la validez del token con datos del usuario
   * @throws {401} Si el token es inválido, expirado o no se proporciona
   * @throws {500} Si hay error en el servidor
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const result = await authService.verifyToken(token);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = 
        error.message.includes('Token') ||
        error.message.includes('no proporcionado') ||
        error.message.includes('inválido') ||
        error.message.includes('expirado')
          ? HTTP_STATUS.UNAUTHORIZED
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene el perfil completo del usuario autenticado
   * Requiere autenticación mediante middleware
   * @route GET /api/auth/profile
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado (inyectado por middleware)
   * @param {string} req.user.userId - ID del usuario autenticado
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el perfil del usuario
   * @throws {404} Si el usuario no existe
   * @throws {500} Si hay error en el servidor
   */
  async getProfile(req, res) {
    try {
      console.log(`📋 Obteniendo perfil para usuario: ${req.user?.userId}`);
      const result = await authService.getProfile(req.user.userId);
      
      // Agregar storeId si está disponible en req.user
      if (req.user?.storeId && result.data?.user) {
        result.data.user.storeId = req.user.storeId;
      }
      
      console.log(`✅ Perfil obtenido exitosamente para: ${req.user?.userId}`);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('❌ Error en getProfile:', {
        message: error.message,
        code: error.code,
        userId: req.user?.userId,
        stack: error.stack
      });
      
      const statusCode = 
        error.message.includes('no encontrado')
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * Actualiza la contraseña en Supabase Auth
   * @route PUT /api/auth/change-password
   * @param {Object} req - Request object de Express
   * @param {Object} req.headers - Headers HTTP
   * @param {string} req.headers.authorization - Bearer token
   * @param {Object} req.body - Datos de cambio de contraseña
   * @param {string} req.body.newPassword - Nueva contraseña (mínimo 6 caracteres)
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando el cambio de contraseña
   * @throws {400} Si la contraseña es inválida o muy corta
   * @throws {404} Si el usuario no existe
   * @throws {500} Si hay error en el servidor
   */
  async changePassword(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { newPassword } = req.body;
      
      const result = await authService.changePassword(token, newPassword);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = 
        error.message.includes('incorrecta') ||
        error.message.includes('requeridas') ||
        error.message.includes('al menos')
          ? HTTP_STATUS.BAD_REQUEST
          : error.message.includes('no encontrado')
            ? HTTP_STATUS.NOT_FOUND
            : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * Invalida el token de Supabase Auth
   * @route POST /api/auth/logout
   * @param {Object} req - Request object de Express
   * @param {Object} req.headers - Headers HTTP
   * @param {string} req.headers.authorization - Bearer token
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando el cierre de sesión
   * @throws {500} Si hay error en el servidor
   */
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const result = await authService.logout(token);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Solicita un enlace de reseteo de contraseña
   * Envía un email con enlace para resetear la contraseña usando Supabase Auth
   * @route POST /api/auth/forgot-password
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos de solicitud
   * @param {string} req.body.email - Email del usuario que solicita el reset
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando el envío del email
   * @throws {400} Si el email no se proporciona
   * @throws {500} Si hay error en el servidor
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Email es requerido'
        });
      }

      const result = await authService.requestPasswordReset(email);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
