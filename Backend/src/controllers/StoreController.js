const storeService = require('../services/StoreService');
const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de tiendas
 * Maneja todas las operaciones relacionadas con tiendas de usuarios
 * @class StoreController
 */
class StoreController {
  /**
   * Obtiene la tienda del usuario autenticado
   * Retorna información completa de la tienda incluyendo configuración y estadísticas
   * @route GET /api/store/my-store
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado (inyectado por middleware)
   * @param {string} req.user.userId - ID del usuario autenticado
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos de la tienda
   * @throws {401} Si el usuario no está autenticado
   * @throws {404} Si la tienda no existe
   * @throws {500} Si hay error en el servidor
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
   * Obtiene una tienda por su slug (endpoint público)
   * Permite a los clientes acceder a la tienda sin autenticación
   * @route GET /api/store/:slug
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.slug - Slug único de la tienda
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos públicos de la tienda
   * @throws {404} Si la tienda no existe
   * @throws {500} Si hay error en el servidor
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
   * Obtiene todos los productos de una tienda por su slug (endpoint público)
   * Retorna hasta 100 productos del dueño de la tienda
   * @route GET /api/store/:slug/products
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.slug - Slug único de la tienda
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de productos de la tienda
   * @throws {404} Si la tienda no existe
   * @throws {500} Si hay error en el servidor
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
   * Actualiza la tienda del usuario autenticado
   * Permite modificar configuración, nombre, descripción, etc.
   * @route PUT /api/store/my-store
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado (inyectado por middleware)
   * @param {string} req.user.userId - ID del usuario autenticado
   * @param {Object} req.body - Datos a actualizar
   * @param {string} [req.body.name] - Nombre de la tienda
   * @param {string} [req.body.description] - Descripción de la tienda
   * @param {string} [req.body.slug] - Slug de la tienda
   * @param {string} [req.body.logo] - URL del logo
   * @param {boolean} [req.body.isOpen] - Estado de apertura de la tienda
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la tienda actualizada
   * @throws {401} Si el usuario no está autenticado
   * @throws {500} Si hay error en el servidor
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
      const isValidationError = error.message?.includes('vergeben') || error.message?.includes('Tienda no encontrada') || error.message?.includes('campos');
      const status = isValidationError ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza el estado de apertura de la tienda
   * Permite abrir o cerrar la tienda para recibir pedidos
   * @route PATCH /api/store/my-store/status
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado (inyectado por middleware)
   * @param {string} req.user.userId - ID del usuario autenticado
   * @param {Object} req.body - Datos a actualizar
   * @param {boolean} req.body.isOpen - Estado de apertura (true = abierta, false = cerrada)
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la tienda actualizada
   * @throws {401} Si el usuario no está autenticado
   * @throws {400} Si el campo isOpen no es válido
   * @throws {500} Si hay error en el servidor
   */
  async updateStoreStatus(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const { isOpen } = req.body;

      if (typeof isOpen !== 'boolean') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El campo isOpen debe ser un boolean (true/false)'
        });
      }

      const result = await storeService.updateStoreStatus(ownerId, isOpen);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Marca el onboarding como completado para la tienda del usuario
   * @route PATCH /api/store/my-store/onboarding-complete
   */
  async completeOnboarding(req, res) {
    try {
      const ownerId = req.user?.userId;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }
      const result = await storeService.completeOnboarding(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Regenera el código QR de la tienda del usuario autenticado
   * Útil cuando se necesita actualizar el QR code con la URL correcta
   * @route POST /api/store/my-store/regenerate-qr
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado (inyectado por middleware)
   * @param {string} req.user.userId - ID del usuario autenticado
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la tienda actualizada incluyendo el nuevo QR code
   * @throws {401} Si el usuario no está autenticado
   * @throws {404} Si la tienda no existe
   * @throws {500} Si hay error en el servidor
   */
  async regenerateQRCode(req, res) {
    try {
      const ownerId = req.user?.userId;

      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await storeService.regenerateQRCode(ownerId);
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

