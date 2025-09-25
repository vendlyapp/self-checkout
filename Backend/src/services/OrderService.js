const { query, transaction } = require('../../lib/database');

class OrderService {

  async create(orderData) {
    // Validaciones
    if (!orderData.userId || !orderData.userId.trim()) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Los items de la orden son requeridos');
    }

    // Calcular total
    let total = 0;
    for (const item of orderData.items) {
      if (!item.productId || !item.quantity || !item.price) {
        throw new Error('Cada item debe tener productId, quantity y price');
      }
      total += parseFloat(item.price) * parseInt(item.quantity);
    }

    // Crear orden usando transacción
    const result = await transaction(async (client) => {
      // Crear orden
      const orderQuery = `
        INSERT INTO "Order" (userId, total)
        VALUES ($1, $2)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [orderData.userId, total]);
      const order = orderResult.rows[0];

      // Crear items de la orden
      const orderItems = [];
      for (const item of orderData.items) {
        const itemQuery = `
          INSERT INTO "OrderItem" (orderId, productId, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const itemResult = await client.query(itemQuery, [
          order.id,
          item.productId,
          parseInt(item.quantity),
          parseFloat(item.price)
        ]);
        orderItems.push(itemResult.rows[0]);
      }

      return { order, items: orderItems };
    });

    return {
      success: true,
      data: {
        ...result.order,
        items: result.items
      },
      message: 'Orden creada exitosamente'
    };
  }

  async findAll(options = {}) {
    const { limit = 50, offset = 0 } = options;

    const selectQuery = `
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM "Order" o
      LEFT JOIN "User" u ON o.userId = u.id
      ORDER BY o."createdAt" DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(selectQuery, [limit, offset]);
    const orders = result.rows;

    // Obtener items para cada orden
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.*, p.name as productName, p.sku as productSku
        FROM "OrderItem" oi
        LEFT JOIN "Product" p ON oi.productId = p.id
        WHERE oi.orderId = $1
      `;
      const itemsResult = await query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
    }

    // Contar total
    const countResult = await query('SELECT COUNT(*) FROM "Order"');
    const total = parseInt(countResult.rows[0].count);

    return {
      success: true,
      data: orders,
      count: orders.length,
      total: total
    };
  }

  async findById(id) {
    const selectQuery = `
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM "Order" o
      LEFT JOIN "User" u ON o.userId = u.id
      WHERE o.id = $1
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Orden no encontrada');
    }

    const order = result.rows[0];

    // Obtener items
    const itemsQuery = `
      SELECT oi.*, p.name as productName, p.sku as productSku
      FROM "OrderItem" oi
      LEFT JOIN "Product" p ON oi.productId = p.id
      WHERE oi.orderId = $1
    `;
    const itemsResult = await query(itemsQuery, [id]);
    order.items = itemsResult.rows;

    return {
      success: true,
      data: order
    };
  }

  async findByUserId(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const selectQuery = `
      SELECT * FROM "Order"
      WHERE userId = $1
      ORDER BY "createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(selectQuery, [userId, limit, offset]);
    const orders = result.rows;

    // Obtener items para cada orden
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.*, p.name as productName, p.sku as productSku
        FROM "OrderItem" oi
        LEFT JOIN "Product" p ON oi.productId = p.id
        WHERE oi.orderId = $1
      `;
      const itemsResult = await query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
    }

    return {
      success: true,
      data: orders,
      count: orders.length
    };
  }

  async update(id, orderData) {
    // Verificar que la orden existe
    const existingOrder = await this.findById(id);
    if (!existingOrder.success) {
      throw new Error('Orden no encontrada');
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const updatableFields = ['total'];

    for (const field of updatableFields) {
      if (orderData[field] !== undefined) {
        paramCount++;
        updateFields.push(`"${field}" = $${paramCount}`);
        values.push(parseFloat(orderData[field]));
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    // Agregar ID como último parámetro
    paramCount++;
    values.push(id);

    const updateQuery = `
      UPDATE "Order"
      SET ${updateFields.join(', ')}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const order = result.rows[0];

    return {
      success: true,
      data: order,
      message: 'Orden actualizada exitosamente'
    };
  }

  async delete(id) {
    // Verificar que la orden existe
    const existingOrder = await this.findById(id);
    if (!existingOrder.success) {
      throw new Error('Orden no encontrada');
    }

    // Eliminar usando transacción
    await transaction(async (client) => {
      // Eliminar items primero
      await client.query('DELETE FROM "OrderItem" WHERE orderId = $1', [id]);
      // Eliminar orden
      await client.query('DELETE FROM "Order" WHERE id = $1', [id]);
    });

    return {
      success: true,
      message: 'Orden eliminada exitosamente'
    };
  }

  async getStats() {
    const statsQuery = `
      SELECT
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageOrderValue,
        COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as recentOrders
      FROM "Order"
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        totalOrders: parseInt(stats.totalorders),
        totalRevenue: parseFloat(stats.totalrevenue),
        averageOrderValue: parseFloat(stats.averageordervalue),
        recentOrders: parseInt(stats.recentorders)
      }
    };
  }

  async getRecentOrders(limit = 10) {
    const selectQuery = `
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM "Order" o
      LEFT JOIN "User" u ON o.userId = u.id
      ORDER BY o."createdAt" DESC
      LIMIT $1
    `;

    const result = await query(selectQuery, [limit]);
    const orders = result.rows;

    // Obtener items para cada orden
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.*, p.name as productName, p.sku as productSku
        FROM "OrderItem" oi
        LEFT JOIN "Product" p ON oi.productId = p.id
        WHERE oi.orderId = $1
      `;
      const itemsResult = await query(itemsQuery, [order.id]);
      order.items = itemsResult.rows;
    }

    return {
      success: true,
      data: orders,
      count: orders.length
    };
  }

  async createOrderSimple(orderData) {
    // Validaciones
    if (!orderData.userId || !orderData.userId.trim()) {
      throw new Error('El ID del usuario es requerido');
    }

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Los items de la orden son requeridos');
    }

    // Obtener precios de productos y calcular total
    let total = 0;
    const itemsWithPrices = [];

    for (const item of orderData.items) {
      if (!item.productId || !item.quantity) {
        throw new Error('Cada item debe tener productId y quantity');
      }

      // Obtener precio del producto
      const productQuery = 'SELECT price FROM "Product" WHERE id = $1';
      const productResult = await query(productQuery, [item.productId]);

      if (productResult.rows.length === 0) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      const productPrice = parseFloat(productResult.rows[0].price);
      const itemTotal = productPrice * parseInt(item.quantity);
      total += itemTotal;

      itemsWithPrices.push({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        price: productPrice
      });
    }

    // Crear orden usando transacción
    const result = await transaction(async (client) => {
      // Crear orden
      const orderQuery = `
        INSERT INTO "Order" (userId, total)
        VALUES ($1, $2)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [orderData.userId, total]);
      const order = orderResult.rows[0];

      // Crear items de la orden
      const orderItems = [];
      for (const item of itemsWithPrices) {
        const itemQuery = `
          INSERT INTO "OrderItem" (orderId, productId, quantity, price)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        const itemResult = await client.query(itemQuery, [
          order.id,
          item.productId,
          item.quantity,
          item.price
        ]);
        orderItems.push(itemResult.rows[0]);
      }

      return { order, items: orderItems };
    });

    return {
      success: true,
      data: {
        ...result.order,
        items: result.items
      },
      message: 'Orden creada exitosamente'
    };
  }
}

module.exports = new OrderService();
