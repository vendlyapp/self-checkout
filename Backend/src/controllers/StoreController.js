const storeService = require('../services/StoreService');
const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');
const SimpleCache = require('../utils/simpleCache');

// Cache slug→products — separado del cache ownerId para hit directo sin lookup de store
const slugProductsCache = new SimpleCache(10 * 60 * 1000);

/**
 * Store controller.
 * Handles store CRUD, status updates, and public storefront endpoints.
 */
class StoreController {
  /**
   * Get the authenticated user's store.
   * @route GET /api/store/my-store
   */
  async getMyStore(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const store = await storeService.getByOwnerId(ownerId);

      if (!store) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Store not found',
        });
      }

      res.status(HTTP_STATUS.OK).json({ success: true, data: store });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get a store by its public slug. Public endpoint.
   * @route GET /api/store/:slug
   */
  async getStoreBySlug(req, res) {
    try {
      const { slug } = req.params;
      const store = await storeService.getBySlug(slug);

      if (!store) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Store not found',
        });
      }

      res.status(HTTP_STATUS.OK).json({ success: true, data: store });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get all products for a store by slug. Public endpoint.
   * @route GET /api/store/:slug/products
   */
  async getStoreProducts(req, res) {
    try {
      const { slug } = req.params;

      // L1: slug-level cache — avoids store lookup + product query entirely
      const cachedBySlug = slugProductsCache.get(slug);
      if (cachedBySlug) {
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
        res.setHeader('X-Cache', 'HIT');
        return res.status(HTTP_STATUS.OK).json(cachedBySlug);
      }

      // L2: store lookup (cached in StoreService)
      const store = await storeService.getBySlug(slug);
      if (!store) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Store not found' });
      }

      // L3: product query (cached by ownerId in ProductService)
      const result = await productService.findByOwnerPublic(store.ownerId, 100);

      slugProductsCache.set(slug, result);

      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
      res.setHeader('X-Cache', 'MISS');
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Update the authenticated user's store.
   * @route PUT /api/store/my-store
   */
  async updateMyStore(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await storeService.update(ownerId, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Toggle store open/closed status.
   * @route PATCH /api/store/my-store/status
   */
  async updateStoreStatus(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const { isOpen } = req.body;

      if (typeof isOpen !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'isOpen must be a boolean (true/false)',
        });
      }

      const result = await storeService.updateStoreStatus(ownerId, isOpen);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Mark onboarding as completed for the user's store.
   * @route PATCH /api/store/my-store/onboarding-complete
   */
  async completeOnboarding(req, res) {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }
      const result = await storeService.completeOnboarding(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Regenerate the store QR code.
   * @route POST /api/store/my-store/regenerate-qr
   */
  async regenerateQRCode(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await storeService.regenerateQRCode(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new StoreController();
