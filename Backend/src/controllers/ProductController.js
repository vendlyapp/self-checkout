const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');
const { assertProductOwner, forbidden, notFound } = require('../utils/ownership');
const { publicProductDto, adminProductDto, catalogProductDto, mapResponse } = require('../dtos');
const SimpleCache = require('../utils/simpleCache');

const adminProductsCache = new SimpleCache(2 * 60 * 1000);
const productStatsCache = new SimpleCache(60 * 1000);

function listCacheKey(ownerId, options) {
  const inactive = options.includeInactive ? '1' : '0';
  const codes = options.includeCodes ? '1' : '0';
  const catalog = options.catalog ? '1' : '0';
  const limit = options.limit ?? 'default';
  const offset = options.offset ?? 0;
  const skip = options.skipCount ? '1' : '0';
  return `products:${ownerId}:i${inactive}:c${codes}:cat${catalog}:s${skip}:o${offset}:l${limit}`;
}

function invalidateOwnerProductCaches(ownerId) {
  if (!ownerId) return;
  adminProductsCache.delByPrefix(`products:${ownerId}:`);
  productStatsCache.del(`productStats:${ownerId}`);
}

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
      if (req.query.catalog === 'true' || req.query.catalog === '1') {
        options.catalog = true;
        options.includeInactive = true;
        options.skipCount = true;
        options.limit = Math.min(parseInt(limit, 10) || 200, 200);
      } else if (req.query.includeInactive === 'true' || req.query.includeInactive === '1') {
        options.includeInactive = true;
        options.limit = Math.min(parseInt(limit, 10) || 100, 100);
        options.skipCount = true;
      } else if (!options.limit) {
        options.limit = 100;
      }

      const cacheKey = listCacheKey(ownerId, options);
      const cached = adminProductsCache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(HTTP_STATUS.OK).json(cached);
      }

      const result = await productService.findAll(options);
      const withCodes = options.includeCodes ? { includeCodes: true } : {};
      const toDto = options.catalog
        ? catalogProductDto
        : (p) => adminProductDto({ ...p, ...withCodes });
      const payload = mapResponse(toDto, result);
      adminProductsCache.set(cacheKey, payload);
      res.setHeader('X-Cache', 'MISS');
      res.status(HTTP_STATUS.OK).json(payload);
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
      res.status(HTTP_STATUS.OK).json({
        ...result,
        data: adminProductDto(result.data),
      });
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
      invalidateOwnerProductCaches(ownerId);
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
      const existing = await productService.findById(id);
      if (!existing.success || !existing.data) {
        return notFound(res, 'Product not found');
      }
      if (!assertProductOwner(req.user, existing.data.ownerId)) {
        return forbidden(res);
      }
      const result = await productService.update(id, req.body);
      invalidateOwnerProductCaches(existing.data.ownerId);
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
      const existing = await productService.findById(id);
      if (!existing.success || !existing.data) {
        return notFound(res, 'Product not found');
      }
      if (!assertProductOwner(req.user, existing.data.ownerId)) {
        return forbidden(res);
      }
      const { stock } = req.body;
      const result = await productService.updateStock(id, stock);
      invalidateOwnerProductCaches(existing.data.ownerId);
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
      const existing = await productService.findById(id);
      if (!existing.success || !existing.data) {
        return notFound(res, 'Product not found');
      }
      if (!assertProductOwner(req.user, existing.data.ownerId)) {
        return forbidden(res);
      }
      const result = await productService.delete(id);
      invalidateOwnerProductCaches(existing.data.ownerId);
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
      const cacheKey = `productStats:${ownerId || 'all'}`;
      const cached = productStatsCache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(HTTP_STATUS.OK).json(cached);
      }
      const result = await productService.getStats(ownerId);
      productStatsCache.set(cacheKey, result);
      res.setHeader('X-Cache', 'MISS');
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

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: publicProductDto(result.data),
        store: result.data?.store ? {
          slug: result.data.store.slug,
          name: result.data.store.name,
          logo: result.data.store.logo,
        } : undefined,
      });
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Get public products for a store (cached, no auth required).
   * @route GET /api/products/public/:ownerId
   */
  async getPublicProducts(req, res) {
    try {
      const { ownerId } = req.params;
      const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
      const result = await productService.findByOwnerPublic(ownerId, limit);
      res.status(HTTP_STATUS.OK).json(mapResponse(publicProductDto, result));
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }
}

module.exports = new ProductController();
