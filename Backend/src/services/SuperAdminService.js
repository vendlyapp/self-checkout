const { query } = require('../../lib/database');
const qrCodeGenerator = require('../utils/qrCodeGenerator');
const productService = require('./ProductService');
const orderService = require('./OrderService');
const categoryService = require('./CategoryService');
const discountCodeService = require('./DiscountCodeService');

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
   * Update store information
   */
  async updateStore(storeId, storeData) {
    try {
      // Verify store exists
      const storeResult = await this.getStoreDetails(storeId);
      if (!storeResult.success || !storeResult.data) {
        throw new Error('Store not found');
      }

      const { name, slug, logo, isActive, isOpen } = storeData;
      const updateFields = [];
      const values = [];
      let paramCount = 0;

      // Validate and add fields
      if (name !== undefined) {
        if (!name || !name.trim()) {
          throw new Error('El nombre de la tienda es requerido');
        }
        paramCount++;
        updateFields.push(`name = $${paramCount}`);
        values.push(name.trim());
      }

      if (slug !== undefined) {
        if (!slug || !slug.trim()) {
          throw new Error('El slug es requerido');
        }
        // Validate slug format (lowercase, alphanumeric, hyphens only)
        const slugRegex = /^[a-z0-9-]+$/;
        const normalizedSlug = slug.trim().toLowerCase();
        if (!slugRegex.test(normalizedSlug)) {
          throw new Error('El slug solo puede contener letras minúsculas, números y guiones');
        }
        
        // Check if slug is already taken by another store
        const slugCheckQuery = 'SELECT id FROM "Store" WHERE slug = $1 AND id != $2';
        const slugCheckResult = await query(slugCheckQuery, [normalizedSlug, storeId]);
        if (slugCheckResult.rows.length > 0) {
          throw new Error('Este slug ya está en uso por otra tienda');
        }

        paramCount++;
        updateFields.push(`slug = $${paramCount}`);
        values.push(normalizedSlug);
      }

      if (logo !== undefined) {
        paramCount++;
        updateFields.push(`logo = $${paramCount}`);
        values.push(logo || null);
      }

      if (isActive !== undefined) {
        paramCount++;
        updateFields.push(`"isActive" = $${paramCount}`);
        values.push(Boolean(isActive));
      }

      if (isOpen !== undefined) {
        paramCount++;
        updateFields.push(`"isOpen" = $${paramCount}`);
        values.push(Boolean(isOpen));
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      // Add storeId and updatedAt
      paramCount++;
      values.push(storeId);

      const updateQuery = `
        UPDATE "Store" 
        SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Error al actualizar la tienda');
      }

      const updatedStore = result.rows[0];

      // Regenerate QR code if slug or name changed
      if ((slug !== undefined || name !== undefined) && updatedStore.slug) {
        const qrCodeGenerator = require('../utils/qrCodeGenerator');
        const qrUrl = `${process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app'}/store/${updatedStore.slug}`;
        const qrCode = await qrCodeGenerator.generateQRCode(qrUrl, updatedStore.name);
        
        const qrUpdateQuery = 'UPDATE "Store" SET "qrCode" = $1 WHERE "id" = $2 RETURNING *';
        const qrResult = await query(qrUpdateQuery, [qrCode, storeId]);
        
        return {
          success: true,
          data: qrResult.rows[0]
        };
      }

      return {
        success: true,
        data: updatedStore
      };
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
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
        s.id,
        s."ownerId",
        s.name,
        s.slug,
        s.logo,
        s."qrCode",
        s."isActive",
        s."isOpen",
        s."createdAt",
        s."updatedAt",
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

  /**
   * Get store analytics (sales, revenue trend, products by category)
   * Uses existing services instead of direct SQL queries
   */
  async getStoreAnalytics(storeId, options = {}) {
    const { period = 'month' } = options;
    
    try {
      // Get store details first to get ownerId
      const storeResult = await this.getStoreDetails(storeId);
      if (!storeResult.success || !storeResult.data) {
        throw new Error('Store not found');
      }
      
      const store = storeResult.data;
      const ownerId = store.ownerId || store.ownerid; // Handle case sensitivity

      if (!ownerId) {
        throw new Error(`Store ownerId not found. Store data: ${JSON.stringify(store)}`);
      }

      // Calculate date range based on period
      const now = new Date();
      let startDate;
      switch (period) {
        case 'day':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now);
          startDate.setMonth(startDate.getMonth() - 1);
      }

      // Validate startDate
      if (!startDate || isNaN(startDate.getTime())) {
        throw new Error('Invalid startDate calculated');
      }

      const startDateISO = startDate.toISOString();
      if (!startDateISO) {
        throw new Error('Failed to convert startDate to ISO string');
      }

      // Debug: Log parameters to verify they are correct
      console.log('[getStoreAnalytics] Parameters:', {
        storeId,
        ownerId,
        startDateISO,
        period
      });

    // Sales data (last 7 days)
    const salesQuery = `
      SELECT 
        o."createdAt"::date as date,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
        COUNT(DISTINCT o.id) as orders
      FROM "Order" o
      INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
      INNER JOIN "Product" p ON oi."productId" = p.id
      WHERE p."ownerId" = $1
        AND o."createdAt" >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY o."createdAt"::date
      ORDER BY date ASC
    `;

    // Revenue trend (last 30 days)
    const revenueQuery = `
      SELECT 
        o."createdAt"::date as date,
        COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
      FROM "Order" o
      INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
      INNER JOIN "Product" p ON oi."productId" = p.id
      WHERE p."ownerId" = $1
        AND o."createdAt" >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY o."createdAt"::date
      ORDER BY date ASC
    `;

    // Get real categories from ProductCategory table and count products/revenue per category
    // Only get categories that have products for this store owner
    // Filter orders by date using a subquery to avoid parameter confusion
    // Show all categories that have products, regardless of isActive status
    const categoriesQuery = `
      WITH filtered_orders AS (
        SELECT oi."productId", oi.quantity, oi.price
        FROM "OrderItem" oi
        INNER JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."createdAt" >= CAST($1 AS TIMESTAMP)
      )
      SELECT 
        COALESCE(pc.id::text, p."categoryId", 'uncategorized') as id,
        COALESCE(pc.name, p.category, 'Sin categoría') as category,
        COUNT(DISTINCT p.id) as count,
        COALESCE(SUM(fo.quantity * fo.price), 0) as revenue
      FROM "Product" p
      LEFT JOIN "ProductCategory" pc ON p."categoryId" = pc.id::text
      LEFT JOIN filtered_orders fo ON p.id = fo."productId"
      WHERE p."ownerId" = $2
      GROUP BY COALESCE(pc.id::text, p."categoryId", 'uncategorized'), COALESCE(pc.name, p.category, 'Sin categoría')
      HAVING COUNT(DISTINCT p.id) > 0
      ORDER BY count DESC
    `;

    // Orders by status - Since Order table doesn't have status column, we'll use a default
    // We'll count all orders as "completed" for now
    const ordersStatusQuery = `
      SELECT 
        'completed' as status,
        COUNT(DISTINCT o.id) as count
      FROM "Order" o
      INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
      INNER JOIN "Product" p ON oi."productId" = p.id
      WHERE p."ownerId" = $1
        AND o."createdAt" >= $2
    `;

      const [salesResult, revenueResult, categoriesResult, ordersStatusResult] = await Promise.all([
        query(salesQuery, [ownerId]),
        query(revenueQuery, [ownerId]),
        query(categoriesQuery, [startDateISO, ownerId]),
        query(ordersStatusQuery, [ownerId, startDateISO])
      ]);

      // Debug: Log categories result
      console.log('[getStoreAnalytics] Categories query result:', {
        rowCount: categoriesResult.rows.length,
        rows: categoriesResult.rows
      });

      // Process sales data (last 7 days)
      const salesDataMap = new Map();
      salesResult.rows.forEach(row => {
        // Handle date - it might be a Date object or a string
        const dateKey = row.date instanceof Date 
          ? row.date.toISOString().split('T')[0]
          : typeof row.date === 'string' 
            ? row.date.split('T')[0]
            : String(row.date);
        salesDataMap.set(dateKey, {
          revenue: parseFloat(row.revenue) || 0,
          orders: parseInt(row.orders) || 0
        });
      });

      // Fill missing days
      const salesData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const data = salesDataMap.get(dateStr) || { revenue: 0, orders: 0 };
        
        salesData.push({
          day: date.toLocaleDateString('de-CH', { weekday: 'short' }),
          date: date.toLocaleDateString('de-CH', { month: 'short', day: 'numeric' }),
          currentWeek: data.revenue,
          lastWeek: 0, // Would need historical data
        });
      }

      // Process revenue trend (last 30 days)
      const revenueDataMap = new Map();
      revenueResult.rows.forEach(row => {
        // Handle date - it might be a Date object or a string
        const dateKey = row.date instanceof Date 
          ? row.date.toISOString().split('T')[0]
          : typeof row.date === 'string' 
            ? row.date.split('T')[0]
            : row.date;
        revenueDataMap.set(dateKey, parseFloat(row.revenue) || 0);
      });

      const revenueData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const revenue = revenueDataMap.get(dateStr) || 0;
        
        revenueData.push({
          date: date.toLocaleDateString('de-CH', { month: 'short', day: 'numeric' }),
          revenue: revenue,
        });
      }

      // Process categories - use real category names from ProductCategory table
      const categoriesData = categoriesResult.rows.map(row => {
        const count = parseInt(row.count) || 0;
        return {
          name: row.category || 'Sin categoría',
          value: 0, // Will calculate percentage
          count: count,
          revenue: parseFloat(row.revenue) || 0
        };
      }).filter(cat => cat.count > 0); // Filter out categories with 0 products

      // Calculate percentages for categories
      const totalProducts = categoriesData.reduce((sum, cat) => sum + cat.count, 0);
      categoriesData.forEach(cat => {
        cat.value = totalProducts > 0 ? Math.round((cat.count / totalProducts) * 100) : 0;
      });

      // Debug: Log processed categories
      console.log('[getStoreAnalytics] Processed categories:', {
        totalProducts,
        categoriesCount: categoriesData.length,
        categories: categoriesData
      });

      // Process orders by status
      const ordersData = ordersStatusResult.rows.map(row => ({
        status: row.status === 'completed' ? 'Completadas' : 
                row.status === 'pending' ? 'Pendientes' : 
                row.status === 'cancelled' ? 'Canceladas' : row.status,
        count: parseInt(row.count) || 0,
        color: row.status === 'completed' ? '#10b981' :
               row.status === 'pending' ? '#f59e0b' :
               row.status === 'cancelled' ? '#ef4444' : '#6b7280'
      }));

      // Calculate totals
      const totalSales = salesData.reduce((sum, d) => sum + d.currentWeek, 0);
      const lastWeekTotal = salesData.reduce((sum, d) => sum + d.lastWeek, 0);
      const salesGrowth = lastWeekTotal > 0 ? Math.round(((totalSales - lastWeekTotal) / lastWeekTotal) * 100) : 0;

      // Payment methods (mock for now - would need payment method in Order)
      const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
      const paymentMethodsData = [
        { name: 'Tarjeta', value: 45, amount: Math.floor(totalRevenue * 0.45), color: '#10b981' },
        { name: 'Efectivo', value: 30, amount: Math.floor(totalRevenue * 0.30), color: '#3b82f6' },
        { name: 'Transferencia', value: 15, amount: Math.floor(totalRevenue * 0.15), color: '#f59e0b' },
        { name: 'Digital', value: 10, amount: Math.floor(totalRevenue * 0.10), color: '#8b5cf6' },
      ];

      // Get additional stats using services
      const [orderStats, productStats, categoryStats, discountStats] = await Promise.all([
        orderService.getStats({ ownerId }),
        this.getStoreProductStats(ownerId),
        this.getStoreCategoryStats(ownerId),
        discountCodeService.getStats(ownerId)
      ]);

      return {
        success: true,
        data: {
          salesData,
          revenueData,
          categoriesData,
          paymentMethodsData,
          ordersData,
          totalSales,
          salesGrowth,
          // Additional stats
          orderStats: orderStats.success ? orderStats.data : null,
          productStats: productStats || null,
          categoryStats: categoryStats || null,
          discountStats: discountStats.success ? discountStats.data : null,
        }
      };
    } catch (error) {
      console.error('Error getting store analytics:', error);
      throw error;
    }
  }

  /**
   * Get product statistics for a store
   */
  async getStoreProductStats(ownerId) {
    try {
      const productsResult = await productService.findAll({ ownerId, limit: 1000 });
      
      if (!productsResult.success) {
        return null;
      }

      const products = productsResult.data || [];
      const total = products.length;
      const active = products.filter(p => p.isActive).length;
      const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
      const outOfStock = products.filter(p => p.stock === 0).length;
      const inactive = products.filter(p => !p.isActive).length;

      return {
        total,
        active,
        lowStock,
        outOfStock,
        inactive
      };
    } catch (error) {
      console.error('Error getting product stats:', error);
      return null;
    }
  }

  /**
   * Get category statistics for a store
   */
  async getStoreCategoryStats(ownerId) {
    try {
      const [categoriesResult, productsResult] = await Promise.all([
        categoryService.findAll(),
        productService.findAll({ ownerId, limit: 1000 })
      ]);

      if (!categoriesResult.success || !productsResult.success) {
        return null;
      }

      const categories = categoriesResult.data || [];
      const products = productsResult.data || [];
      
      // Count products per category
      const categoryCounts = new Map();
      products.forEach(product => {
        if (product.categoryId) {
          const count = categoryCounts.get(product.categoryId) || 0;
          categoryCounts.set(product.categoryId, count + 1);
        }
      });

      const withProducts = categories.filter(cat => categoryCounts.get(cat.id) > 0).length;
      const withoutProducts = categories.length - withProducts;

      return {
        total: categories.length,
        withProducts,
        withoutProducts
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      return null;
    }
  }

  /**
   * Get orders for a specific store
   */
  async getStoreOrders(storeId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      
      // Get store details first to get ownerId
      const storeResult = await this.getStoreDetails(storeId);
      if (!storeResult.success || !storeResult.data) {
        throw new Error('Store not found');
      }
      
      const store = storeResult.data;
      const ownerId = store.ownerId;

      // Get orders for products owned by this store
      // Use GROUP BY to get unique orders even if they have multiple products from this store
      const ordersQuery = `
        SELECT 
          o.id,
          o."userId",
          o.total,
          COALESCE(o.status, 'completed') as status,
          o."paymentMethod",
          o."createdAt",
          u.name as "customerName",
          u.email as "customerEmail"
        FROM "Order" o
        INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
        INNER JOIN "Product" p ON oi."productId" = p.id
        LEFT JOIN "User" u ON o."userId" = u.id
        WHERE p."ownerId" = $1
        GROUP BY o.id, o."userId", o.total, o.status, o."paymentMethod", o."createdAt", u.name, u.email
        ORDER BY o."createdAt" DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await query(ordersQuery, [ownerId, limit, offset]);
      const orders = result.rows;

      // Get items count for each order and generate orderNumber
      for (const order of orders) {
        const itemsQuery = `
          SELECT COUNT(*) as count
          FROM "OrderItem" oi
          INNER JOIN "Product" p ON oi."productId" = p.id
          WHERE oi."orderId" = $1 AND p."ownerId" = $2
        `;
        const itemsResult = await query(itemsQuery, [order.id, ownerId]);
        order.itemsCount = parseInt(itemsResult.rows[0].count) || 0;
        
        // Generate orderNumber from order id (first 8 chars)
        order.orderNumber = `ORD-${order.id.substring(0, 8).toUpperCase()}`;
        
        // Use payment method from Order table, fallback to 'Tarjeta' if not available
        if (!order.paymentMethod) {
          order.paymentMethod = 'Tarjeta';
        }
      }

      // Count total
      const countQuery = `
        SELECT COUNT(DISTINCT o.id) as total
        FROM "Order" o
        INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
        INNER JOIN "Product" p ON oi."productId" = p.id
        WHERE p."ownerId" = $1
      `;
      const countResult = await query(countQuery, [ownerId]);
      const total = parseInt(countResult.rows[0].total) || 0;

      return {
        success: true,
        data: orders,
        count: orders.length,
        total: total
      };
    } catch (error) {
      console.error('Error getting store orders:', error);
      throw error;
    }
  }

  /**
   * Regenerate QR code for a store
   */
  async regenerateQRCode(storeId) {
    try {
      // Get store details
      const storeResult = await this.getStoreDetails(storeId);
      
      if (!storeResult.success || !storeResult.data) {
        throw new Error('Store not found');
      }

      const store = storeResult.data;

      // Generate new QR code with the full URL
      const qrUrl = `${process.env.FRONTEND_URL || 'https://self-checkout-kappa.vercel.app'}/store/${store.slug}`;
      const qrCode = await qrCodeGenerator.generateQRCode(qrUrl, store.name);

      // Update QR code in database
      const updateQuery = 'UPDATE "Store" SET "qrCode" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2 RETURNING *';
      const result = await query(updateQuery, [qrCode, storeId]);

      if (result.rows.length === 0) {
        throw new Error('Error al actualizar el QR code');
      }

      return {
        success: true,
        data: result.rows[0],
        message: 'QR code regenerado exitosamente'
      };
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      throw error;
    }
  }
}

module.exports = new SuperAdminService();

