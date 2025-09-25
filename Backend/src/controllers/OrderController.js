const orderService = require('../services/OrderService');
const { HTTP_STATUS } = require('../types');

class OrderController {
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

  // Endpoint para admin - todas las órdenes
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

  // Método para crear orden simplificado
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
