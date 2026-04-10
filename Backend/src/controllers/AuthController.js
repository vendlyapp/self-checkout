const authService = require('../services/AuthService');
const { HTTP_STATUS } = require('../types');

/**
 * Authentication controller.
 * Handles registration, login, token verification, password management.
 */
class AuthController {
  /**
   * Register a new user via Supabase Auth.
   * @route POST /api/auth/register
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Authenticate an existing user.
   * @route POST /api/auth/login
   */
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Verify a Supabase Auth token.
   * @route GET /api/auth/verify
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const result = await authService.verifyToken(token);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Get the authenticated user's profile.
   * @route GET /api/auth/profile
   */
  async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.user.userId);

      if (req.user?.storeId && result.data?.user) {
        result.data.user.storeId = req.user.storeId;
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Change the authenticated user's password.
   * @route PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const { newPassword } = req.body;
      const result = await authService.changePassword(token, newPassword);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Logout the current user.
   * @route POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const result = await authService.logout(token);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Request a password reset email.
   * @route POST /api/auth/forgot-password
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Email is required',
        });
      }

      const result = await authService.requestPasswordReset(email);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AuthController();
