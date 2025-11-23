const { query } = require('../../lib/database');

class SuperAdminService {
  /**
   * Get all stores with basic information
   */
  async getAllStores(options = {}) {
    const { limit = 50, offset = 0, search = null } = options;

    let whereClause = '';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause = `WHERE s.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    const selectQuery = `
      SELECT 
        s.id,
        s.name,
        s.slug,
        s.logo,
        s."isActive",
        s."isOpen",
        s."createdAt",
        u.id as "ownerId",
        u.name as "ownerName",
        u.email as "ownerEmail",
        COALESCE(ps."productCount", 0) as "productCount",
        COALESCE(os."orderCount", 0) as "orderCount",
        COALESCE(os."totalRevenue", 0) as "totalRevenue"
      FROM "Store" s
        LEFT JOIN "User" u ON s."ownerId" = u.id
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS "productCount"
          FROM "Product" p
          WHERE p."ownerId" = s."ownerId"
        ) ps ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(DISTINCT o.id) AS "orderCount",
            COALESCE(SUM(oi.quantity * oi.price), 0) AS "totalRevenue"
          FROM "OrderItem" oi
            INNER JOIN "Order" o ON o.id = oi."orderId"
            INNER JOIN "Product" p2 ON p2.id = oi."productId"
          WHERE p2."ownerId" = s."ownerId"
        ) os ON TRUE
      ${whereClause}
      ORDER BY s."createdAt" DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await query(selectQuery, params);

    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  }

  /**
   * Get all users with their store information
   */
  async getAllUsers(options = {}) {
    const { limit = 50, offset = 0, role = null } = options;

    let whereClause = '';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause = `WHERE role = $${paramCount}`;
      params.push(role);
    }

    const selectQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u."createdAt",
        COALESCE(s.id, '') as "storeId",
        COALESCE(s.name, '') as "storeName",
        COALESCE(s.slug, '') as "storeSlug",
        COALESCE(s."isActive", false) as "storeActive"
      FROM "User" u
        LEFT JOIN "Store" s ON s."ownerId" = u.id
      ${whereClause}
      ORDER BY u."createdAt" DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await query(selectQuery, params);

    return {
      success: true,
      data: result.rows,
      count: result.rows.length
    };
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM "User") as "totalUsers",
        (SELECT COUNT(*) FROM "User" WHERE role = 'ADMIN') as "totalAdmins",
        (SELECT COUNT(*) FROM "User" WHERE role = 'CUSTOMER') as "totalCustomers",
        (SELECT COUNT(*) FROM "Store") as "totalStores",
        (SELECT COUNT(*) FROM "Store" WHERE "isActive" = true) as "activeStores",
        (SELECT COUNT(*) FROM "Product") as "totalProducts",
        (SELECT COUNT(*) FROM "Order") as "totalOrders",
        (SELECT COALESCE(SUM(total), 0) FROM "Order") as "totalRevenue"
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        users: {
          total: parseInt(stats.totalUsers) || 0,
          admins: parseInt(stats.totalAdmins) || 0,
          customers: parseInt(stats.totalCustomers) || 0
        },
        stores: {
          total: parseInt(stats.totalStores) || 0,
          active: parseInt(stats.activeStores) || 0
        },
        products: {
          total: parseInt(stats.totalProducts) || 0
        },
        orders: {
          total: parseInt(stats.totalOrders) || 0,
          revenue: parseFloat(stats.totalRevenue) || 0
        }
      }
    };
  }

  /**
   * Toggle store status
   */
  async toggleStoreStatus(storeId, isActive) {
    const updateQuery = `
      UPDATE "Store" 
      SET "isActive" = $1, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [isActive, storeId]);

    if (result.rows.length === 0) {
      throw new Error('Store not found');
    }

    return {
      success: true,
      data: result.rows[0],
      message: `Store ${isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  /**
   * Get store details
   */
  async getStoreDetails(storeId) {
    const selectQuery = `
      SELECT 
        s.*,
        u.name AS "ownerName",
        u.email AS "ownerEmail",
        COALESCE(ps."productCount", 0) AS "productCount",
        COALESCE(os."orderCount", 0) AS "orderCount",
        COALESCE(os."totalRevenue", 0) AS "totalRevenue"
      FROM "Store" s
        LEFT JOIN "User" u ON s."ownerId" = u.id
        LEFT JOIN LATERAL (
          SELECT COUNT(*) AS "productCount"
          FROM "Product" p
          WHERE p."ownerId" = s."ownerId"
        ) ps ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            COUNT(DISTINCT o.id) AS "orderCount",
            COALESCE(SUM(oi.quantity * oi.price), 0) AS "totalRevenue"
          FROM "OrderItem" oi
            INNER JOIN "Order" o ON o.id = oi."orderId"
            INNER JOIN "Product" p2 ON p2.id = oi."productId"
          WHERE p2."ownerId" = s."ownerId"
        ) os ON TRUE
      WHERE s.id = $1
    `;

    const result = await query(selectQuery, [storeId]);

    if (result.rows.length === 0) {
      throw new Error('Store not found');
    }

    return {
      success: true,
      data: result.rows[0]
    };
  }

  /**
   * Get all products grouped by store
   */
  async getAllProducts(options = {}) {
    const { limit = 100, offset = 0, search = null, storeId = null } = options;

    let whereClause = '';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereClause += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (storeId) {
      paramCount++;
      whereClause += ` AND s.id = $${paramCount}`;
      params.push(storeId);
    }

    const selectQuery = `
      SELECT 
        p.id,
        p."name",
        p.description,
        p.price,
        p."originalPrice",
        p.sku,
        p.stock,
        p."isActive",
        p.image,
        p.category,
        p."createdAt",
        COALESCE(s.id, '') as "storeId",
        COALESCE(s.name, '') as "storeName",
        COALESCE(s.slug, '') as "storeSlug",
        COALESCE(u.name, '') as "ownerName",
        COALESCE(u.email, '') as "ownerEmail"
      FROM "Product" p
        LEFT JOIN "User" u ON p."ownerId" = u.id
        LEFT JOIN "Store" s ON s."ownerId" = u.id
      WHERE 1=1 ${whereClause}
      ORDER BY p."createdAt" DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);
    const result = await query(selectQuery, params);

    return {
      success: true,
      data: result.rows
    };
  }
}

module.exports = new SuperAdminService();

