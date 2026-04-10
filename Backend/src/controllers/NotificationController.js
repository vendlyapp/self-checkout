const notificationService = require('../services/NotificationService');
const storeService = require('../services/StoreService');
const { HTTP_STATUS } = require('../types');

/**
 * Resolve the storeId for the authenticated user.
 */
async function getStoreIdForUser(req) {
  if (req.user?.storeId) return req.user.storeId;
  const store = await storeService.getByOwnerId(req.user?.userId);
  return store?.id || null;
}

/**
 * Notification controller.
 * Handles listing and marking notifications as read.
 */
class NotificationController {
  /** @route GET /api/notifications */
  async list(req, res) {
    try {
      const storeId = await getStoreIdForUser(req);
      if (!storeId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Store not found',
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

  /** @route PATCH /api/notifications/:id/read */
  async markAsRead(req, res) {
    try {
      const storeId = await getStoreIdForUser(req);
      if (!storeId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Store not found',
        });
      }
      const { id } = req.params;
      const updated = await notificationService.markAsRead(id, storeId);
      if (!updated) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Notification not found',
        });
      }
      return res.status(HTTP_STATUS.OK).json({ success: true, data: updated });
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route PATCH /api/notifications/read-all */
  async markAllAsRead(req, res) {
    try {
      const storeId = await getStoreIdForUser(req);
      if (!storeId) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Store not found',
        });
      }
      await notificationService.markAllAsRead(storeId);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'All notifications marked as read',
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
