const storeService = require('../services/StoreService');
const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');

class StoreController {
  /**
   * Obtener tienda del usuario autenticado
   * GET /api/store/my-store
   */
  async getMyStore(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const store = await storeService.getByOwnerId(ownerId);

      if (!store) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tienda no encontrada'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: store
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener tienda por slug (pública)
   * GET /api/store/:slug
   */
  async getStoreBySlug(req, res) {
    try {
      const { slug } = req.params;

      const store = await storeService.getBySlug(slug);

      if (!store) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tienda no encontrada'
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: store
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtener productos de una tienda por slug (pública)
   * GET /api/store/:slug/products
   */
  async getStoreProducts(req, res) {
    try {
      const { slug } = req.params;

      // Primero obtener la tienda
      const store = await storeService.getBySlug(slug);

      if (!store) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tienda no encontrada'
        });
      }

      // Obtener productos del dueño de la tienda
      const result = await productService.findAll({
        ownerId: store.ownerId,
        limit: 100
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualizar tienda
   * PUT /api/store/my-store
   */
  async updateMyStore(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await storeService.update(ownerId, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new StoreController();

