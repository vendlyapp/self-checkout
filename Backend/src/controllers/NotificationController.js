const notificationService = require('../services/NotificationService');
const storeService = require('../services/StoreService');
const { HTTP_STATUS } = require('../types');

/**
 * Obtiene el storeId del usuario autenticado (su tienda).
 * @param {Object} req
 * @returns {Promise<string|null>}
 */
async function getStoreIdForUser(req) {
  if (req.user?.storeId) return req.user.storeId;
  const store = await storeService.getByOwnerId(req.user?.userId);
  return store?.id || null;
}

class NotificationController {
  /**
   * GET /api/notifications
   * Lista notificaciones de la tienda del usuario. Query: limit, offset, unreadOnly.
   */
  async list(req, res) {
    try {
      const storeId = await getStoreIdForUser(req);
      if (!storeId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tienda no encontrada',
        });
      }
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const offset = parseInt(req.query.offset, 10) || 0;
      const unreadOnly = req.query.unreadOnly === 'true';
      const result = await notificationService.findByStoreId(storeId, {
        limit,
        offset,
        unreadOnly,
      });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: result.data,
        unreadCount: result.unreadCount,
        total: result.total,
      });
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Marca una notificación como leída (solo si pertenece a la tienda del usuario).
   */
  async markAsRead(req, res) {
    try {
      const storeId = await getStoreIdForUser(req);
      if (!storeId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tienda no encontrada',
        });
      }
      const { id } = req.params;
      const updated = await notificationService.markAsRead(id, storeId);
      if (!updated) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Benachrichtigung nicht gefunden',
        });
      }
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Marca todas las notificaciones de la tienda del usuario como leídas.
   */
  async markAllAsRead(req, res) {
    try {
      const storeId = await getStoreIdForUser(req);
      if (!storeId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Tienda no encontrada',
        });
      }
      await notificationService.markAllAsRead(storeId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Alle Benachrichtigungen als gelesen markiert',
      });
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new NotificationController();
