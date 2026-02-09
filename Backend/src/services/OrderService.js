const { query, transaction } = require('../../lib/database');
const discountCodeService = require('./DiscountCodeService');
const invoiceService = require('./InvoiceService');
const storeService = require('./StoreService');
const customerService = require('./CustomerService');

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
        throw new Error('Jede Position muss eine productId enthalten');
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error('Die Menge jeder Position muss eine Zahl grösser als null sein');
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
      throw new Error('Ein oder mehrere Produkte der Bestellung existieren nicht');
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
        throw new Error(`Produkt ${item.productId} nicht gefunden`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Unzureichender Lagerbestand für Produkt ${item.productId}`);
      }

      const resolvedPrice =
        item.price !== null && Number.isFinite(item.price)
          ? Number(item.price)
          : product.price;

      if (!Number.isFinite(resolvedPrice) || resolvedPrice < 0) {
        throw new Error(`Ungültiger Preis für Produkt ${item.productId}`);
      }

      item.price = resolvedPrice;
      total += resolvedPrice * item.quantity;
    }

    // Usar el total del payload si viene (ya incluye descuentos), sino calcularlo
    const finalTotal = orderPayload.total !== undefined && Number.isFinite(orderPayload.total)
      ? Number(orderPayload.total)
      : total;

    // Extraer storeId y paymentMethod antes de la transacción para usarlos después
    const storeId = orderPayload.storeId || null;
    const paymentMethod = orderPayload.paymentMethod || null;

    const result = await transaction(async (client) => {
      // Establecer status como 'completed' por defecto ya que el pago se procesa inmediatamente
      const orderStatus = orderPayload.status || 'completed';
      
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
          throw new Error(`Unzureichender Lagerbestand für Produkt ${item.productId}`);
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
    console.log('🚀 [OrderService.create] Bestellung erfolgreich erstellt. Starte automatische Rechnungserstellung...', {
      orderId: result.order.id,
      itemsCount: result.items.length,
      storeId: storeId,
      total: finalTotal,
    });
    
    let createdInvoice = null;
    let invoiceData = null; // Declarar fuera del try para que esté disponible en el catch
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
      
      console.log('📋 [OrderService.create] Datos del cliente extraídos:', {
        hasCustomerData: !!customerData && Object.keys(customerData).length > 0,
        customerName: customerData.name || 'No proporcionado',
        customerEmail: customerData.email || 'No proporcionado',
        parsedMetadataKeys: Object.keys(parsedMetadata),
      });

      // NO crear la factura automáticamente aquí
      // La factura se creará desde el frontend después de que el usuario decida sobre sus datos
      console.log('ℹ️ [OrderService.create] Factura se creará desde el frontend después de que el usuario decida sobre sus datos');
      
      // Mantener invoiceData como null para indicar que no se creó automáticamente
      invoiceData = null;
    } catch (invoiceError) {
      // No fallar la orden si hay error al crear la factura
      console.error('❌ [OrderService.create] Error al crear factura automáticamente:', invoiceError);
      console.error('❌ [OrderService.create] Mensaje de error:', invoiceError.message);
      console.error('❌ [OrderService.create] Stack trace:', invoiceError.stack);
      if (invoiceData) {
        console.error('❌ [OrderService.create] Datos de factura que causaron el error:', JSON.stringify({
          orderId: invoiceData.orderId,
          storeId: invoiceData.storeId,
          customerName: invoiceData.customerName,
          itemsCount: invoiceData.items?.length,
        }, null, 2));
      }
    }

    return {
      success: true,
      data: {
        ...result.order,
        items: result.items,
        invoiceId: createdInvoice?.id || null,
        invoiceNumber: createdInvoice?.invoiceNumber || null,
        invoiceShareToken: createdInvoice?.shareToken || null, // Agregar shareToken para acceso público
      },
      message: 'Bestellung erfolgreich erstellt',
    };
  }

  async findAll(options = {}) {
    const { limit = 50, offset = 0, status, storeId } = options;

    let whereClause = '';
    const params = [];
    let paramCount = 0;
    let ownerId = null;

    // Si se proporciona storeId, obtener el ownerId de la tienda
    if (storeId) {
      const storeService = require('./StoreService');
      const store = await storeService.getById(storeId);
      if (!store) {
        // Si la tienda no existe, retornar lista vacía
        return {
          success: true,
          data: [],
          count: 0,
          total: 0
        };
      }
      if (store.ownerId) {
        ownerId = store.ownerId;
      } else {
        // Si la tienda no tiene ownerId, retornar lista vacía
        return {
          success: true,
          data: [],
          count: 0,
          total: 0
        };
      }
    }

    // Si tenemos ownerId, filtrar órdenes por productos de ese owner
    if (ownerId) {
      // Filtrar órdenes que tengan al menos un producto del owner
      const selectQuery = `
        SELECT DISTINCT o.*, u.name as "userName", u.email as "userEmail"
        FROM "Order" o
        INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
        INNER JOIN "Product" p ON oi."productId" = p.id
        LEFT JOIN "User" u ON o."userId" = u.id
        WHERE p."ownerId" = $1
        ${status ? `AND o.status = $2` : ''}
        ORDER BY o."createdAt" DESC
        LIMIT $${status ? 3 : 2} OFFSET $${status ? 4 : 3}
      `;
      
      const queryParams = [ownerId];
      if (status) {
        queryParams.push(status);
      }
      queryParams.push(limit, offset);

      const result = await query(selectQuery, queryParams);
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

      // Contar total de órdenes para este owner
      const countQuery = `
        SELECT COUNT(DISTINCT o.id) as total
        FROM "Order" o
        INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
        INNER JOIN "Product" p ON oi."productId" = p.id
        WHERE p."ownerId" = $1
        ${status ? `AND o.status = $2` : ''}
      `;
      const countParams = [ownerId];
      if (status) {
        countParams.push(status);
      }
      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      return {
        success: true,
        data: orders,
        count: orders.length,
        total: total
      };
    }

    // Si se proporcionó storeId pero no se obtuvo ownerId, retornar lista vacía
    // (esto no debería pasar porque ya se validó arriba, pero por seguridad)
    if (storeId) {
      return {
        success: true,
        data: [],
        count: 0,
        total: 0
      };
    }

    // Si no hay storeId, usar el filtro original (sin filtro por tienda)
    // Filtrar por status si se proporciona
    if (status) {
      paramCount++;
      whereClause = `WHERE o.status = $${paramCount}`;
      params.push(status);
    }

    const selectQuery = `
      SELECT o.*, u.name as "userName", u.email as "userEmail"
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
    const countWhereClause = status ? `WHERE status = $1` : '';
    const countParams = status ? [status] : [];
    const countResult = await query(`SELECT COUNT(*) FROM "Order" ${countWhereClause}`, countParams);
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
      SELECT o.*, u.name as "userName", u.email as "userEmail"
      FROM "Order" o
      LEFT JOIN "User" u ON o."userId" = u.id
      WHERE o.id = $1
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      throw new Error('Bestellung nicht gefunden');
    }

    const order = result.rows[0];

    // Obtener items con información del producto
    const itemsQuery = `
      SELECT oi.*, p.name as "productName", p.sku as "productSku", p."taxRate"
      FROM "OrderItem" oi
      LEFT JOIN "Product" p ON oi."productId" = p.id
      WHERE oi."orderId" = $1
    `;
    const itemsResult = await query(itemsQuery, [id]);
    order.items = itemsResult.rows;
    
    // Debug: verificar que los items tengan productName
    const itemsWithoutName = order.items.filter(item => !item.productName);
    if (itemsWithoutName.length > 0) {
      console.warn('⚠️ [OrderService.findById] Items sin productName:', {
        orderId: id,
        itemsWithoutName: itemsWithoutName.map(i => ({ productId: i.productId, hasProductName: !!i.productName })),
      });
    }

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
      throw new Error('Bestellung nicht gefunden');
    }

    // Construir query de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    // Campos que se pueden actualizar
    const updatableFields = ['total', 'status'];

    for (const field of updatableFields) {
      if (orderData[field] !== undefined) {
        paramCount++;
        if (field === 'status') {
          // Validar status
          const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
          if (!validStatuses.includes(orderData[field])) {
            throw new Error(`Ungültiger Status. Muss einer von sein: ${validStatuses.join(', ')}`);
          }
          updateFields.push(`"${field}" = $${paramCount}`);
          values.push(orderData[field]);
        } else {
          updateFields.push(`"${field}" = $${paramCount}`);
          values.push(parseFloat(orderData[field]));
        }
      }
    }

    if (updateFields.length === 0) {
      throw new Error('Keine Felder zum Aktualisieren');
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

    // Si se cancela la orden, también cancelar las facturas asociadas
    if (orderData.status === 'cancelled') {
      try {
        const invoiceService = require('./InvoiceService');
        const invoicesResult = await invoiceService.findByOrderId(id);
        if (invoicesResult.success && invoicesResult.data) {
          for (const invoice of invoicesResult.data) {
            await invoiceService.updateStatus(invoice.id, 'cancelled');
          }
        }
      } catch (error) {
        console.error('Error al cancelar facturas asociadas:', error);
        // No fallar la operación si hay error al cancelar facturas
      }
    }

    return {
      success: true,
      data: order,
      message: 'Bestellung erfolgreich aktualisiert'
    };
  }

  /**
   * Actualiza el estado de una orden
   */
  async updateStatus(id, status) {
    return this.update(id, { status });
  }

  /**
   * Actualiza los datos del cliente en la orden.
   * La orden se crea primero (sin datos → usuario invitado). Si luego el cliente registra
   * sus datos en la factura, se llama esto para que la orden quede a nombre del cliente.
   * Si el cliente no registra datos, la orden sigue como invitado/Kunde (no se llama).
   */
  async updateOrderCustomerData(orderId, customerData) {
    if (!customerData || (typeof customerData !== 'object')) {
      return { success: true };
    }
    const name = customerData.name != null ? String(customerData.name).trim() : null;
    const email = customerData.email != null ? String(customerData.email).trim() : null;
    const address = customerData.address != null ? String(customerData.address).trim() : null;
    const phone = customerData.phone != null ? String(customerData.phone).trim() : null;
    if (!name && !email && !address && !phone) {
      return { success: true };
    }

    const orderResult = await this.findById(orderId);
    if (!orderResult.success || !orderResult.data) {
      return { success: false, error: 'Bestellung nicht gefunden' };
    }

    const order = orderResult.data;
    let metadata = order.metadata;
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = {};
      }
    }
    if (!metadata || typeof metadata !== 'object') {
      metadata = {};
    }

    const customer = {
      name: name || metadata.customer?.name || metadata.customerData?.name || null,
      email: email || metadata.customer?.email || metadata.customerData?.email || null,
      address: address || metadata.customer?.address || metadata.customerData?.address || null,
      phone: phone || metadata.customer?.phone || metadata.customerData?.phone || null,
    };
    metadata.customer = customer;
    metadata.customerData = customer;

    const metadataJson = JSON.stringify(metadata);
    await query(
      'UPDATE "Order" SET metadata = $1::jsonb, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2',
      [metadataJson, orderId]
    );

    return { success: true };
  }

  async delete(id) {
    // Verificar que la orden existe
    const existingOrder = await this.findById(id);
    if (!existingOrder.success) {
      throw new Error('Bestellung nicht gefunden');
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
      message: 'Bestellung erfolgreich gelöscht'
    };
  }

  async getStats(options = {}) {
    const { date = null, ownerId = null } = options;

    // Si tenemos ownerId, filtrar órdenes por productos de ese owner
    // Contamos todas las órdenes no canceladas (pending, processing, completed cuentan)
    if (ownerId) {
      const params = [ownerId];
      // Fecha en zona horaria Europa/Zurich para que "hoy" del frontend coincida
      const dateFilter = date
        ? `AND (o."createdAt" AT TIME ZONE 'Europe/Zurich')::date = $2::date`
        : '';
      if (date) params.push(date);

      // Subquery: una fila por orden para que SUM(total) no duplique por OrderItems
      const statsQuery = `
        WITH orders_of_owner AS (
          SELECT DISTINCT o.id, o.total, o."userId", o."createdAt"
          FROM "Order" o
          INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
          INNER JOIN "Product" p ON oi."productId" = p.id
          WHERE p."ownerId" = $1
          AND (o.status IS NULL OR o.status != 'cancelled')
          ${dateFilter}
        )
        SELECT
          COUNT(*)::int as totalOrders,
          COALESCE(SUM(total), 0)::double precision as totalRevenue,
          COALESCE(AVG(total), 0)::double precision as averageOrderValue,
          COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days')::int as recentOrders,
          COUNT(DISTINCT "userId")::int as uniqueCustomers
        FROM orders_of_owner
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

    // Si no hay ownerId, usar el filtro original (sin filtro por tienda)
    // Contamos todas las órdenes no canceladas
    const params = [];
    let paramCount = 0;
    let dateFilter = '';
    if (date) {
      paramCount++;
      dateFilter = `AND ("createdAt" AT TIME ZONE 'Europe/Zurich')::date = $${paramCount}::date`;
      params.push(date);
    }

    const statsQuery = `
      SELECT
        COUNT(*) as totalOrders,
        COALESCE(SUM(total), 0) as totalRevenue,
        COALESCE(AVG(total), 0) as averageOrderValue,
        COUNT(*) FILTER (WHERE "createdAt" >= CURRENT_DATE - INTERVAL '30 days') as recentOrders,
        COUNT(DISTINCT "userId") as uniqueCustomers
      FROM "Order"
      WHERE (status IS NULL OR status != 'cancelled')
      ${dateFilter}
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

  async getRecentOrders(limit = 10, status = null, storeId = null) {
    let ownerId = null;

    // Si se proporciona storeId, obtener el ownerId de la tienda
    if (storeId) {
      const storeService = require('./StoreService');
      const store = await storeService.getById(storeId);
      if (!store) {
        // Si la tienda no existe, retornar lista vacía
        return {
          success: true,
          data: [],
          count: 0
        };
      }
      if (store.ownerId) {
        ownerId = store.ownerId;
      } else {
        // Si la tienda no tiene ownerId, retornar lista vacía
        return {
          success: true,
          data: [],
          count: 0
        };
      }
    }

    // Si tenemos ownerId, filtrar órdenes por productos de ese owner
    if (ownerId) {
      let whereClause = 'WHERE p."ownerId" = $1';
      const params = [ownerId];
      let paramCount = 1;

      // Filtrar por status si se proporciona
      if (status) {
        paramCount++;
        whereClause += ` AND o.status = $${paramCount}`;
        params.push(status);
      }

      paramCount++;
      params.push(limit);

      const selectQuery = `
        SELECT DISTINCT o.*, u.name as "userName", u.email as "userEmail"
        FROM "Order" o
        INNER JOIN "OrderItem" oi ON o.id = oi."orderId"
        INNER JOIN "Product" p ON oi."productId" = p.id
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

      await this._applyInvoiceCustomerNameFallback(orders);

      return {
        success: true,
        data: orders,
        count: orders.length
      };
    }

    // Si se proporcionó storeId pero no se obtuvo ownerId, retornar lista vacía
    if (storeId) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    // Si no hay storeId, usar el filtro original (sin filtro por tienda)
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
      SELECT o.*, u.name as "userName", u.email as "userEmail"
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

    await this._applyInvoiceCustomerNameFallback(orders);

    return {
      success: true,
      data: orders,
      count: orders.length
    };
  }

  /**
   * Si la orden muestra "Invitado de X" pero existe una factura con nombre real, usar ese nombre.
   */
  async _applyInvoiceCustomerNameFallback(orders) {
    if (!orders || orders.length === 0) return;
    const orderIds = orders.map((o) => o.id);
    const invResult = await query(
      'SELECT "orderId", "customerName" FROM "Invoice" WHERE "orderId" = ANY($1) AND "customerName" IS NOT NULL AND TRIM("customerName") != \'\'',
      [orderIds]
    );
    const nameByOrderId = {};
    for (const row of invResult.rows) {
      const name = row.customerName && String(row.customerName).trim();
      if (name && !nameByOrderId[row.orderId]) nameByOrderId[row.orderId] = name;
    }
    for (const order of orders) {
      const meta = order.metadata && typeof order.metadata === 'object' ? order.metadata : {};
      const hasCustomerName = (meta.customer && meta.customer.name) || (meta.customerData && meta.customerData.name);
      const userName = order.userName || '';
      const isInvitado = /^Invitado(\s|$)/i.test(userName);
      if (!hasCustomerName && isInvitado && nameByOrderId[order.id]) {
        order.userName = nameByOrderId[order.id];
      }
    }
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
        throw new Error('Jede Position muss productId und quantity haben');
      }

      // Obtener precio del producto
      const productQuery = 'SELECT price FROM "Product" WHERE id = $1';
      const productResult = await query(productQuery, [item.productId]);

      if (productResult.rows.length === 0) {
        throw new Error(`Produkt mit ID ${item.productId} nicht gefunden`);
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

    // Preparar metadata y customer data ANTES de la transacción para usarlos después
    const storeId = orderData.storeId || null;
    const customerData = orderData.customer && typeof orderData.customer === 'object' 
      ? {
          name: orderData.customer.name || null,
          email: orderData.customer.email || null,
          address: orderData.customer.address || null,
          phone: orderData.customer.phone || null,
          city: orderData.customer.city || null,
          postalCode: orderData.customer.postalCode || null,
        }
      : null;

    // Crear orden usando transacción
    const result = await transaction(async (client) => {
      // Establecer status como 'completed' por defecto ya que el pago se procesa inmediatamente
      const orderStatus = orderData.status || 'completed';
      const paymentMethod = orderData.paymentMethod || null;
      
      // Preparar metadata como JSONB, incluyendo datos del cliente si están disponibles
      let metadataJson = '{}';
      const metadata = orderData.metadata && typeof orderData.metadata === 'object' 
        ? { ...orderData.metadata } 
        : {};
      
      // Agregar datos del cliente a metadata si están disponibles
      if (customerData) {
        metadata.customer = customerData;
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

    // Crear o actualizar cliente automáticamente si hay datos del cliente y storeId
    // El email es obligatorio para crear/identificar un cliente
    let customer = null;
    if (storeId && customerData && customerData.email) {
      try {
        const customerResult = await customerService.createOrUpdate(storeId, customerData);

        if (customerResult.success) {
          customer = customerResult.data;

          // Actualizar la orden con el customerId
          await query(
            `UPDATE "Order" SET "customerId" = $1 WHERE "id" = $2`,
            [customer.id, result.order.id]
          );

          // Actualizar estadísticas del cliente
          await customerService.updateStats(customer.id);
        }
      } catch (customerError) {
        // No fallar la orden si hay error al crear/actualizar el cliente
        console.error('Error al crear/actualizar cliente:', customerError);
      }
    }

    // Crear factura automáticamente después de crear la orden
    let createdInvoice = null;
    let invoiceData = null; // Declarar fuera del try para que esté disponible en el catch
    try {
      // Obtener productos con sus nombres, SKUs y taxRate para la factura
      const productIds = result.items.map(item => item.productId);
      const productsQuery = `
        SELECT id, name, sku, price, "taxRate"
        FROM "Product"
        WHERE id = ANY($1)
      `;
      const productsResult = await query(productsQuery, [productIds]);
      const productsMap = new Map(
        productsResult.rows.map(p => [p.id, { 
          name: p.name, 
          sku: p.sku, 
          price: Number(p.price),
          taxRate: p.taxRate !== null ? Number(p.taxRate) : 0.026 // Default 2.6% if null
        }])
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
          metadata: {
            taxRate: product?.taxRate || 0.026 // Include taxRate in metadata
          }
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

      // SIEMPRE crear la factura, incluso sin datos del cliente
      // Si no hay datos del cliente, usar "Gast" (cliente invitado)
      invoiceData = {
        orderId: result.order.id,
        customerName: customerData.name || 'Gast', // Cliente invitado si no hay datos
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
          isGuest: !customerData.name && !customerData.email, // Marcar como invitado si no hay datos
          createdAt: new Date().toISOString(),
        },
      };

      // NO crear la factura automáticamente aquí
      // La factura se creará desde el frontend después de que el usuario decida sobre sus datos
      console.log('ℹ️ [OrderService.createSimple] Factura se creará desde el frontend después de que el usuario decida sobre sus datos');
      
      // Mantener invoiceData como null para indicar que no se creó automáticamente
      invoiceData = null;
    } catch (invoiceError) {
      // No fallar la orden si hay error al crear la factura
      console.error('❌ [OrderService.createSimple] Error:', invoiceError);
    }

    return {
      success: true,
      data: {
        ...result.order,
        items: result.items,
        invoiceId: createdInvoice?.id || null,
        invoiceNumber: createdInvoice?.invoiceNumber || null,
        invoiceShareToken: createdInvoice?.shareToken || null, // Agregar shareToken para acceso público
      },
      message: 'Orden creada exitosamente'
    };
  }
}

module.exports = new OrderService();
