const discountCodeService = require('../services/DiscountCodeService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de códigos de descuento
 * Maneja todas las operaciones CRUD relacionadas con códigos promocionales
 * @class DiscountCodeController
 */
class DiscountCodeController {
  /**
   * Obtiene todos los códigos de descuento del usuario
   * @route GET /api/discount-codes
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de códigos
   */
  async getAllDiscountCodes(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await discountCodeService.findAll(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene un código de descuento por ID
   * @route GET /api/discount-codes/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del código
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos del código
   */
  async getDiscountCodeById(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId || req.user?.id;
      
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await discountCodeService.findById(id, ownerId);
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
   * Busca un código de descuento por su código (string)
   * @route GET /api/discount-codes/validate/:code
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.code - Código a validar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos del código si es válido
   */
  async validateDiscountCode(req, res) {
    try {
      const { code } = req.params;
      
      if (!code || !code.trim()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El código es requerido'
        });
      }

      const result = await discountCodeService.findByCode(code);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') || error.message.includes('no está activo')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo código de descuento
   * @route POST /api/discount-codes
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos del código a crear
   * @param {string} req.body.code - Código del descuento
   * @param {string} req.body.discountType - Tipo de descuento ('percentage' o 'fixed')
   * @param {number} req.body.discountValue - Valor del descuento
   * @param {number} req.body.maxRedemptions - Máximo de redenciones
   * @param {string} req.body.validFrom - Fecha de inicio (ISO string)
   * @param {string} [req.body.validUntil] - Fecha de caducidad (ISO string, opcional)
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el código creado
   */
  async createDiscountCode(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await discountCodeService.create(req.body, ownerId);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('ya existe') || 
                        error.message.includes('requerido') ||
                        error.message.includes('debe ser')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza un código de descuento existente
   * @route PUT /api/discount-codes/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del código
   * @param {Object} req.body - Datos a actualizar
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con el código actualizado
   */
  async updateDiscountCode(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId || req.user?.id;
      
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await discountCodeService.update(id, req.body, ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado')
        ? HTTP_STATUS.NOT_FOUND
        : error.message.includes('ya existe') || error.message.includes('debe ser')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina un código de descuento
   * @route DELETE /api/discount-codes/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID del código a eliminar
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON confirmando la eliminación
   */
  async deleteDiscountCode(req, res) {
    try {
      const { id } = req.params;
      const ownerId = req.user?.userId || req.user?.id;
      
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await discountCodeService.delete(id, ownerId);
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
   * Obtiene estadísticas de códigos de descuento
   * @route GET /api/discount-codes/stats
   * @param {Object} req - Request object de Express
   * @param {Object} req.user - Usuario autenticado
   * @param {string} req.user.id - ID del usuario
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con estadísticas
   */
  async getStats(req, res) {
    try {
      const ownerId = req.user?.userId || req.user?.id;
      
      if (!ownerId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      const result = await discountCodeService.getStats(ownerId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DiscountCodeController();

