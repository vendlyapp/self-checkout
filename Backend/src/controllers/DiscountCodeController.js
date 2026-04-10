const discountCodeService = require('../services/DiscountCodeService');
const { HTTP_STATUS } = require('../types');

/**
 * Discount code controller.
 * Handles CRUD and validation for promotional discount codes.
 */
class DiscountCodeController {
  /** @route GET /api/discount-codes */
  async getAllDiscountCodes(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.findAll(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  }

  /** @route GET /api/discount-codes/:id */
  async getDiscountCodeById(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.findById(id, ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route GET /api/discount-codes/validate/:code */
  async validateDiscountCode(req, res) {
    try {
      const { code } = req.params;
      const { storeId } = req.query;

      if (!code || !code.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Code is required',
        });
      }

      const result = await discountCodeService.findByCode(code, storeId || null);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route POST /api/discount-codes */
  async createDiscountCode(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.create(req.body, ownerId);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route PUT /api/discount-codes/:id */
  async updateDiscountCode(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.update(id, req.body, ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route DELETE /api/discount-codes/:id */
  async deleteDiscountCode(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.archive(id, ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /** @route GET /api/discount-codes/archived */
  async getArchivedDiscountCodes(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.findArchived(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  }

  /** @route GET /api/discount-codes/stats */
  async getStats(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await discountCodeService.getStats(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
  }
}

module.exports = new DiscountCodeController();
