const superAdminService = require('../services/SuperAdminService');
const { HTTP_STATUS } = require('../types');

/**
 * Super Admin Controller
 * Handles all super admin operations
 */
class SuperAdminController {
  /**
   * Get platform statistics
   * @route GET /api/super-admin/stats
   */
  async getPlatformStats(req, res) {
    try {
      const result = await superAdminService.getPlatformStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all stores
   * @route GET /api/super-admin/stores
   */
  async getAllStores(req, res) {
    try {
      const { limit, offset, search } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (search) options.search = search;

      const result = await superAdminService.getAllStores(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all users
   * @route GET /api/super-admin/users
   */
  async getAllUsers(req, res) {
    try {
      const { limit, offset, role } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (role) options.role = role;

      const result = await superAdminService.getAllUsers(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get store details
   * @route GET /api/super-admin/stores/:id
   */
  async getStoreDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await superAdminService.getStoreDetails(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Toggle store status
   * @route PUT /api/super-admin/stores/:id/status
   */
  async toggleStoreStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'isActive must be a boolean (true/false)'
        });
      }

      const result = await superAdminService.toggleStoreStatus(id, isActive);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all products grouped by store
   * @route GET /api/super-admin/products
   */
  async getAllProducts(req, res) {
    try {
      const { limit, offset, search, storeId } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);
      if (search) options.search = search;
      if (storeId) options.storeId = storeId;

      const result = await superAdminService.getAllProducts(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new SuperAdminController();
