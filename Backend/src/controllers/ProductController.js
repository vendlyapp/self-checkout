const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');

/**
 * Product controller.
 * Handles all CRUD operations for products.
 */
class ProductController {
  /**
   * List all products for the authenticated user.
   * @route GET /api/products
   */
  async getAllProducts(req, res) {
    try {
      const { limit, search } = req.query;
      const ownerId = req.user?.userId;
      const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

      if (search) {
        const searchLimit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
        const result = await productService.search(search, {
          ownerId,
          limit: searchLimit,
          offset,
        });
        return res.status(HTTP_STATUS.OK).json(result);
      }

      const options = { ownerId, offset };
      const includeCodes = req.query.includeCodes === 'true' || req.query.includeCodes === '1';
      if (includeCodes) {
        options.includeCodes = true;
        options.limit = Math.min(parseInt(limit, 10) || 100, 100);
      } else if (limit) {
        options.limit = Math.min(parseInt(limit, 10) || 100, 500);
      }
      if (req.query.includeInactive === 'true' || req.query.includeInactive === '1') {
        options.includeInactive = true;
      }

      const result = await productService.findAll(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Get a product by ID.
   * @route GET /api/products/:id
   */
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.findById(id);
      const product = result.data;
      const user = req.user;
      if (user.role !== 'SUPER_ADMIN' && product.ownerId !== user.userId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Product not found',
        });
      }
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * List available products (public, for customers).
   * @route GET /api/products/available
   */
  async getAvailableProducts(req, res) {
    try {
      const { limit, search } = req.query;
      const options = {};
      if (limit) options.limit = Math.min(parseInt(limit) || 100, 500);
      if (search) options.search = search;

      const result = await productService.findAvailable(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create a new product.
   * @route POST /api/products
   */
  async createProduct(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const result = await productService.create(req.body, ownerId);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Update an existing product.
   * @route PUT /api/products/:id
   */
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.update(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Update product stock only.
   * @route PATCH /api/products/:id/stock
   */
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const result = await productService.updateStock(id, stock);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete a product.
   * @route DELETE /api/products/:id
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Get product statistics (total, low stock, out of stock, etc.).
   * @route GET /api/products/stats
   */
  async getStats(req, res) {
    try {
      const ownerId = req.user?.userId ?? req.user?.id ?? null;
      const result = await productService.getStats(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      // Return 200 with zero stats so the dashboard doesn't break
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { total: 0, available: 0, lowStock: 0, outOfStock: 0, unavailable: 0 },
      });
    }
  }

  /**
   * Get a product by QR code (product UUID). Public endpoint.
   * @route GET /api/products/qr/:qrCode
   */
  async getProductByQR(req, res) {
    try {
      const { qrCode } = req.params;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(qrCode)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Invalid QR code',
        });
      }

      const result = await productService.findByIdWithStore(qrCode);

      if (result.data.stock <= 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Product not available',
        });
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ProductController();
