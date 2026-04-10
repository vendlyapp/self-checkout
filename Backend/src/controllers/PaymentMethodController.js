const paymentMethodService = require('../services/PaymentMethodService');
const QRBillService = require('../services/QRBillService');
const { HTTP_STATUS } = require('../types');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Controlador de métodos de pago
 * Maneja todas las operaciones CRUD relacionadas con métodos de pago de stores
 * @class PaymentMethodController
 */
class PaymentMethodController {
  handleError(res, error, fallbackMessage = 'Internal server error') {
    logger.error('[PaymentMethodController] Request failed', { error: error.message });
    if (error.isOperational) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        ...(error.code && { code: error.code }),
      });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: fallbackMessage,
    });
  }
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
        throw new AppError('storeId must be a valid UUID', 400, 'VALIDATION_ERROR');
      }
      
      const options = {
        activeOnly: activeOnly === 'true'
      };
      
      const result = await paymentMethodService.findByStoreId(storeId, options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
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
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      const result = await paymentMethodService.findById(id);
      const storeId = result.data.storeId;

      if (userRole !== 'SUPER_ADMIN') {
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          throw new AppError('Payment method not found', 404, 'PAYMENT_METHOD_NOT_FOUND');
        }
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
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
        throw new AppError('storeId must be a valid UUID', 400, 'VALIDATION_ERROR');
      }

      if (!userId) {
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      // Si el usuario es SUPER_ADMIN, permitir la creación sin verificar propiedad
      if (userRole !== 'SUPER_ADMIN') {
        // Verificar que el usuario sea propietario del store
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          throw new AppError('You do not have permission to create payment methods for this store', 403, 'FORBIDDEN');
        }
      }

      const methodData = {
        ...req.body,
        storeId
      };

      // Validar QR-IBAN al crear para dar feedback inmediato al comercio
      if (methodData.code === 'qr-rechnung' && methodData.config?.qrIban) {
        const validation = QRBillService.validateQRIBAN(methodData.config.qrIban);
        if (!validation.valid) {
          throw new AppError(`Invalid QR-IBAN: ${validation.error}`, 400, 'VALIDATION_ERROR');
        }
      }

      const result = await paymentMethodService.create(methodData);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      return this.handleError(res, error);
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
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      // Obtener el método para verificar el storeId
      const existingMethod = await paymentMethodService.findById(id);
      const storeId = existingMethod.data.storeId;

      // Si el usuario es SUPER_ADMIN, permitir la actualización sin verificar propiedad
      if (userRole !== 'SUPER_ADMIN') {
        // Verificar que el usuario sea propietario del store
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          throw new AppError('You do not have permission to update payment methods for this store', 403, 'FORBIDDEN');
        }
      }

      // Validar QR-IBAN al actualizar para dar feedback inmediato al comercio
      if (req.body.config?.qrIban) {
        const validation = QRBillService.validateQRIBAN(req.body.config.qrIban);
        if (!validation.valid) {
          throw new AppError(`Invalid QR-IBAN: ${validation.error}`, 400, 'VALIDATION_ERROR');
        }
      }

      const result = await paymentMethodService.update(id, req.body);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error, 'Failed to update payment method');
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
        throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
      }

      // Obtener el método para verificar el storeId
      const existingMethod = await paymentMethodService.findById(id);
      const storeId = existingMethod.data.storeId;

      // Si el usuario es SUPER_ADMIN, permitir la eliminación sin verificar propiedad
      if (userRole !== 'SUPER_ADMIN') {
        // Verificar que el usuario sea propietario del store
        const isOwner = await paymentMethodService.verifyStoreOwner(storeId, userId);
        if (!isOwner) {
          throw new AppError('You do not have permission to delete payment methods for this store', 403, 'FORBIDDEN');
        }
      }

      const result = await paymentMethodService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

module.exports = new PaymentMethodController();

