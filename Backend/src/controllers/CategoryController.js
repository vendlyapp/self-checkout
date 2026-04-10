const categoryService = require('../services/CategoryService');
const { HTTP_STATUS } = require('../types');

/**
 * Category controller.
 * Handles CRUD operations for product categories.
 */
class CategoryController {
  /**
   * List all categories.
   * @route GET /api/categories
   */
  async getAllCategories(req, res) {
    try {
      const storeId = req.user?.storeId || req.query.storeId || null;
      const result = await categoryService.findAll(storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get a category by ID.
   * @route GET /api/categories/:id
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId || null;
      const result = await categoryService.findById(id, storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Create a new category.
   * @route POST /api/categories
   */
  async createCategory(req, res) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Only store owners can create categories',
        });
      }
      const result = await categoryService.create(storeId, req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Update a category.
   * @route PUT /api/categories/:id
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId || null;
      const result = await categoryService.update(id, req.body, storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Delete a category.
   * @route DELETE /api/categories/:id
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const storeId = req.user?.storeId || null;
      const moveProductsToCategoryId = req.body?.moveProductsToCategoryId || null;
      const result = await categoryService.delete(id, storeId, { moveProductsToCategoryId });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ success: false, error: error.message });
    }
  }

  /**
   * Recalculate product counts per category.
   * @route POST /api/categories/update-counts
   */
  async updateCounts(req, res) {
    try {
      const storeId = req.user?.storeId || null;
      const result = await categoryService.updateCounts(storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get category statistics.
   * @route GET /api/categories/stats
   */
  async getStats(req, res) {
    try {
      const storeId = req.user?.storeId || null;
      const result = await categoryService.getStats(storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new CategoryController();
