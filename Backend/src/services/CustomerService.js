const { query, transaction } = require('../../lib/database');

class CustomerService {
  /**
   * Crear o actualizar un cliente en una tienda
   * El email es la clave única para identificar clientes (junto con storeId)
   * Si el cliente ya existe (mismo email en la misma tienda), se actualiza
   */
  async createOrUpdate(storeId, customerData) {
    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }

    const email = customerData.email?.trim() || null;
    const name = customerData.name?.trim() || null;
    const phone = customerData.phone?.trim() || null;
    const address = customerData.address?.trim() || null;
    const city = customerData.city?.trim() || null;
    const postalCode = customerData.postalCode?.trim() || null;

    // El email es obligatorio para crear/identificar un cliente
    if (!email) {
      throw new Error('E-Mail ist erforderlich, um einen Kunden zu identifizieren');
    }

    // Buscar cliente existente por email en esta tienda (email es la clave única)
    const existingCustomer = await query(
      `SELECT * FROM "Customer" WHERE "storeId" = $1 AND "email" = $2`,
      [storeId, email]
    );

    if (existingCustomer.rows.length > 0) {
      // Actualizar cliente existente (identificado por email)
      const customer = existingCustomer.rows[0];
      const updatedName = name || customer.name;
      const updatedPhone = phone || customer.phone;
      const updatedAddress = address || customer.address;
      const updatedCity = city || customer.city;
      const updatedPostalCode = postalCode || customer.postalCode;

      const updateResult = await query(
        `UPDATE "Customer"
         SET "name" = $1,
             "phone" = $2,
             "address" = $3,
             "city" = $4,
             "postalCode" = $5,
             "lastPurchaseAt" = CURRENT_TIMESTAMP,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "storeId" = $6 AND "email" = $7
         RETURNING *`,
        [updatedName, updatedPhone, updatedAddress, updatedCity, updatedPostalCode, storeId, email]
      );

      return {
        success: true,
        data: updateResult.rows[0],
        isNew: false,
      };
    }

    // Crear nuevo cliente (email es obligatorio y único por tienda)
    try {
      const insertResult = await query(
        `INSERT INTO "Customer" (
          "storeId", "name", "email", "phone", "address", "city", "postalCode", "metadata"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
        RETURNING *`,
        [
          storeId,
          name,
          email,
          phone,
          address,
          city,
          postalCode,
          JSON.stringify(customerData.metadata || {}),
        ]
      );

      return {
        success: true,
        data: insertResult.rows[0],
        isNew: true,
      };
    } catch (error) {
      // Si hay un error de constraint única (email duplicado), intentar actualizar
      if (error.code === '23505' && (error.constraint === 'unique_customer_store_email' || error.message?.includes('unique'))) {
        // El cliente ya existe, actualizarlo
        const updateResult = await query(
          `UPDATE "Customer"
           SET "name" = COALESCE($1, "name"),
               "phone" = COALESCE($2, "phone"),
               "address" = COALESCE($3, "address"),
               "city" = COALESCE($4, "city"),
               "postalCode" = COALESCE($5, "postalCode"),
               "lastPurchaseAt" = CURRENT_TIMESTAMP,
               "updatedAt" = CURRENT_TIMESTAMP
           WHERE "storeId" = $6 AND "email" = $7
           RETURNING *`,
          [name, phone, address, city, postalCode, storeId, email]
        );

        if (updateResult.rows.length > 0) {
          return {
            success: true,
            data: updateResult.rows[0],
            isNew: false,
          };
        }
      }
      throw error;
    }
  }

  /**
   * Obtener todos los clientes de una tienda
   */
  async getByStoreId(storeId, options = {}) {
    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }

    const { limit = 100, offset = 0, search = null } = options;

    let whereClause = `WHERE "storeId" = $1`;
    const params = [storeId];
    let paramCount = 1;

    if (search && search.trim()) {
      paramCount++;
      whereClause += ` AND (
        "name" ILIKE $${paramCount} OR
        "email" ILIKE $${paramCount} OR
        "phone" ILIKE $${paramCount}
      )`;
      params.push(`%${search.trim()}%`);
    }

    const result = await query(
      `SELECT * FROM "Customer"
       ${whereClause}
       ORDER BY "lastPurchaseAt" DESC, "createdAt" DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Obtener total de clientes
    const countResult = await query(
      `SELECT COUNT(*) as total FROM "Customer" ${whereClause}`,
      params
    );

    return {
      success: true,
      data: result.rows,
      count: parseInt(countResult.rows[0].total),
    };
  }

  /**
   * Obtener un cliente por ID
   */
  async getById(customerId) {
    if (!customerId || !customerId.trim()) {
      throw new Error('Kunden-ID ist erforderlich');
    }

    const result = await query(
      `SELECT * FROM "Customer" WHERE "id" = $1`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Kunde nicht gefunden',
      };
    }

    return {
      success: true,
      data: result.rows[0],
    };
  }

  /**
   * Obtener un cliente por email y storeId (usando email como clave única)
   */
  async getByEmail(storeId, email) {
    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }

    if (!email || !email.trim()) {
      throw new Error('E-Mail ist erforderlich');
    }

    const result = await query(
      `SELECT * FROM "Customer" WHERE "storeId" = $1 AND "email" = $2`,
      [storeId, email.trim()]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Kunde nicht gefunden',
      };
    }

    return {
      success: true,
      data: result.rows[0],
    };
  }

  /**
   * Actualizar estadísticas de un cliente (totalOrders, totalSpent)
   */
  async updateStats(customerId) {
    if (!customerId || !customerId.trim()) {
      throw new Error('Kunden-ID ist erforderlich');
    }

    // Calcular estadísticas desde las órdenes
    const statsResult = await query(
      `SELECT 
        COUNT(*) as "totalOrders",
        COALESCE(SUM("total"), 0) as "totalSpent",
        MAX("createdAt") as "lastPurchaseAt"
       FROM "Order"
       WHERE "customerId" = $1 AND "status" != 'cancelled'`,
      [customerId]
    );

    const stats = statsResult.rows[0];
    const totalOrders = parseInt(stats.totalOrders) || 0;
    const totalSpent = parseFloat(stats.totalSpent) || 0;
    const lastPurchaseAt = stats.lastPurchaseAt || new Date().toISOString();

    // Actualizar cliente
    await query(
      `UPDATE "Customer"
       SET "totalOrders" = $1,
           "totalSpent" = $2,
           "lastPurchaseAt" = $3,
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "id" = $4`,
      [totalOrders, totalSpent, lastPurchaseAt, customerId]
    );

    return {
      success: true,
      data: {
        totalOrders,
        totalSpent,
        lastPurchaseAt,
      },
    };
  }

  /**
   * Obtener órdenes de un cliente en una tienda específica
   * Incluye el invoiceId relacionado con cada orden
   */
  async getCustomerOrders(customerId, storeId) {
    if (!customerId || !customerId.trim()) {
      throw new Error('Kunden-ID ist erforderlich');
    }

    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }

    // Usar una subconsulta para obtener la factura más reciente de cada orden
    const result = await query(
      `SELECT 
        o.*,
        COUNT(DISTINCT oi.id) as "itemCount",
        latest_invoice.id as "invoiceId",
        latest_invoice."invoiceNumber" as "invoiceNumber"
       FROM "Order" o
       LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
       LEFT JOIN LATERAL (
         SELECT i.id, i."invoiceNumber"
         FROM "Invoice" i
         WHERE i."orderId" = o.id
         ORDER BY i."createdAt" DESC
         LIMIT 1
       ) latest_invoice ON true
       WHERE o."customerId" = $1 AND o."storeId" = $2
       GROUP BY o.id, latest_invoice.id, latest_invoice."invoiceNumber"
       ORDER BY o."createdAt" DESC`,
      [customerId, storeId]
    );

    return {
      success: true,
      data: result.rows,
    };
  }

  /**
   * Obtener facturas de un cliente en una tienda específica
   * Usa el email del cliente para buscar las facturas
   */
  async getCustomerInvoices(customerId, storeId) {
    if (!customerId || !customerId.trim()) {
      throw new Error('Kunden-ID ist erforderlich');
    }

    if (!storeId || !storeId.trim()) {
      throw new Error('Store-ID ist erforderlich');
    }

    // Primero obtener el email del cliente
    const customerResult = await query(
      `SELECT email FROM "Customer" WHERE id = $1 AND "storeId" = $2`,
      [customerId, storeId]
    );

    if (customerResult.rows.length === 0 || !customerResult.rows[0].email) {
      return {
        success: true,
        data: [],
      };
    }

    const customerEmail = customerResult.rows[0].email;

    // Obtener facturas del cliente por email y storeId
    const result = await query(
      `SELECT 
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
       FROM "Invoice" i
       LEFT JOIN "Order" o ON i."orderId" = o.id
       WHERE LOWER(i."customerEmail") = LOWER($1) AND i."storeId" = $2
       ORDER BY i."createdAt" DESC`,
      [customerEmail, storeId]
    );

    // Parsear JSONB fields
    const invoices = result.rows.map((invoice) => {
      if (invoice.items && typeof invoice.items === 'string') {
        try {
          invoice.items = JSON.parse(invoice.items);
        } catch (e) {
          invoice.items = [];
        }
      }
      if (invoice.metadata && typeof invoice.metadata === 'string') {
        try {
          invoice.metadata = JSON.parse(invoice.metadata);
        } catch (e) {
          invoice.metadata = {};
        }
      }
      return invoice;
    });

    return {
      success: true,
      data: invoices,
    };
  }

  /**
   * Eliminar un cliente (soft delete o hard delete según necesidad)
   */
  async delete(customerId) {
    if (!customerId || !customerId.trim()) {
      throw new Error('Kunden-ID ist erforderlich');
    }

    // Verificar si el cliente tiene órdenes
    const ordersResult = await query(
      `SELECT COUNT(*) as count FROM "Order" WHERE "customerId" = $1`,
      [customerId]
    );

    const orderCount = parseInt(ordersResult.rows[0].count);

    if (orderCount > 0) {
      // Si tiene órdenes, no eliminar, solo marcar como inactivo en metadata
      await query(
        `UPDATE "Customer"
         SET "metadata" = jsonb_set(COALESCE("metadata", '{}'::jsonb), '{deleted}', 'true'::jsonb),
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "id" = $1`,
        [customerId]
      );
    } else {
      // Si no tiene órdenes, eliminar completamente
      await query(
        `DELETE FROM "Customer" WHERE "id" = $1`,
        [customerId]
      );
    }

    return {
      success: true,
      message: orderCount > 0 ? 'Kunde als gelöscht markiert' : 'Kunde gelöscht',
    };
  }
}

module.exports = new CustomerService();
