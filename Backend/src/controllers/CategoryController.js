const categoryService = require('../services/CategoryService');
const { HTTP_STATUS } = require('../types');

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const result = await categoryService.findAll();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.findById(id);
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

  async createCategory(req, res) {
    try {
      const result = await categoryService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('ya existe')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.update(id, req.body);
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

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await categoryService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrada')
        ? HTTP_STATUS.NOT_FOUND
        : error.message.includes('productos asociados')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCounts(req, res) {
    try {
      const result = await categoryService.updateCounts();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  async getStats(req, res) {
    try {
      const result = await categoryService.getStats();
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CategoryController();
