const paymentMethodService = require('../services/PaymentMethodService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de métodos de pago
 * Maneja todas las operaciones CRUD relacionadas con métodos de pago de stores
 * @class PaymentMethodController
 */
class PaymentMethodController {
  /**
   * Obtiene todos los métodos de pago de un store
   * @route GET /api/stores/:storeId/payment-methods
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.storeId - ID del store
   * @param {Object} req.query - Query parameters
   * @param {boolean} [req.query.activeOnly] - Si es true, solo retorna métodos activos
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de métodos de pago
   * @throws {500} Si hay error en el servidor
   */
  async getPaymentMethodsByStoreId(req, res) {
    try {
      const { storeId } = req.params;
      const { activeOnly } = req.query;
      
      // Validar que storeId sea un UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!storeId || !uuidRegex.test(storeId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El storeId debe ser un UUID válido'
        });
      }
      
      const options = {
        activeOnly: activeOnly === 'true'
      };
      
      const result = await paymentMethodService.findByStoreId(storeId, options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene un método de pago específico por su ID
   * @route GET /api/payment-methods/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del método de pago
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos del método de pago
   * @throws {404} Si el método de pago no existe
   * @throws {500} Si hay error en el servidor
   */
  async getPaymentMethodById(req, res) {
    try {
      const { id } = req.params;
      const result = await paymentMethodService.findById(id);
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
   * Crea un nuevo método de pago
   * @route POST /api/stores/:storeId/payment-methods
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.storeId - ID del store
   * @param {Object} req.body - Datos del método de pago a crear
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.userId - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el método de pago creado
   * @throws {400} Si los datos son inválidos o el código ya existe
   * @throws {403} Si el usuario no es propietario del store
   * @throws {500} Si hay error en el servidor
   */
  async createPaymentMethod(req, res) {
    try {
      const { storeId } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      // Validar que storeId sea un UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!storeId || !uuidRegex.test(storeId)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El storeId debe ser un UUID válido'
        });
      }

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Si el usuario es SUPER_ADMIN, permitir la creación sin verificar propiedad
      if (userRole !== 'SUPER_ADMIN') {
        // Verificar que el usuario sea propietario del store
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: 'No tienes permiso para crear métodos de pago en este store'
          });
        }
      }

      const methodData = {
        ...req.body,
        storeId
      };

      const result = await paymentMethodService.create(methodData);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('ya existe') || error.message.includes('requerido')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza un método de pago existente
   * @route PUT /api/payment-methods/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del método de pago
   * @param {Object} req.body - Datos a actualizar
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.userId - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el método de pago actualizado
   * @throws {404} Si el método de pago no existe
   * @throws {403} Si el usuario no es propietario del store
   * @throws {500} Si hay error en el servidor
   */
  async updatePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Obtener el método para verificar el storeId
      const existingMethod = await paymentMethodService.findById(id);
      const storeId = existingMethod.data.storeId;

      // Si el usuario es SUPER_ADMIN, permitir la actualización sin verificar propiedad
      if (userRole !== 'SUPER_ADMIN') {
        // Verificar que el usuario sea propietario del store
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: 'No tienes permiso para actualizar métodos de pago de este store'
          });
        }
      }

      const result = await paymentMethodService.update(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : error.message.includes('ya existe')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina un método de pago
   * @route DELETE /api/payment-methods/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del método de pago a eliminar
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.userId - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la eliminación
   * @throws {404} Si el método de pago no existe
   * @throws {403} Si el usuario no es propietario del store
   * @throws {500} Si hay error en el servidor
   */
  async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      // Obtener el método para verificar el storeId
      const existingMethod = await paymentMethodService.findById(id);
      const storeId = existingMethod.data.storeId;

      // Si el usuario es SUPER_ADMIN, permitir la eliminación sin verificar propiedad
      if (userRole !== 'SUPER_ADMIN') {
        // Verificar que el usuario sea propietario del store
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            error: 'No tienes permiso para eliminar métodos de pago de este store'
          });
        }
      }

      const result = await paymentMethodService.delete(id);
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
}

module.exports = new PaymentMethodController();

