const productService = require('../services/ProductService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de productos
 * Maneja todas las operaciones CRUD relacionadas con productos
 * @class ProductController
 */
class ProductController {
  /**
   * Obtiene todos los productos del usuario autenticado
   * Soporta búsqueda y límite de resultados
   * @route GET /api/products
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de productos a retornar
   * @param {string} [req.query.search] - Término de búsqueda
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.userId - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de productos
   * @throws {400} Si el término de búsqueda es inválido
   * @throws {500} Si hay error en el servidor
   */
  async getAllProducts(req, res) {
    try {
      const { limit, search } = req.query;
      const ownerId = req.user?.userId; // Obtener del usuario autenticado

      if (search) {
        const result = await productService.search(search, { ownerId });
        return res.status(HTTP_STATUS.OK).json(result);
      }

      const options = { ownerId };
      if (limit) options.limit = parseInt(limit);
      
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

  /**
   * Obtiene un producto específico por su ID
   * @route GET /api/products/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del producto
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos del producto
   * @throws {404} Si el producto no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Obtiene todos los productos disponibles para clientes
   * Solo retorna productos con stock y activos
   * @route GET /api/products/available
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de productos a retornar
   * @param {string} [req.query.search] - Término de búsqueda
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de productos disponibles
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Crea un nuevo producto
   * Requiere autenticación
   * @route POST /api/products
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos del producto a crear
   * @param {string} req.body.name - Nombre del producto
   * @param {number} req.body.price - Precio del producto
   * @param {number} req.body.stock - Stock inicial
   * @param {string} [req.body.description] - Descripción del producto
   * @param {string} [req.body.image] - URL de la imagen
   * @param {string} [req.body.category] - Categoría del producto
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.userId - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el producto creado
   * @throws {400} Si el SKU ya está en uso
   * @throws {401} Si el usuario no está autenticado
   * @throws {500} Si hay error en el servidor
   */
  async createProduct(req, res) {
    try {
      const ownerId = req.user?.userId; // Obtener del usuario autenticado
      
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await productService.create(req.body, ownerId);
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

  /**
   * Actualiza un producto existente
   * @route PUT /api/products/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del producto
   * @param {Object} req.body - Datos a actualizar
   * @param {string} [req.body.name] - Nombre del producto
   * @param {number} [req.body.price] - Precio del producto
   * @param {number} [req.body.stock] - Stock del producto
   * @param {string} [req.body.description] - Descripción
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el producto actualizado
   * @throws {404} Si el producto no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Actualiza el stock de un producto
   * @route PATCH /api/products/:id/stock
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del producto
   * @param {Object} req.body - Datos del stock
   * @param {number} req.body.stock - Nuevo valor de stock
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el producto actualizado
   * @throws {400} Si el stock no es un número válido
   * @throws {404} Si el producto no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Elimina un producto
   * @route DELETE /api/products/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del producto a eliminar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la eliminación
   * @throws {404} Si el producto no existe
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Obtiene estadísticas de productos
   * Retorna conteo total, bajo stock, sin stock, etc.
   * @route GET /api/products/stats
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con estadísticas de productos
   * @throws {500} Si hay error en el servidor
   */
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

  /**
   * Obtiene un producto por su código QR (ID del producto)
   * Endpoint público para clientes - incluye información de la tienda
   * @route GET /api/products/qr/:qrCode
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.qrCode - ID del producto (UUID) contenido en el QR
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el producto y su tienda
   * @throws {404} Si el producto no existe o no está disponible
   * @throws {500} Si hay error en el servidor
   */
  async getProductByQR(req, res) {
    try {
      const { qrCode } = req.params;
      
      // Validar que el qrCode sea un UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(qrCode)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Código QR inválido'
        });
      }

      // Buscar producto con información de la tienda
      const result = await productService.findByIdWithStore(qrCode);

      // Verificar que el producto tenga stock y esté disponible
      if (result.data.stock <= 0) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Producto no disponible'
        });
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') || error.message.includes('no disponible')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();
