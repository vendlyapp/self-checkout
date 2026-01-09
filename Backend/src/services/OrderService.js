const { query, transaction } = require('../../lib/database');
const discountCodeService = require('./DiscountCodeService');
const invoiceService = require('./InvoiceService');
const storeService = require('./StoreService');

class OrderService {

  async create(userId, orderPayload = {}) {
    const sanitizedUserId = typeof userId === 'string' ? userId.trim() : '';
    if (!sanitizedUserId) {
      throw new Error('El ID del usuario es requerido');
    }

    const itemsPayload = orderPayload.items;
    if (!Array.isArray(itemsPayload) || itemsPayload.length === 0) {
      throw new Error('Los items de la orden son requeridos');
    }

    const normalizedItems = [];
    const uniqueProductIds = new Set();

    for (const rawItem of itemsPayload) {
      const productId = typeof rawItem.productId === 'string' ? rawItem.productId.trim() : '';
      const quantity = Number(rawItem.quantity);

      if (!productId) {
        throw new Error('Cada item debe incluir productId');
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('La cantidad de cada item debe ser un número mayor a cero');
      }

      uniqueProductIds.add(productId);
      normalizedItems.push({
        productId,
        quantity,
        price: rawItem.price !== undefined ? Number(rawItem.price) : null,
      });
    }

    const productsResult = await query(
      `
        SELECT id, price, stock
        FROM "Product"
        WHERE id = ANY($1)
      `,
      [[...uniqueProductIds]],
    );

    if (productsResult.rows.length !== uniqueProductIds.size) {
      throw new Error('Uno o más productos de la orden no existen');
    }

    const productCatalog = new Map(
      productsResult.rows.map((product) => [
        product.id,
        {
          price: Number(product.price),
          stock: Number(product.stock),
        },
      ]),
    );

    let total = 0;

    for (const item of normalizedItems) {
      const product = productCatalog.get(item.productId);
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para el producto ${item.productId}`);
      }

      const resolvedPrice =
        item.price !== null && Number.isFinite(item.price)
          ? Number(item.price)
          : product.price;

      if (!Number.isFinite(resolvedPrice) || resolvedPrice < 0) {
        throw new Error(`Precio inválido para el producto ${item.productId}`);
      }

      item.price = resolvedPrice;
      total += resolvedPrice * item.quantity;
    }

    // Usar el total del payload si viene (ya incluye descuentos), sino calcularlo
    const finalTotal = orderPayload.total !== undefined && Number.isFinite(orderPayload.total)
      ? Number(orderPayload.total)
      : total;

    const result = await transaction(async (client) => {
      // Establecer status como 'completed' por defecto ya que el pago se procesa inmediatamente
      const orderStatus = orderPayload.status || 'completed';
      const paymentMethod = orderPayload.paymentMethod || null;
      const storeId = orderPayload.storeId || null;
      
      // Preparar metadata como JSONB, incluyendo datos del cliente si están disponibles
      let metadataJson = '{}';
      const metadata = orderPayload.metadata && typeof orderPayload.metadata === 'object' 
        ? { ...orderPayload.metadata } 
        : {};
      
      // Agregar datos del cliente a metadata si están disponibles
      if (orderPayload.customer && typeof orderPayload.customer === 'object') {
        metadata.customer = {
          name: orderPayload.customer.name || null,
          email: orderPayload.customer.email || null,
          address: orderPayload.customer.address || null,
          phone: orderPayload.customer.phone || null,
        };
      }
      
      metadataJson = JSON.stringify(metadata);

      const orderQuery = `
        INSERT INTO "Order" ("userId", "total", "status", "paymentMethod", "storeId", "metadata")
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [
        sanitizedUserId,
        finalTotal,
        orderStatus,
        paymentMethod,
        storeId,
        metadataJson
      ]);
      const order = orderResult.rows[0];

      const orderItems = [];

      for (const item of normalizedItems) {
        const updateStockQuery = `
          UPDATE "Product"
          SET stock = stock - $1, "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = $2 AND stock >= $1
          RETURNING id
        `;

        const stockResult = await client.query(updateStockQuery, [item.quantity, item.productId]);

        if (stockResult.rowCount === 0) {
          throw new Error(`Stock insuficiente para el producto ${item.productId}`);
        }

        const itemInsertQuery = `
          INSERT INTO "OrderItem" ("orderId", "productId", "quantity", "price")
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;

        const itemResult = await client.query(itemInsertQuery, [
          order.id,
          item.productId,
          item.quantity,
          item.price,
        ]);

        orderItems.push(itemResult.rows[0]);
      }

      // Incrementar usos del código de descuento si se aplicó uno
      let discountCodeUpdated = null;
      if (orderPayload.metadata && orderPayload.metadata.promoCode) {
        try {
          const promoCode = orderPayload.metadata.promoCode.trim().toUpperCase();
          const incrementResult = await discountCodeService.incrementRedemptions(promoCode);
          discountCodeUpdated = incrementResult.data;
          
          // Si el código alcanzó el límite, desactivarlo automáticamente
          if (discountCodeUpdated.current_redemptions >= discountCodeUpdated.max_redemptions) {
            await client.query(
              'UPDATE "DiscountCode" SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = $1',
              [promoCode]
            );
          }
        } catch (discountError) {
          // No fallar la orden si hay error con el código de descuento
          console.error('Error al incrementar usos del código de descuento:', discountError);
        }
      }

      return { order, items: orderItems, discountCodeUpdated };
    });

    // Crear factura automáticamente después de crear la orden
    let createdInvoice = null;
    try {
      // Obtener productos con sus nombres y SKUs para la factura
      const productIds = result.items.map(item => item.productId);
      const productsQuery = `
        SELECT id, name, sku, price
        FROM "Product"
        WHERE id = ANY($1)
      `;
      const productsResult = await query(productsQuery, [productIds]);
      const productsMap = new Map(
        productsResult.rows.map(p => [p.id, { name: p.name, sku: p.sku, price: Number(p.price) }])
      );

      // Preparar items de la factura
      const invoiceItems = result.items.map(item => {
        const product = productsMap.get(item.productId);
        return {
          productId: item.productId,
          productName: product?.name || 'Producto',
          productSku: product?.sku || '',
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.price) * item.quantity,
        };
      });

      // Obtener datos de la tienda si existe
      let storeInfo = null;
      if (storeId) {
        try {
          const storeResult = await storeService.getById(storeId);
          if (storeResult.success && storeResult.data) {
            storeInfo = storeResult.data;
          }
        } catch (storeError) {
          console.error('Error al obtener datos de la tienda para la factura:', storeError);
        }
      }

      // Parsear metadata para obtener totales y datos del cliente
      let parsedMetadata = {};
      try {
        if (result.order.metadata && typeof result.order.metadata === 'string') {
          parsedMetadata = JSON.parse(result.order.metadata);
        } else if (result.order.metadata && typeof result.order.metadata === 'object') {
          parsedMetadata = result.order.metadata;
        }
      } catch (parseError) {
        console.error('Error al parsear metadata:', parseError);
      }

      // Calcular totales desde metadata si están disponibles
      const subtotal = parsedMetadata.totalBeforeVAT || finalTotal;
      const discountAmount = parsedMetadata.discountAmount || 0;
      const taxAmount = parsedMetadata.totalWithVAT ? (parsedMetadata.totalWithVAT - subtotal + discountAmount) : 0;
      const invoiceTotal = parsedMetadata.totalWithVAT || finalTotal;

      // Preparar datos del cliente desde metadata
      const customerData = parsedMetadata.customer || parsedMetadata.customerData || {};

      // Crear la factura
      const invoiceData = {
        orderId: result.order.id,
        customerName: customerData.name || null,
        customerEmail: customerData.email || null,
        customerAddress: customerData.address || null,
        customerCity: null,
        customerPostalCode: null,
        customerPhone: customerData.phone || null,
        storeId: storeId || null,
        storeName: storeInfo?.name || parsedMetadata.storeName || null,
        storeAddress: storeInfo?.address || null,
        storePhone: storeInfo?.phone || null,
        storeEmail: storeInfo?.email || null,
        items: invoiceItems,
        subtotal: Number(subtotal),
        discountAmount: Number(discountAmount),
        taxAmount: Number(taxAmount),
        total: Number(invoiceTotal),
        paymentMethod: paymentMethod || null,
        metadata: {
          ...parsedMetadata,
          autoCreated: true,
          createdAt: new Date().toISOString(),
        },
      };

      const invoiceResult = await invoiceService.create(invoiceData);
      if (invoiceResult.success && invoiceResult.data) {
        createdInvoice = invoiceResult.data;
        console.log('✅ Factura creada automáticamente:', {
          invoiceId: createdInvoice.id,
          invoiceNumber: createdInvoice.invoiceNumber,
          orderId: result.order.id,
        });
      } else {
        console.error('❌ Error al crear factura - respuesta sin éxito:', invoiceResult);
      }
    } catch (invoiceError) {
      // No fallar la orden si hay error al crear la factura
      console.error('❌ Error al crear factura automáticamente:', invoiceError);
      console.error('❌ Stack trace:', invoiceError.stack);
    }

    return {
      success: true,
      data: {
        ...result.order,
        items: result.items,
        invoiceId: createdInvoice?.id || null,
        invoiceNumber: createdInvoice?.invoiceNumber || null,
      },
      message: 'Orden creada exitosamente',
    };
  }

  async findAll(options = {}) {
    const { limit = 50, offset = 0, status, storeId } = options;

    let whereClause = '';
    const params = [];
    let paramCount = 0;

    // Filtrar por status si se proporciona
    if (status) {
      paramCount++;
      whereClause = `WHERE o.status = $${paramCount}`;
      params.push(status);
    }

    // Filtrar por storeId si se proporciona
    if (storeId) {
      paramCount++;
      if (whereClause) {
        whereClause += ` AND o."storeId" = $${paramCount}`;
      } else {
        whereClause = `WHERE o."storeId" = $${paramCount}`;
      }
      params.push(storeId);
    }

    const selectQuery = `
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM "Order" o
      LEFT JOIN "User" u ON o."userId" = u.id
      ${whereClause}
      ORDER BY o."createdAt" DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    params.push(limit, offset);

    const result = await query(selectQuery, params);
    const orders = result.rows;

    // Obtener items para cada orden
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.*, p.name as productName, p.sku as productSku
        FROM "OrderItem" oi
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE oi."orderId" = $1
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
      LEFT JOIN "User" u ON o."userId" = u.id
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
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = $1
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
      WHERE "userId" = $1
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
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE oi."orderId" = $1
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
      await client.query('DELETE FROM "OrderItem" WHERE "orderId" = $1', [id]);
      // Eliminar orden
      await client.query('DELETE FROM "Order" WHERE id = $1', [id]);
    });

    return {
      success: true,
      message: 'Orden eliminada exitosamente'
    };
  }

  async getStats(options = {}) {
    const { date = null, ownerId = null } = options;
    
    let whereClause = '';
    const params = [];
    let paramCount = 0;

    // Filtrar por fecha si se proporciona (para obtener estadísticas del día)
    if (date) {
      paramCount++;
      // Usar CAST para mejor compatibilidad con Supabase
      whereClause = `WHERE "createdAt"::date = $${paramCount}::date`;
      params.push(date);
    }

    // Filtrar por ownerId si se proporciona (para obtener estadísticas de una tienda específica)
    if (ownerId) {
      paramCount++;
      if (whereClause) {
        whereClause += ` AND "userId" = $${paramCount}`;
      } else {
        whereClause = `WHERE "userId" = $${paramCount}`;
      }
      params.push(ownerId);
    }

    const statsQuery = `
      SELECT
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageOrderValue,
        COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as recentOrders,
        COUNT(DISTINCT "userId") as uniqueCustomers
      FROM "Order"
      ${whereClause}
    `;

    const result = await query(statsQuery, params);
    const stats = result.rows[0];

    return {
      success: true,
      data: {
        totalOrders: parseInt(stats.totalorders) || 0,
        totalRevenue: parseFloat(stats.totalrevenue) || 0,
        averageOrderValue: parseFloat(stats.averageordervalue) || 0,
        recentOrders: parseInt(stats.recentorders) || 0,
        uniqueCustomers: parseInt(stats.uniquecustomers) || 0
      }
    };
  }

  async getRecentOrders(limit = 10, status = null) {
    let whereClause = '';
    const params = [];
    let paramCount = 0;

    // Filtrar por status si se proporciona
    if (status) {
      paramCount++;
      whereClause = `WHERE o.status = $${paramCount}`;
      params.push(status);
    }

    paramCount++;
    params.push(limit);

    const selectQuery = `
      SELECT o.*, u.name as userName, u.email as userEmail
      FROM "Order" o
      LEFT JOIN "User" u ON o."userId" = u.id
      ${whereClause}
      ORDER BY o."createdAt" DESC
      LIMIT $${paramCount}
    `;

    const result = await query(selectQuery, params);
    const orders = result.rows;

    // Obtener items para cada orden
    for (const order of orders) {
      const itemsQuery = `
        SELECT oi.*, p.name as productName, p.sku as productSku
        FROM "OrderItem" oi
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE oi."orderId" = $1
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

    // Usar el total del orderData si viene (ya incluye descuentos), sino calcularlo
    const finalTotal = orderData.total !== undefined && Number.isFinite(orderData.total)
      ? Number(orderData.total)
      : total;

    // Crear orden usando transacción
    const result = await transaction(async (client) => {
      // Establecer status como 'completed' por defecto ya que el pago se procesa inmediatamente
      const orderStatus = orderData.status || 'completed';
      const paymentMethod = orderData.paymentMethod || null;
      const storeId = orderData.storeId || null;
      
      // Preparar metadata como JSONB, incluyendo datos del cliente si están disponibles
      let metadataJson = '{}';
      const metadata = orderData.metadata && typeof orderData.metadata === 'object' 
        ? { ...orderData.metadata } 
        : {};
      
      // Agregar datos del cliente a metadata si están disponibles
      if (orderData.customer && typeof orderData.customer === 'object') {
        metadata.customer = {
          name: orderData.customer.name || null,
          email: orderData.customer.email || null,
          address: orderData.customer.address || null,
          phone: orderData.customer.phone || null,
        };
      }
      
      metadataJson = JSON.stringify(metadata);

      // Crear orden
      const orderQuery = `
        INSERT INTO "Order" ("userId", "total", "status", "paymentMethod", "storeId", "metadata")
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING *
      `;
      const orderResult = await client.query(orderQuery, [
        orderData.userId,
        finalTotal,
        orderStatus,
        paymentMethod,
        storeId,
        metadataJson
      ]);
      const order = orderResult.rows[0];

      // Crear items de la orden
      const orderItems = [];
      for (const item of itemsWithPrices) {
        const itemQuery = `
          INSERT INTO "OrderItem" ("orderId", "productId", "quantity", "price")
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

      // Incrementar usos del código de descuento si se aplicó uno
      let discountCodeUpdated = null;
      if (orderData.metadata && orderData.metadata.promoCode) {
        try {
          const promoCode = orderData.metadata.promoCode.trim().toUpperCase();
          const incrementResult = await discountCodeService.incrementRedemptions(promoCode);
          discountCodeUpdated = incrementResult.data;
          
          // Si el código alcanzó el límite, desactivarlo automáticamente
          if (discountCodeUpdated.current_redemptions >= discountCodeUpdated.max_redemptions) {
            await client.query(
              'UPDATE "DiscountCode" SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE code = $1',
              [promoCode]
            );
          }
        } catch (discountError) {
          // No fallar la orden si hay error con el código de descuento
          console.error('Error al incrementar usos del código de descuento:', discountError);
        }
      }

      return { order, items: orderItems, discountCodeUpdated };
    });

    // Crear factura automáticamente después de crear la orden
    let createdInvoice = null;
    try {
      // Obtener productos con sus nombres y SKUs para la factura
      const productIds = result.items.map(item => item.productId);
      const productsQuery = `
        SELECT id, name, sku, price
        FROM "Product"
        WHERE id = ANY($1)
      `;
      const productsResult = await query(productsQuery, [productIds]);
      const productsMap = new Map(
        productsResult.rows.map(p => [p.id, { name: p.name, sku: p.sku, price: Number(p.price) }])
      );

      // Preparar items de la factura
      const invoiceItems = result.items.map(item => {
        const product = productsMap.get(item.productId);
        return {
          productId: item.productId,
          productName: product?.name || 'Producto',
          productSku: product?.sku || '',
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.price) * item.quantity,
        };
      });

      // Obtener datos de la tienda si existe
      let storeInfo = null;
      if (orderData.storeId) {
        try {
          const storeResult = await storeService.getById(orderData.storeId);
          if (storeResult.success && storeResult.data) {
            storeInfo = storeResult.data;
          }
        } catch (storeError) {
          console.error('Error al obtener datos de la tienda para la factura:', storeError);
        }
      }

      // Calcular totales desde metadata si están disponibles
      const subtotal = metadata.totalBeforeVAT || finalTotal;
      const discountAmount = metadata.discountAmount || 0;
      const taxAmount = metadata.totalWithVAT ? (metadata.totalWithVAT - subtotal + discountAmount) : 0;
      const invoiceTotal = metadata.totalWithVAT || finalTotal;

      // Preparar datos del cliente desde metadata
      const customerData = metadata.customer || metadata.customerData || {};

      // Crear la factura
      const invoiceData = {
        orderId: result.order.id,
        customerName: customerData.name || null,
        customerEmail: customerData.email || null,
        customerAddress: customerData.address || null,
        customerCity: null,
        customerPostalCode: null,
        customerPhone: customerData.phone || null,
        storeId: orderData.storeId || null,
        storeName: storeInfo?.name || metadata.storeName || null,
        storeAddress: storeInfo?.address || null,
        storePhone: storeInfo?.phone || null,
        storeEmail: storeInfo?.email || null,
        items: invoiceItems,
        subtotal: Number(subtotal),
        discountAmount: Number(discountAmount),
        taxAmount: Number(taxAmount),
        total: Number(invoiceTotal),
        paymentMethod: orderData.paymentMethod || null,
        metadata: {
          ...metadata,
          autoCreated: true,
          createdAt: new Date().toISOString(),
        },
      };

      const invoiceResult = await invoiceService.create(invoiceData);
      if (invoiceResult.success && invoiceResult.data) {
        createdInvoice = invoiceResult.data;
        console.log('✅ Factura creada automáticamente:', {
          invoiceId: createdInvoice.id,
          invoiceNumber: createdInvoice.invoiceNumber,
          orderId: result.order.id,
        });
      } else {
        console.error('❌ Error al crear factura - respuesta sin éxito:', invoiceResult);
      }
    } catch (invoiceError) {
      // No fallar la orden si hay error al crear la factura
      console.error('❌ Error al crear factura automáticamente:', invoiceError);
      console.error('❌ Stack trace:', invoiceError.stack);
    }

    return {
      success: true,
      data: {
        ...result.order,
        items: result.items,
        invoiceId: createdInvoice?.id || null,
        invoiceNumber: createdInvoice?.invoiceNumber || null,
      },
      message: 'Orden creada exitosamente'
    };
  }
}

module.exports = new OrderService();
