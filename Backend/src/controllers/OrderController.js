const orderService = require('../services/OrderService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de órdenes
 * Maneja todas las operaciones relacionadas con órdenes de compra
 * @class OrderController
 */
class OrderController {
  /**
   * Obtiene todas las órdenes de un usuario específico
   * @route GET /api/orders/user/:userId
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.userId - ID del usuario
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de órdenes a retornar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de órdenes del usuario
   * @throws {500} Si hay error en el servidor
   */
  async getOrdersByUserId(req, res) {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const options = {};
      if (limit) options.limit = parseInt(limit);

      const result = await orderService.findByUserId(userId, options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todas las órdenes del sistema (admin)
   * Endpoint solo para administradores
   * @route GET /api/orders
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de órdenes a retornar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de todas las órdenes
   * @throws {500} Si hay error en el servidor
   */
  async getAllOrders(req, res) {
    try {
      const { limit } = req.query;
      const options = {};
      if (limit) options.limit = parseInt(limit);

      const result = await orderService.findAll(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene una orden específica por su ID
   * @route GET /api/orders/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la orden
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos de la orden
   * @throws {404} Si la orden no existe
   * @throws {500} Si hay error en el servidor
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const result = await orderService.findById(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrada')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva orden para un usuario específico
   * Valida stock y actualiza inventario
   * @route POST /api/orders/:userId
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.userId - ID del usuario
   * @param {Object} req.body - Datos de la orden
   * @param {Array} req.body.items - Items de la orden
   * @param {string} req.body.items[].productId - ID del producto
   * @param {number} req.body.items[].quantity - Cantidad del producto
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la orden creada
   * @throws {400} Si hay stock insuficiente o producto no encontrado
   * @throws {500} Si hay error en el servidor
   */
  async createOrder(req, res) {
    try {
      const { userId } = req.params;
      const result = await orderService.create(userId, req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ||
                        error.message.includes('Stock insuficiente')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva orden (método simplificado)
   * Recibe userId e items en el body en lugar de params
   * @route POST /api/orders
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos de la orden
   * @param {string} req.body.userId - ID del usuario
   * @param {Array} req.body.items - Items de la orden
   * @param {string} req.body.items[].productId - ID del producto
   * @param {number} req.body.items[].quantity - Cantidad del producto
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la orden creada
   * @throws {400} Si faltan userId o items, o hay stock insuficiente
   * @throws {500} Si hay error en el servidor
   */
  async createOrderSimple(req, res) {
    try {
      const { userId, items } = req.body;

      if (!userId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'userId e items son requeridos'
        });
      }

      const result = await orderService.create(userId, { items });
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ||
                        error.message.includes('Stock insuficiente')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de órdenes
   * Retorna totales de ventas, número de órdenes, etc.
   * @route GET /api/orders/stats
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con estadísticas de órdenes
   * @throws {500} Si hay error en el servidor
   */
  async getOrderStats(req, res) {
    try {
      const result = await orderService.getStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene las órdenes más recientes
   * @route GET /api/orders/recent
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit=10] - Número de órdenes a retornar (default: 10)
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con las órdenes recientes
   * @throws {500} Si hay error en el servidor
   */
  async getRecentOrders(req, res) {
    try {
      const { limit } = req.query;
      const result = await orderService.getRecentOrders(parseInt(limit) || 10);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new OrderController();
