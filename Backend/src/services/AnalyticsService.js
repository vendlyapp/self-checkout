const { query } = require('../../lib/database');

const ALLOWED_GRANULARITIES = new Set(['day', 'week', 'month']);

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
}

module.exports = new AnalyticsService();


