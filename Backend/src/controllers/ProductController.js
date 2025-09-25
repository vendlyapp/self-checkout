const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const { limit, search } = req.query;

      if (search) {
        const result = await productService.search(search);
        return res.status(HTTP_STATUS.OK).json(result);
      }

      const options = limit ? { limit: parseInt(limit) } : {};
      const result = await productService.findAll(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('término de búsqueda')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.findById(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  // Endpoint para clientes - solo productos disponibles
  async getAvailableProducts(req, res) {
    try {
      const { limit, search } = req.query;
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (search) options.search = search;

      const result = await productService.findAvailable(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  async createProduct(req, res) {
    try {
      const result = await productService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('ya está en uso')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.update(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const result = await productService.updateStock(id, stock);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : error.message.includes('debe ser un número')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await productService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const result = await productService.getStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();
