const analyticsService = require('../services/AnalyticsService');
const { HTTP_STATUS } = require('../types');

class TelemetryController {
  async registerHeartbeat(req, res) {
    try {
      const { storeId, sessionId, role: roleOverride } = req.body || {};

      const requestIp =
        req.headers['x-forwarded-for']?.split(',')?.[0]?.trim() ??
        req.connection?.remoteAddress ??
        req.ip ??
        null;
      const userAgent = req.headers['user-agent'] ?? '';

      let role = roleOverride;
      let userId = null;
      let resolvedStoreId = storeId ?? null;
      let resolvedSessionId = sessionId ?? null;

      if (req.user?.userId && req.user?.role) {
        userId = req.user.userId;
        role = req.user.role;

        if (role === 'ADMIN' && !resolvedStoreId) {
          resolvedStoreId = req.user.storeId ?? null;
        }
      }

      if (!role) {
        throw new Error('No se puede determinar el rol del usuario');
      }

      if (!resolvedSessionId && !userId) {
        resolvedSessionId = req.cookies?.sessionId ?? req.headers['x-session-id'] ?? null;
      }

      await analyticsService.registerHeartbeat({
        userId,
        storeId: resolvedStoreId,
        sessionId: resolvedSessionId,
        role,
        ipAddress: requestIp,
        userAgent,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new TelemetryController();


