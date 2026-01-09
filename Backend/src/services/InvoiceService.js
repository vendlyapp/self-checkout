const { query, transaction } = require('../../lib/database');

class InvoiceService {
  /**
   * Genera un número de factura único
   * Formato: INV-YYYYMMDD-XXXXXX (ej: INV-20260109-ABC123)
   */
  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${year}${month}${day}-${random}`;
  }

  /**
   * Crea una nueva factura
   */
  async create(invoiceData) {
    const {
      orderId,
      customerName,
      customerEmail,
      customerAddress,
      customerCity,
      customerPostalCode,
      customerPhone,
      storeId,
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      items,
      subtotal,
      discountAmount = 0,
      taxAmount = 0,
      total,
      paymentMethod,
      metadata = {},
    } = invoiceData;

    if (!orderId) {
      throw new Error('El ID de la orden es requerido');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Los items de la factura son requeridos');
    }

    // Generar número de factura único
    let invoiceNumber;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      invoiceNumber = this.generateInvoiceNumber();
      const checkQuery = await query(
        'SELECT id FROM "Invoice" WHERE "invoiceNumber" = $1',
        [invoiceNumber]
      );
      if (checkQuery.rows.length === 0) {
        break;
      }
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('No se pudo generar un número de factura único');
      }
    } while (true);

    const result = await transaction(async (client) => {
      const insertQuery = `
        INSERT INTO "Invoice" (
          "orderId",
          "invoiceNumber",
          "customerName",
          "customerEmail",
          "customerAddress",
          "customerCity",
          "customerPostalCode",
          "customerPhone",
          "storeId",
          "storeName",
          "storeAddress",
          "storePhone",
          "storeEmail",
          "items",
          "subtotal",
          "discountAmount",
          "taxAmount",
          "total",
          "paymentMethod",
          "status",
          "metadata"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, $16, $17, $18, $19, $20, $21::jsonb)
        RETURNING *
      `;

      const invoiceResult = await client.query(insertQuery, [
        orderId,
        invoiceNumber,
        customerName || null,
        customerEmail || null,
        customerAddress || null,
        customerCity || null,
        customerPostalCode || null,
        customerPhone || null,
        storeId || null,
        storeName || null,
        storeAddress || null,
        storePhone || null,
        storeEmail || null,
        JSON.stringify(items),
        subtotal,
        discountAmount,
        taxAmount,
        total,
        paymentMethod || null,
        'issued',
        JSON.stringify(metadata),
      ]);

      return invoiceResult.rows[0];
    });

    return {
      success: true,
      data: result,
      message: 'Factura creada exitosamente',
    };
  }

  /**
   * Obtiene una factura por ID
   */
  async findById(id) {
    if (!id) {
      throw new Error('El ID de la factura es requerido');
    }

    const selectQuery = `
      SELECT 
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
      FROM "Invoice" i
      LEFT JOIN "Order" o ON i."orderId" = o.id
      WHERE i.id = $1
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Factura no encontrada',
      };
    }

    const invoice = result.rows[0];

    // Parsear JSONB fields
    if (invoice.items && typeof invoice.items === 'string') {
      invoice.items = JSON.parse(invoice.items);
    }
    if (invoice.metadata && typeof invoice.metadata === 'string') {
      invoice.metadata = JSON.parse(invoice.metadata);
    }

    return {
      success: true,
      data: invoice,
    };
  }

  /**
   * Obtiene una factura por número de factura
   */
  async findByInvoiceNumber(invoiceNumber) {
    if (!invoiceNumber) {
      throw new Error('El número de factura es requerido');
    }

    const selectQuery = `
      SELECT 
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
      FROM "Invoice" i
      LEFT JOIN "Order" o ON i."orderId" = o.id
      WHERE i."invoiceNumber" = $1
    `;

    const result = await query(selectQuery, [invoiceNumber]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Factura no encontrada',
      };
    }

    const invoice = result.rows[0];

    // Parsear JSONB fields
    if (invoice.items && typeof invoice.items === 'string') {
      invoice.items = JSON.parse(invoice.items);
    }
    if (invoice.metadata && typeof invoice.metadata === 'string') {
      invoice.metadata = JSON.parse(invoice.metadata);
    }

    return {
      success: true,
      data: invoice,
    };
  }

  /**
   * Obtiene facturas por orderId
   */
  async findByOrderId(orderId) {
    if (!orderId) {
      throw new Error('El ID de la orden es requerido');
    }

    const selectQuery = `
      SELECT 
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
      FROM "Invoice" i
      LEFT JOIN "Order" o ON i."orderId" = o.id
      WHERE i."orderId" = $1
      ORDER BY i."createdAt" DESC
    `;

    const result = await query(selectQuery, [orderId]);

    const invoices = result.rows.map((invoice) => {
      // Parsear JSONB fields
      if (invoice.items && typeof invoice.items === 'string') {
        invoice.items = JSON.parse(invoice.items);
      }
      if (invoice.metadata && typeof invoice.metadata === 'string') {
        invoice.metadata = JSON.parse(invoice.metadata);
      }
      return invoice;
    });

    return {
      success: true,
      data: invoices,
      count: invoices.length,
    };
  }

  /**
   * Obtiene facturas por email del cliente
   */
  async findByCustomerEmail(email, options = {}) {
    if (!email) {
      throw new Error('El email del cliente es requerido');
    }

    const { limit = 50, offset = 0 } = options;

    const selectQuery = `
      SELECT 
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
      FROM "Invoice" i
      LEFT JOIN "Order" o ON i."orderId" = o.id
      WHERE LOWER(i."customerEmail") = LOWER($1)
      ORDER BY i."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(selectQuery, [email, limit, offset]);

    const invoices = result.rows.map((invoice) => {
      // Parsear JSONB fields
      if (invoice.items && typeof invoice.items === 'string') {
        invoice.items = JSON.parse(invoice.items);
      }
      if (invoice.metadata && typeof invoice.metadata === 'string') {
        invoice.metadata = JSON.parse(invoice.metadata);
      }
      return invoice;
    });

    return {
      success: true,
      data: invoices,
      count: invoices.length,
    };
  }

  /**
   * Obtiene facturas por storeId
   */
  async findByStoreId(storeId, options = {}) {
    if (!storeId) {
      throw new Error('El ID de la tienda es requerido');
    }

    const { limit = 100, offset = 0 } = options;

    const selectQuery = `
      SELECT 
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
      FROM "Invoice" i
      LEFT JOIN "Order" o ON i."orderId" = o.id
      WHERE i."storeId" = $1
      ORDER BY i."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(selectQuery, [storeId, limit, offset]);

    const invoices = result.rows.map((invoice) => {
      // Parsear JSONB fields
      if (invoice.items && typeof invoice.items === 'string') {
        invoice.items = JSON.parse(invoice.items);
      }
      if (invoice.metadata && typeof invoice.metadata === 'string') {
        invoice.metadata = JSON.parse(invoice.metadata);
      }
      return invoice;
    });

    return {
      success: true,
      data: invoices,
      count: invoices.length,
    };
  }

  /**
   * Actualiza los datos de una factura
   */
  async update(id, updateData) {
    if (!id) {
      throw new Error('El ID de la factura es requerido');
    }

    const {
      customerName,
      customerEmail,
      customerAddress,
      customerCity,
      customerPostalCode,
      customerPhone,
      metadata,
    } = updateData;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (customerName !== undefined) {
      paramCount++;
      updateFields.push(`"customerName" = $${paramCount}`);
      updateValues.push(customerName);
    }
    if (customerEmail !== undefined) {
      paramCount++;
      updateFields.push(`"customerEmail" = $${paramCount}`);
      updateValues.push(customerEmail);
    }
    if (customerAddress !== undefined) {
      paramCount++;
      updateFields.push(`"customerAddress" = $${paramCount}`);
      updateValues.push(customerAddress);
    }
    if (customerCity !== undefined) {
      paramCount++;
      updateFields.push(`"customerCity" = $${paramCount}`);
      updateValues.push(customerCity);
    }
    if (customerPostalCode !== undefined) {
      paramCount++;
      updateFields.push(`"customerPostalCode" = $${paramCount}`);
      updateValues.push(customerPostalCode);
    }
    if (customerPhone !== undefined) {
      paramCount++;
      updateFields.push(`"customerPhone" = $${paramCount}`);
      updateValues.push(customerPhone);
    }
    if (metadata !== undefined) {
      paramCount++;
      updateFields.push(`"metadata" = $${paramCount}::jsonb`);
      updateValues.push(JSON.stringify(metadata));
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    paramCount++;
    updateFields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const updateQuery = `
      UPDATE "Invoice"
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Factura no encontrada',
      };
    }

    const invoice = result.rows[0];

    // Parsear JSONB fields
    if (invoice.items && typeof invoice.items === 'string') {
      invoice.items = JSON.parse(invoice.items);
    }
    if (invoice.metadata && typeof invoice.metadata === 'string') {
      invoice.metadata = JSON.parse(invoice.metadata);
    }

    return {
      success: true,
      data: invoice,
      message: 'Factura actualizada exitosamente',
    };
  }

  /**
   * Actualiza el estado de una factura
   */
  async updateStatus(id, status) {
    if (!id) {
      throw new Error('El ID de la factura es requerido');
    }

    const validStatuses = ['issued', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
    }

    const updateQuery = `
      UPDATE "Invoice"
      SET 
        status = $1,
        "updatedAt" = CURRENT_TIMESTAMP,
        "paidAt" = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE "paidAt" END
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [status, id]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Factura no encontrada',
      };
    }

    const invoice = result.rows[0];

    // Parsear JSONB fields
    if (invoice.items && typeof invoice.items === 'string') {
      invoice.items = JSON.parse(invoice.items);
    }
    if (invoice.metadata && typeof invoice.metadata === 'string') {
      invoice.metadata = JSON.parse(invoice.metadata);
    }

    return {
      success: true,
      data: invoice,
      message: 'Estado de factura actualizado exitosamente',
    };
  }
}

module.exports = new InvoiceService();

