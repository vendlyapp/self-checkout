const authService = require('../services/AuthService');
const { HTTP_STATUS } = require('../types');

class AuthController {
  /**
   * Registrar nuevo usuario con Supabase Auth
   * POST /api/auth/register
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
   * Login con Supabase Auth
   * POST /api/auth/login
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
   * Verificar token de Supabase
   * GET /api/auth/verify
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
   * Obtener perfil del usuario autenticado
   * GET /api/auth/profile
   */
  async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.user.userId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
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
   * Cambiar contraseña con Supabase Auth
   * PUT /api/auth/change-password
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
   * Logout con Supabase Auth
   * POST /api/auth/logout
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
   * Solicitar reseteo de contraseña
   * POST /api/auth/forgot-password
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
