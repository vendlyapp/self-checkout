const categoryService = require('../services/CategoryService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de categorías
 * Maneja todas las operaciones CRUD relacionadas con categorías de productos
 * @class CategoryController
 */
class CategoryController {
  /**
   * Obtiene todas las categorías disponibles
   * @route GET /api/categories
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de categorías
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Obtiene una categoría específica por su ID
   * @route GET /api/categories/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la categoría
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos de la categoría
   * @throws {404} Si la categoría no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Crea una nueva categoría
   * @route POST /api/categories
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos de la categoría a crear
   * @param {string} req.body.name - Nombre de la categoría
   * @param {string} [req.body.description] - Descripción de la categoría
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la categoría creada
   * @throws {400} Si la categoría ya existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Actualiza una categoría existente
   * @route PUT /api/categories/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la categoría
   * @param {Object} req.body - Datos a actualizar
   * @param {string} [req.body.name] - Nombre de la categoría
   * @param {string} [req.body.description] - Descripción de la categoría
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la categoría actualizada
   * @throws {404} Si la categoría no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Elimina una categoría
   * No permite eliminar categorías con productos asociados
   * @route DELETE /api/categories/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la categoría a eliminar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la eliminación
   * @throws {400} Si la categoría tiene productos asociados
   * @throws {404} Si la categoría no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Actualiza los contadores de productos en todas las categorías
   * Recalcula el número de productos en cada categoría
   * @route POST /api/categories/update-counts
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la actualización
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Obtiene estadísticas de categorías
   * Retorna conteo total de categorías y productos por categoría
   * @route GET /api/categories/stats
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con estadísticas de categorías
   * @throws {500} Si hay error en el servidor
   */
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
