const { query, transaction } = require('../../lib/database');

const ALLOWED_GRANULARITIES = new Set(['day', 'week', 'month']);
const EXPIRATION_MINUTES = 10;

class AnalyticsService {
  #resolveGranularity(granularity) {
    if (typeof granularity !== 'string') {
      return 'day';
    }

    const normalized = granularity.toLowerCase();
    return ALLOWED_GRANULARITIES.has(normalized) ? normalized : 'day';
  }

  #resolveDateRange(from, to, fallbackDays = 90) {
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(now.getDate() - fallbackDays);

    const fromDate = from ? new Date(from) : defaultFrom;
    const toDate = to ? new Date(to) : now;

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new Error('Parámetros de fecha inválidos');
    }

    if (fromDate > toDate) {
      throw new Error('El parámetro "from" no puede ser mayor que "to"');
    }

    return {
      from: fromDate,
      to: toDate,
    };
  }

  async getSalesOverTime({ from, to, granularity } = {}) {
    const { from: fromDate, to: toDate } = this.#resolveDateRange(from, to, 120);
    const resolvedGranularity = this.#resolveGranularity(granularity);

    const result = await query(
      `
        SELECT
          date_trunc($1, o."createdAt") AS bucket,
          COUNT(DISTINCT o.id) AS "totalOrders",
          COALESCE(SUM(o.total), 0) AS "totalRevenue"
        FROM "Order" o
        WHERE o."createdAt" BETWEEN $2 AND $3
        GROUP BY bucket
        ORDER BY bucket ASC
      `,
      [resolvedGranularity, fromDate, toDate],
    );

    return result.rows.map((row) => ({
      bucket: row.bucket,
      totalOrders: Number(row.totalOrders),
      totalRevenue: Number(row.totalRevenue),
    }));
  }

  async getStorePerformance({ from, to, limit = 10 } = {}) {
    const { from: fromDate, to: toDate } = this.#resolveDateRange(from, to, 90);
    const sanitizedLimit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 10;

    const result = await query(
      `
        SELECT
          s.id AS "storeId",
          s.name AS "storeName",
          s."isActive" AS "isActive",
          COUNT(DISTINCT o.id) AS "orders",
          COALESCE(SUM(oi.quantity * oi.price), 0) AS "revenue",
          COALESCE(SUM(oi.quantity), 0) AS "unitsSold"
        FROM "OrderItem" oi
        INNER JOIN "Order" o ON oi."orderId" = o.id
        INNER JOIN "Product" p ON oi."productId" = p.id
        INNER JOIN "Store" s ON s."ownerId" = p."ownerId"
        WHERE o."createdAt" BETWEEN $1 AND $2
        GROUP BY s.id
        ORDER BY "revenue" DESC
        LIMIT $3
      `,
      [fromDate, toDate, sanitizedLimit],
    );

    return result.rows.map((row) => ({
      storeId: row.storeId,
      storeName: row.storeName,
      isActive: row.isActive,
      orders: Number(row.orders),
      revenue: Number(row.revenue),
      unitsSold: Number(row.unitsSold),
    }));
  }

  async getTopProducts({ from, to, limit = 10, metric = 'revenue' } = {}) {
    const { from: fromDate, to: toDate } = this.#resolveDateRange(from, to, 90);
    const sanitizedLimit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 10;
    const normalizedMetric = metric === 'units' ? 'units' : 'revenue';

    const result = await query(
      `
        SELECT
          p.id AS "productId",
          p.name AS "productName",
          COALESCE(SUM(oi.quantity * oi.price), 0) AS "revenue",
          COALESCE(SUM(oi.quantity), 0) AS "unitsSold"
        FROM "OrderItem" oi
        INNER JOIN "Order" o ON oi."orderId" = o.id
        INNER JOIN "Product" p ON oi."productId" = p.id
        WHERE o."createdAt" BETWEEN $1 AND $2
        GROUP BY p.id
        ORDER BY ${normalizedMetric === 'revenue' ? '"revenue"' : '"unitsSold"'} DESC
        LIMIT $3
      `,
      [fromDate, toDate, sanitizedLimit],
    );

    return result.rows.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      revenue: Number(row.revenue),
      unitsSold: Number(row.unitsSold),
    }));
  }

  async registerHeartbeat({
    userId = null,
    storeId = null,
    sessionId = null,
    role,
    ipAddress,
    userAgent,
  }) {
    if (!role) {
      throw new Error('El rol es obligatorio para registrar actividad');
    }

    const resolvedSessionId = sessionId || null;
    const resolvedStoreId = storeId || null;

    await transaction(async (client) => {
      if (!resolvedSessionId && !userId) {
        throw new Error('Se requiere userId o sessionId para rastrear actividad');
      }

      if (!userId) {
        const sessionResult = await client.query(
          `
            INSERT INTO "ActiveSession" ("sessionId", "userId", "storeId", role, "ip", "userAgent", "lastSeen")
            VALUES ($1, NULL, $2, $3, $4, $5, NOW())
            ON CONFLICT ("sessionId")
            DO UPDATE SET
              "storeId" = COALESCE($2, "ActiveSession"."storeId"),
              role = $3,
              "ip" = $4,
              "userAgent" = $5,
              "lastSeen" = NOW(),
              "updatedAt" = NOW()
            RETURNING id
          `,
          [resolvedSessionId, resolvedStoreId, role, ipAddress, userAgent],
        );

        return sessionResult.rows[0];
      }

      const result = await client.query(
        `
          INSERT INTO "ActiveSession" ("userId", "storeId", "sessionId", role, "ip", "userAgent", "lastSeen")
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT ("userId", role)
          DO UPDATE SET
            "storeId" = COALESCE($2, "ActiveSession"."storeId"),
            "sessionId" = COALESCE($3, "ActiveSession"."sessionId"),
            "ip" = $5,
            "userAgent" = $6,
            "lastSeen" = NOW(),
            "updatedAt" = NOW()
          RETURNING id
        `,
        [userId, resolvedStoreId, resolvedSessionId, role, ipAddress, userAgent],
      );

      return result.rows[0];
    });
  }

  async purgeExpiredSessions(thresholdMinutes = EXPIRATION_MINUTES) {
    const minutes = Number.isFinite(Number(thresholdMinutes))
      ? Math.max(1, Number(thresholdMinutes))
      : EXPIRATION_MINUTES;

    await query(
      `
        DELETE FROM "ActiveSession"
        WHERE "lastSeen" < NOW() - ($1::int || ' minutes')::interval
      `,
      [minutes],
    );
  }

  async getActiveOverview({ intervalMinutes = 5 } = {}) {
    const minutes = Number.isFinite(Number(intervalMinutes)) ? Number(intervalMinutes) : 5;

    const result = await query(
      `
        SELECT role, COUNT(*) as total
        FROM "ActiveSession"
        WHERE "lastSeen" >= NOW() - ($1::int || ' minutes')::interval
        GROUP BY role
      `,
      [minutes],
    );

    const summary = {
      total: 0,
      roles: {
        SUPER_ADMIN: 0,
        ADMIN: 0,
        CUSTOMER: 0,
      },
    };

    for (const row of result.rows) {
      const role = row.role;
      const total = Number(row.total);
      summary.roles[role] = total;
      summary.total += total;
    }

    return summary;
  }

  async getActiveCustomersByStore({ intervalMinutes = 5 } = {}) {
    const minutes = Number.isFinite(Number(intervalMinutes)) ? Number(intervalMinutes) : 5;

    const result = await query(
      `
        SELECT
          s.id AS "storeId",
          s.name AS "storeName",
          COUNT(*) AS "activeCustomers"
        FROM "ActiveSession" a
        INNER JOIN "Store" s ON s.id = a."storeId"
        WHERE a.role = 'CUSTOMER'
          AND a."lastSeen" >= NOW() - ($1::int || ' minutes')::interval
        GROUP BY s.id, s.name
        ORDER BY "activeCustomers" DESC
      `,
      [minutes],
    );

    return result.rows.map((row) => ({
      storeId: row.storeId,
      storeName: row.storeName,
      activeCustomers: Number(row.activeCustomers),
    }));
  }
}

module.exports = new AnalyticsService();


