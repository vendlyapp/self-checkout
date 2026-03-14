const { query } = require('../../lib/database');

class NotificationService {
  /**
   * Crear una notificación
   * @param {{ storeId?: string | null, type: string, title: string, message: string, payload?: object }} data
   */
  async create(data) {
    const { storeId = null, type, title, message, payload = {} } = data;
    const payloadJson = typeof payload === 'object' ? JSON.stringify(payload) : '{}';
    const result = await query(
      `INSERT INTO "Notification" ("storeId", "type", "title", "message", "payload")
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING *`,
      [storeId, type, title, message, payloadJson]
    );
    return result.rows[0];
  }

  /**
   * Listar notificaciones de una tienda con paginación
   * @param {string} storeId
   * @param {{ limit?: number, offset?: number, unreadOnly?: boolean }} options
   */
  async findByStoreId(storeId, options = {}) {
    const { limit = 20, offset = 0, unreadOnly = false } = options;
    const params = [storeId, limit, offset];
    const readFilter = unreadOnly ? ' AND "read" = false' : '';
    const listResult = await query(
      `SELECT * FROM "Notification"
       WHERE "storeId" = $1${readFilter}
       ORDER BY "createdAt" DESC
       LIMIT $2 OFFSET $3`,
      params
    );
    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM "Notification" WHERE "storeId" = $1${readFilter}`,
      [storeId]
    );
    const unreadResult = await query(
      `SELECT COUNT(*)::int AS count FROM "Notification" WHERE "storeId" = $1 AND "read" = false`,
      [storeId]
    );
    return {
      data: listResult.rows,
      total: countResult.rows[0].total,
      unreadCount: unreadResult.rows[0].count,
    };
  }

  /**
   * Marcar una notificación como leída (solo si pertenece a la tienda)
   */
  async markAsRead(id, storeId) {
    const result = await query(
      `UPDATE "Notification" SET "read" = true
       WHERE id = $1 AND "storeId" = $2
       RETURNING *`,
      [id, storeId]
    );
    return result.rows[0] || null;
  }

  /**
   * Marcar todas las notificaciones de una tienda como leídas
   */
  async markAllAsRead(storeId) {
    await query(
      `UPDATE "Notification" SET "read" = true WHERE "storeId" = $1`,
      [storeId]
    );
    return { success: true };
  }
}

module.exports = new NotificationService();
