const userService = require('../services/UserService');
const { HTTP_STATUS } = require('../types');

/**
 * User controller.
 * Handles user CRUD operations (primarily for SUPER_ADMIN).
 */
class UserController {
  /** @route GET /api/users */
  async getAllUsers(req, res) {
    try {
      const { limit } = req.query;
      const options = limit ? { limit: parseInt(limit) } : {};
      const result = await userService.findAll(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  }

  /** @route GET /api/users/:id */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.findById(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route POST /api/users */
  async createUser(req, res) {
    try {
      const result = await userService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route POST /api/users/admin */
  async createAdmin(req, res) {
    try {
      const result = await userService.createAdmin(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route PUT /api/users/:id */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.update(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route DELETE /api/users/:id */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const result = await userService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route GET /api/users/stats */
  async getStats(req, res) {
    try {
      const result = await userService.getStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  }
}

module.exports = new UserController();
