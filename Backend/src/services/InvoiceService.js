const { query, transaction } = require('../../lib/database');
const crypto = require('crypto');
const customerService = require('./CustomerService');
const logger = require('../utils/logger');
const { normalizeSwissMwStRate } = require('../utils/swissMwSt');

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
   * Genera un token único para compartir la factura públicamente
   */
  generateShareToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crea una nueva factura
   */
  async create(invoiceData) {
    logger.info('[InvoiceService.create] Starting invoice creation', {
      hasOrderId: !!invoiceData?.orderId,
      orderId: invoiceData?.orderId,
      itemsCount: invoiceData?.items?.length || 0,
      customerName: invoiceData?.customerName || 'Gast',
    });
    
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
      storeLogo,
      items,
      subtotal,
      discountAmount = 0,
      taxAmount = 0,
      total,
      paymentMethod,
      metadata = {},
      qrrReference,
      qrCreditorSnapshot,
    } = invoiceData;

    if (!orderId) throw new Error('orderId is required');

    if (!items || !Array.isArray(items) || items.length === 0) throw new Error('Invoice items are required');

    const insertQuery = `
      INSERT INTO "Invoice" (
        "orderId",
        "invoiceNumber",
        "shareToken",
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
        "storeLogo",
        "items",
        "subtotal",
        "discountAmount",
        "taxAmount",
        "total",
        "paymentMethod",
        "status",
        "metadata",
        "qrrReference",
        "qrCreditorSnapshot"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb, $17, $18, $19, $20, $21, $22, $23::jsonb, $24, $25::jsonb)
      RETURNING *
    `;

    // Retry on unique-constraint violations (invoiceNumber or shareToken collision).
    // Collisions are rare but possible — up to 3 attempts with fresh values each time.
    const MAX_RETRIES = 3;
    let result;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const invoiceNumber = this.generateInvoiceNumber();
      const shareToken    = this.generateShareToken();

      try {
        result = await transaction(async (client) => {
          const invoiceResult = await client.query(insertQuery, [
            orderId,
            invoiceNumber,
            shareToken,
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
            storeLogo || null,
            JSON.stringify(items),
            subtotal,
            discountAmount,
            taxAmount,
            total,
            paymentMethod || null,
            'issued',
            JSON.stringify(metadata),
            qrrReference || null,
            qrCreditorSnapshot ? JSON.stringify(qrCreditorSnapshot) : null,
          ]);
          return invoiceResult.rows[0];
        });
        break; // Success — exit retry loop
      } catch (err) {
        // 23505 = unique_violation in PostgreSQL
        if (err.code === '23505' && attempt < MAX_RETRIES) {
          logger.warn('[InvoiceService.create] Unique constraint collision, retrying', { attempt });
          continue;
        }
        throw err; // Rethrow non-collision errors or final attempt failure
      }
    }

    // Crear o actualizar cliente automáticamente DESPUÉS de crear la factura (fuera de la transacción)
    // El email es obligatorio para crear/identificar un cliente
    if (storeId && customerEmail) {
      try {
        const customerResult = await customerService.createOrUpdate(storeId, {
          name: customerName || null,
          email: customerEmail,
          phone: customerPhone || null,
          address: customerAddress || null,
          city: customerCity || null,
          postalCode: customerPostalCode || null,
        });

        if (customerResult.success) {
          const customer = customerResult.data;

          // Actualizar la orden con el customerId
          if (orderId) {
            await query(
              `UPDATE "Order" SET "customerId" = $1 WHERE "id" = $2`,
              [customer.id, orderId]
            );
          }

          // Actualizar estadísticas del cliente
          await customerService.updateStats(customer.id);
          
          logger.info('[InvoiceService.create] Customer upserted', { customerId: customer.id });
        }
      } catch (customerError) {
        // No fallar la factura si hay error al crear/actualizar el cliente
        logger.warn('[InvoiceService.create] Failed to upsert customer', { error: customerError.message });
      }
    }

    logger.info('[InvoiceService.create] Invoice created successfully', {
      invoiceId: result.id,
      invoiceNumber: result.invoiceNumber,
      orderId: result.orderId,
      storeId: result.storeId,
    });

    return {
      success: true,
      data: result,
      message: 'Invoice created successfully',
    };
  }

  /**
   * Enriquece la factura con datos de la tienda cuando faltan (dirección, teléfono, email, logo)
   * Facturas antiguas pueden no tener estos campos; PostgreSQL puede devolver claves en lowercase
   */
  async _enrichInvoiceWithStoreData(invoice) {
    const storeId = invoice.storeId ?? invoice.storeid;
    if (!storeId) return invoice;

    // Leer valores normalizando camelCase / lowercase (PostgreSQL puede devolver storephone, etc.)
    const get = (key) => invoice[key] ?? invoice[key.replace(/([A-Z])/g, (m) => m.toLowerCase())];
    const has = (key) => {
      const v = get(key);
      return v != null && String(v).trim() !== '';
    };
    const metadata = invoice.metadata && typeof invoice.metadata === 'object' ? invoice.metadata : {};
    const hasStoreVat = metadata.storeVatNumber != null && String(metadata.storeVatNumber).trim() !== '';
    const needsEnrichment =
      !has('storeAddress') ||
      !has('storePhone') ||
      !has('storeEmail') ||
      !has('storeLogo') ||
      !hasStoreVat;

    if (!needsEnrichment) return invoice;

    const storeResult = await query(
      'SELECT name, address, phone, email, logo, "vatNumber" as "vatNumber" FROM "Store" WHERE id = $1',
      [storeId]
    );
    if (storeResult.rows.length === 0) return invoice;

    const s = storeResult.rows[0];
    const vatVal = s.vatNumber ?? s.vatnumber;
    if (!has('storeName')) invoice.storeName = s.name ?? s.Name;
    if (!has('storeAddress')) invoice.storeAddress = s.address ?? s.Address;
    if (!has('storePhone')) invoice.storePhone = s.phone ?? s.Phone;
    if (!has('storeEmail')) invoice.storeEmail = s.email ?? s.Email;
    if (!has('storeLogo')) invoice.storeLogo = s.logo ?? s.Logo;
    if (!hasStoreVat && vatVal) {
      invoice.metadata = { ...metadata, storeVatNumber: vatVal };
    }
    return invoice;
  }

  /** productId en camelCase / snake_case / JSON legacy */
  _lineProductId(it) {
    if (!it || typeof it !== 'object') return null;
    const v = it.productId ?? it.productid ?? it.product_id;
    return v != null && String(v).trim() !== '' ? String(v).trim() : null;
  }

  _lineProductSku(it) {
    if (!it || typeof it !== 'object') return null;
    const v = it.productSku ?? it.productsku ?? it.product_sku;
    return v != null && String(v).trim() !== '' ? String(v).trim() : null;
  }

  /**
   * Líneas de pedido con MwSt efectivo (snapshot en OrderItem si existe, si no Product).
   */
  async _loadOrderLinesByOrderIds(orderIds) {
    const map = new Map();
    if (!orderIds || orderIds.length === 0) return map;
    try {
      const result = await query(
        `SELECT oi."orderId" AS "orderId", oi."productId" AS "productId", oi.quantity, oi.price,
                COALESCE(oi."taxRate", p."taxRate") AS "lineTaxRate"
         FROM "OrderItem" oi
         LEFT JOIN "Product" p ON oi."productId"::text = p.id::text
         WHERE oi."orderId" = ANY($1::text[])
         ORDER BY oi."orderId" ASC, oi."createdAt" ASC NULLS LAST, oi.id ASC`,
        [orderIds],
      );
      for (const row of result.rows) {
        const oid = row.orderId ?? row.orderid;
        if (!oid) continue;
        if (!map.has(oid)) map.set(oid, []);
        map.get(oid).push(row);
      }
    } catch (e) {
      logger.warn('[InvoiceService._loadOrderLinesByOrderIds]', { message: e.message });
    }
    return map;
  }

  /** Si la línea de factura no trae productId, copiarlo del OrderItem por índice o coincidencia */
  _hydrateInvoiceProductIdsFromOrder(invoice, orderLines) {
    if (!invoice?.items?.length || !orderLines?.length) return;
    invoice.items = invoice.items.map((it, idx) => {
      let pid = this._lineProductId(it);
      if (pid) return { ...it, productId: pid };
      const oli = orderLines[idx];
      const oid = oli ? oli.productId ?? oli.productid : null;
      if (oid) return { ...it, productId: String(oid) };
      return it;
    });
  }

  /**
   * Mapa productId → MwSt normalizado (0, 0.026, 0.081) desde la tabla Product (oficial).
   */
  async _buildProductTaxRateMap(productIds) {
    const taxMap = new Map();
    if (!productIds || productIds.length === 0) return taxMap;
    try {
      const taxResult = await query(
        'SELECT id::text AS id, "taxRate" FROM "Product" WHERE id::text = ANY($1::text[])',
        [productIds],
      );
      for (const row of taxResult.rows) {
        const tr = row.taxRate ?? row.taxrate;
        // NUNCA inventar 2.6 % aquí: si taxRate es NULL en BD, no entrar en el mapa
        // (si no, taxMap.has(id) sería true para todos y bloquearía otros fallbacks).
        if (tr === null || tr === undefined || tr === '') continue;
        const n = typeof tr === 'number' ? tr : parseFloat(String(tr).replace(',', '.'));
        if (!Number.isFinite(n) || n < 0) continue;
        taxMap.set(String(row.id), normalizeSwissMwStRate(n));
      }
    } catch (e) {
      logger.warn('[InvoiceService._buildProductTaxRateMap] Product tax lookup failed', {
        message: e.message,
      });
    }
    return taxMap;
  }

  /** Respaldo: buscar MwSt por SKU cuando el mapa por id no tiene fila (p. ej. taxRate NULL en Product). */
  async _buildProductTaxRateBySkuMap(skus) {
    const m = new Map();
    const unique = [...new Set((skus || []).filter((s) => s && String(s).trim() !== '').map((s) => String(s).trim()))];
    if (unique.length === 0) return m;
    try {
      const r = await query(
        'SELECT sku, "taxRate" FROM "Product" WHERE sku = ANY($1::text[])',
        [unique],
      );
      for (const row of r.rows) {
        const sku = row.sku != null ? String(row.sku).trim() : '';
        if (!sku) continue;
        const tr = row.taxRate ?? row.taxrate;
        if (tr === null || tr === undefined || tr === '') continue;
        const n = typeof tr === 'number' ? tr : parseFloat(String(tr).replace(',', '.'));
        if (!Number.isFinite(n) || n < 0) continue;
        m.set(sku, normalizeSwissMwStRate(n));
      }
    } catch (e) {
      logger.warn('[InvoiceService._buildProductTaxRateBySkuMap]', { message: e.message });
    }
    return m;
  }

  /**
   * Prioridad: 1) Product por id, 2) join pedido→Product, 3) Product por SKU, 4) JSON factura.
   */
  _applyOfficialTaxFromProductAndOrder(invoice, orderLines, taxMap, skuTaxMap) {
    if (!invoice?.items?.length) return;
    const lines = orderLines || [];
    const skuMap = skuTaxMap || new Map();
    invoice.items = invoice.items.map((it, idx) => {
      const pid = this._lineProductId(it);
      const sku = this._lineProductSku(it);
      let oli = null;
      if (pid && lines.length) {
        oli = lines.find((l) => String(l.productId ?? l.productid) === pid) || null;
      }
      if (!oli && lines[idx]) oli = lines[idx];

      let pickedRate = null;
      if (pid && taxMap && taxMap.has(pid)) {
        pickedRate = taxMap.get(pid);
      }
      if (pickedRate == null && oli) {
        const raw = oli.lineTaxRate ?? oli.linetaxrate ?? oli.itemTaxRate ?? oli.itemtaxrate;
        if (raw != null && raw !== '') {
          const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(',', '.'));
          if (Number.isFinite(n) && n >= 0) pickedRate = normalizeSwissMwStRate(n);
        }
      }
      if (pickedRate == null && sku && skuMap.has(sku)) {
        pickedRate = skuMap.get(sku);
      }
      if (pickedRate == null) {
        const raw = it.taxRate ?? it.metadata?.taxRate ?? it.metadata?.tax_rate;
        pickedRate = normalizeSwissMwStRate(raw);
      }
      return {
        ...it,
        ...(pid ? { productId: pid } : {}),
        taxRate: pickedRate,
        metadata: { ...(it.metadata || {}), taxRate: pickedRate },
      };
    });
  }

  /**
   * Sincroniza taxRate/MwSt por línea con Product + respaldo desde OrderItem.
   */
  async _enrichItemsWithProductTaxRate(invoice) {
    if (!invoice?.items?.length) return invoice;
    let orderLines = [];
    if (invoice.orderId) {
      const m = await this._loadOrderLinesByOrderIds([invoice.orderId]);
      orderLines = m.get(invoice.orderId) || [];
    }
    this._hydrateInvoiceProductIdsFromOrder(invoice, orderLines);
    const productIds = [...new Set(invoice.items.map((it) => this._lineProductId(it)).filter(Boolean))];
    const skus = invoice.items.map((it) => this._lineProductSku(it)).filter(Boolean);
    const [taxMap, skuTaxMap] = await Promise.all([
      this._buildProductTaxRateMap(productIds),
      this._buildProductTaxRateBySkuMap(skus),
    ]);
    this._applyOfficialTaxFromProductAndOrder(invoice, orderLines, taxMap, skuTaxMap);
    return invoice;
  }

  /**
   * Igual que _enrichItemsWithProductTaxRate: una query OrderItem + una query Product para N facturas.
   */
  async _enrichManyInvoicesItemsWithProductTaxRate(invoices) {
    if (!invoices || invoices.length === 0) return;
    const orderIds = [...new Set(invoices.map((i) => i.orderId).filter(Boolean))];
    const linesByOrder = orderIds.length ? await this._loadOrderLinesByOrderIds(orderIds) : new Map();

    const allPids = new Set();
    const allSkus = [];
    for (const inv of invoices) {
      if (!inv?.items?.length) continue;
      const lines = inv.orderId ? linesByOrder.get(inv.orderId) || [] : [];
      this._hydrateInvoiceProductIdsFromOrder(inv, lines);
      for (const it of inv.items) {
        const pid = this._lineProductId(it);
        if (pid) allPids.add(pid);
        const sku = this._lineProductSku(it);
        if (sku) allSkus.push(sku);
      }
    }
    const [taxMap, skuTaxMap] = await Promise.all([
      this._buildProductTaxRateMap([...allPids]),
      this._buildProductTaxRateBySkuMap(allSkus),
    ]);

    for (const inv of invoices) {
      if (!inv?.items?.length) continue;
      const lines = inv.orderId ? linesByOrder.get(inv.orderId) || [] : [];
      this._applyOfficialTaxFromProductAndOrder(inv, lines, taxMap, skuTaxMap);
    }
  }

  /**
   * Obtiene una factura por ID
   */
  async findById(id) {
    if (!id) {
      throw new Error('Invoice id is required');
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
        error: 'Invoice not found',
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

    await this._enrichItemsWithProductTaxRate(invoice);
    await this._enrichInvoiceWithStoreData(invoice);
    return {
      success: true,
      data: invoice,
    };
  }

  /**
   * Obtiene una factura por su token de compartir (público)
   */
  async findByShareToken(shareToken) {
    if (!shareToken) {
      throw new Error('shareToken is required');
    }

    const selectQuery = `
      SELECT
        i.*,
        o."createdAt" as "orderDate",
        o.status as "orderStatus"
      FROM "Invoice" i
      LEFT JOIN "Order" o ON i."orderId" = o.id
      WHERE i."shareToken" = $1
    `;

    const result = await query(selectQuery, [shareToken]);

    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Invoice not found',
        data: null,
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

    await this._enrichItemsWithProductTaxRate(invoice);
    await this._enrichInvoiceWithStoreData(invoice);
    return {
      success: true,
      data: invoice,
    };
  }

  async findByInvoiceNumber(invoiceNumber) {
    if (!invoiceNumber) {
      throw new Error('Invoice number is required');
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
        error: 'Invoice not found',
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

    await this._enrichItemsWithProductTaxRate(invoice);
    await this._enrichInvoiceWithStoreData(invoice);
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
      throw new Error('orderId is required');
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

    await this._enrichManyInvoicesItemsWithProductTaxRate(invoices);

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
      throw new Error('Customer email is required');
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

    await this._enrichManyInvoicesItemsWithProductTaxRate(invoices);

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
      throw new Error('storeId is required');
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

    await this._enrichManyInvoicesItemsWithProductTaxRate(invoices);

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
      throw new Error('Invoice id is required');
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
      throw new Error('No fields to update');
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
        error: 'Invoice not found',
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

    await this._enrichItemsWithProductTaxRate(invoice);
    await this._enrichInvoiceWithStoreData(invoice);

    return {
      success: true,
      data: invoice,
      message: 'Invoice updated successfully',
    };
  }

  /**
   * Actualiza el estado de una factura
   */
  async updateStatus(id, status) {
    if (!id) {
      throw new Error('Invoice id is required');
    }

    const validStatuses = ['issued', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
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
        error: 'Invoice not found',
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

    await this._enrichItemsWithProductTaxRate(invoice);
    await this._enrichInvoiceWithStoreData(invoice);

    return {
      success: true,
      data: invoice,
      message: 'Invoice status updated successfully',
    };
  }

  /**
   * API pública para otros servicios (p. ej. CustomerService): MwSt por línea desde Product.
   */
  async enrichInvoiceListItemsWithProductTaxRates(invoices) {
    await this._enrichManyInvoicesItemsWithProductTaxRate(invoices);
  }
}

module.exports = new InvoiceService();

