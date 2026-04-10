const superAdminService = require('../services/SuperAdminService');
const globalPaymentMethodConfigService = require('../services/GlobalPaymentMethodConfigService');
const { HTTP_STATUS } = require('../types');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Super Admin Controller
 * Handles all super admin operations
 */
class SuperAdminController {
  handleError(res, error, fallbackMessage = 'Internal server error') {
    logger.error('[SuperAdminController] Request failed', { error: error.message });
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        ...(error.code && { code: error.code }),
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: fallbackMessage,
    });
  }
  /**
   * Get platform statistics
   * @route GET /api/super-admin/stats
   */
  async getPlatformStats(req, res) {
    try {
      const result = await superAdminService.getPlatformStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
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
      return this.handleError(res, error);
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
      return this.handleError(res, error);
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
      return this.handleError(res, error);
    }
  }

  /**
   * Update store information
   * @route PUT /api/super-admin/stores/:id
   */
  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const result = await superAdminService.updateStore(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
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
        throw new AppError('isActive must be a boolean', 400, 'VALIDATION_ERROR');
      }

      const result = await superAdminService.toggleStoreStatus(id, isActive);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
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
      return this.handleError(res, error);
    }
  }

  /**
   * Get store analytics
   * @route GET /api/super-admin/stores/:id/analytics
   */
  async getStoreAnalytics(req, res) {
    try {
      const { id } = req.params;
      const { period = 'month' } = req.query;
      const result = await superAdminService.getStoreAnalytics(id, { period });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Get store orders
   * @route GET /api/super-admin/stores/:id/orders
   */
  async getStoreOrders(req, res) {
    try {
      const { id } = req.params;
      const { limit, offset } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (offset) options.offset = parseInt(offset);

      const result = await superAdminService.getStoreOrders(id, options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Regenerate QR code for a store
   * @route POST /api/super-admin/stores/:id/regenerate-qr
   */
  async regenerateQRCode(req, res) {
    try {
      const { id } = req.params;
      const result = await superAdminService.regenerateQRCode(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Get global payment method configurations
   * @route GET /api/super-admin/payment-methods/global-config
   */
  async getGlobalPaymentMethodConfigs(req, res) {
    try {
      const result = await globalPaymentMethodConfigService.findAll();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  /**
   * Update global payment method configuration
   * @route PUT /api/super-admin/payment-methods/global-config
   */
  async updateGlobalPaymentMethodConfig(req, res) {
    try {
      const { code, disabledGlobally, reason } = req.body;

      if (!code) {
        throw new AppError('Payment method code is required', 400, 'VALIDATION_ERROR');
      }

      if (typeof disabledGlobally !== 'boolean') {
        throw new AppError('disabledGlobally must be a boolean', 400, 'VALIDATION_ERROR');
      }

      const result = await globalPaymentMethodConfigService.upsert({
        code,
        disabledGlobally,
        reason
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

module.exports = new SuperAdminController();
