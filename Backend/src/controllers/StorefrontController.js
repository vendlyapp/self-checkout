'use strict';

const crypto = require('crypto');
const { query } = require('../../lib/database');
const storeService = require('../services/StoreService');
const paymentMethodService = require('../services/PaymentMethodService');
const categoryService = require('../services/CategoryService');
const discountCodeService = require('../services/DiscountCodeService');
const orderService = require('../services/OrderService');
const invoiceService = require('../services/InvoiceService');
const userService = require('../services/UserService');
const { generateInvoicePDF } = require('../services/InvoicePDFService');
const logger = require('../utils/logger');
const { normalizeSwissMwStRate } = require('../utils/swissMwSt');
const SimpleCache = require('../utils/simpleCache');

// Cache for storefront catalog — 10 min TTL, keyed by storeId + query params
const catalogCache = new SimpleCache(10 * 60 * 1000);

// ─── Buyer-safe column set for products ─────────────────────────────────────
// Deliberately excludes: ownerId, costPrice, margin, supplier, notes,
// location, qrCode, barcodeImage, initialStock, taxRate (internal).
const STOREFRONT_PRODUCT_COLS = `
  id, name, description, price, "originalPrice",
  category, "categoryId", stock, barcode, sku,
  tags, "isNew", "isPopular", "isOnSale", "isActive",
  "discountPercentage", image, images, currency,
  "promotionTitle", "promotionBadge", "promotionActionLabel", "promotionPriority",
  "hasWeight", "parentId", "createdAt"
`;

// ─── DTOs ────────────────────────────────────────────────────────────────────

function storeDto(s) {
  return {
    slug: s.slug,
    name: s.name,
    description: s.description || null,
    logo: s.logo || null,
    isOpen: s.isOpen ?? true,
    address: s.address || null,
    phone: s.phone || null,
    email: s.email || null,
  };
}

function productDto(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description || null,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    category: p.category || null,
    categoryId: p.categoryId || null,
    image: p.image || null,
    images: Array.isArray(p.images) ? p.images : [],
    isNew: p.isNew ?? false,
    isPopular: p.isPopular ?? false,
    isOnSale: p.isOnSale ?? false,
    tags: Array.isArray(p.tags) ? p.tags : [],
    barcode: p.barcode || null,
    sku: p.sku || null,
    discountPercentage: p.discountPercentage != null ? Number(p.discountPercentage) : null,
    promotionTitle: p.promotionTitle || null,
    promotionBadge: p.promotionBadge || null,
    promotionActionLabel: p.promotionActionLabel || null,
    hasWeight: p.hasWeight ?? false,
    parentId: p.parentId || null,
    inStock: Number(p.stock ?? 0) > 0,
  };
}

function categoryDto(c) {
  return {
    id: c.id,
    name: c.name,
    isActive: c.isActive ?? true,
  };
}

function paymentOptionDto(pm) {
  return {
    code: pm.code,
    displayName: pm.displayName,
    icon: pm.icon || null,
    bgColor: pm.bgColor || null,
    textColor: pm.textColor || null,
  };
}

function orderReceiptDto(order, publicOrderToken) {
  return {
    publicOrderToken,
    status: order.status,
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves a store by slug, returning 404 if not found or inactive.
 * Returns the raw store row (with ownerId) for internal use only.
 */
async function resolveStore(slug, res) {
  const store = await storeService.getBySlug(slug);
  if (!store) {
    res.status(404).json({ success: false, error: 'Store not found' });
    return null;
  }
  return store;
}

/**
 * Applies a discount code to a subtotal.
 * Returns { discountAmount, finalTotal, discountCodeData }.
 * Throws if the code is invalid/inactive.
 */
async function applyDiscount(discountCode, storeOwnerId, subtotal) {
  const codeResult = await discountCodeService.findByCode(discountCode, storeOwnerId);
  const code = codeResult.data;

  let discountAmount = 0;
  if (code.discount_type === 'percentage') {
    discountAmount = Math.round(subtotal * (code.discount_value / 100) * 100) / 100;
  } else {
    discountAmount = Math.min(code.discount_value, subtotal);
  }

  const finalTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
  return { discountAmount, finalTotal, discountCodeData: code };
}

/**
 * Creates or resolves the guest user for a storefront order.
 * Mirrors the logic in OrderController.resolveGuestUserId.
 */
async function resolveGuestUserId({ storeSlug, storeId, customer }) {
  const normalizedEmail = customer?.email?.trim().toLowerCase();
  const hasCustomerData = customer && (customer.name || customer.email);

  let displayName = null;
  if (hasCustomerData && customer.name?.trim()) {
    displayName = customer.name.trim();
  } else if (normalizedEmail) {
    displayName = normalizedEmail.split('@')[0];
  } else {
    const store = await storeService.getBySlug(storeSlug) || await storeService.getById(storeId);
    displayName = store?.name ? `Gast von ${store.name}` : 'Gast';
  }

  if (normalizedEmail) {
    try {
      const existing = await userService.findByEmail(normalizedEmail);
      if (existing?.data?.id) {
        if (hasCustomerData && customer.name?.trim()) {
          try {
            await userService.update(existing.data.id, { name: customer.name.trim() });
          } catch (_) { /* non-fatal */ }
        }
        return existing.data.id;
      }
    } catch (e) {
      if (!e.message?.toLowerCase().includes('not found') && !e.message?.toLowerCase().includes('no encontrado')) {
        throw e;
      }
    }
  }

  const generatedEmail = normalizedEmail || `guest+${storeSlug || storeId || 'store'}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}@vendly.guest`;
  const created = await userService.create({
    email: generatedEmail,
    password: crypto.randomUUID(),
    name: displayName,
    role: 'CUSTOMER',
  });
  return created.data.id;
}

// ─── Controller class ─────────────────────────────────────────────────────────

class StorefrontController {

  // ── GET /api/storefront/stores/:slug ─────────────────────────────────────
  async getStore(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      res.json({ success: true, data: storeDto(store) });
    } catch (err) {
      logger.error('[Storefront.getStore]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to fetch store' });
    }
  }

  // ── GET /api/storefront/stores/:slug/catalog ──────────────────────────────
  async getCatalog(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      const {
        search = null,
        categoryId = null,
        sortBy = 'name',
        limit = 200,
        offset = 0,
      } = req.query;

      const safeLimit = Math.min(parseInt(limit) || 200, 500);
      const safeOffset = Math.max(parseInt(offset) || 0, 0);

      // Check in-memory cache first
      const cacheKey = `catalog:${store.id}:${categoryId || ''}:${search || ''}:${sortBy}:${safeLimit}:${safeOffset}`;
      const cached = catalogCache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const params = [];
      let paramCount = 0;
      const conditions = [`"ownerId" = $${++paramCount}`, `"isActive" = true`];
      params.push(store.ownerId);

      if (categoryId && categoryId !== 'all') {
        conditions.push(`"categoryId" = $${++paramCount}`);
        params.push(categoryId);
      }

      if (search) {
        conditions.push(`(name ILIKE $${++paramCount} OR sku ILIKE $${paramCount} OR category ILIKE $${paramCount})`);
        params.push(`%${search.trim()}%`);
      }

      const orderByMap = {
        price: '"price" ASC',
        price_desc: '"price" DESC',
        rating: '"promotionPriority" DESC NULLS LAST, name ASC',
        newest: '"createdAt" DESC',
        name: 'name ASC',
      };
      const orderBy = orderByMap[sortBy] || 'name ASC';

      const limitParam = ++paramCount;
      params.push(safeLimit);
      const offsetParam = ++paramCount;
      params.push(safeOffset);

      const rows = await query(
        `SELECT ${STOREFRONT_PRODUCT_COLS}
         FROM "Product"
         WHERE ${conditions.join(' AND ')}
         ORDER BY ${orderBy}
         LIMIT $${limitParam} OFFSET $${offsetParam}`,
        params,
      );

      const products = rows.rows.map(productDto);
      const result = { success: true, data: products, count: products.length };
      catalogCache.set(cacheKey, result);
      res.json(result);
    } catch (err) {
      logger.error('[Storefront.getCatalog]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to fetch catalog' });
    }
  }

  // ── GET /api/storefront/stores/:slug/categories ───────────────────────────
  async getCategories(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      const result = await categoryService.findAll(store.id);
      const categories = (result.data || [])
        .filter((c) => c.isActive !== false)
        .map(categoryDto);

      res.json({ success: true, data: categories, count: categories.length });
    } catch (err) {
      logger.error('[Storefront.getCategories]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
  }

  // ── GET /api/storefront/stores/:slug/payment-options ─────────────────────
  async getPaymentOptions(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      const result = await paymentMethodService.findByStoreId(store.id, { activeOnly: true });
      const options = (result.data || []).map(paymentOptionDto);

      res.json({ success: true, data: options });
    } catch (err) {
      logger.error('[Storefront.getPaymentOptions]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to fetch payment options' });
    }
  }

  // ── POST /api/storefront/stores/:slug/discounts/validate ─────────────────
  async validateDiscount(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      const { code, subtotal } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, error: 'code is required' });
      }

      const codeResult = await discountCodeService.findByCode(code.trim().toUpperCase(), store.ownerId);
      const discountData = codeResult.data;

      let discountAmount = 0;
      const sub = Number(subtotal) || 0;
      if (discountData.discount_type === 'percentage') {
        discountAmount = Math.round(sub * (discountData.discount_value / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(discountData.discount_value, sub);
      }

      res.json({
        success: true,
        data: {
          code: discountData.code,
          discountType: discountData.discount_type,
          discountValue: discountData.discount_value,
          discountAmount,
          finalTotal: Math.max(0, Math.round((sub - discountAmount) * 100) / 100),
        },
      });
    } catch (err) {
      logger.warn('[Storefront.validateDiscount]', { error: err.message });
      res.status(400).json({ success: false, error: err.message || 'Invalid discount code' });
    }
  }

  // ── POST /api/storefront/stores/:slug/quote ───────────────────────────────
  async quote(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      const { items, discountCode } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'items array is required' });
      }

      const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))];
      if (productIds.length !== items.length) {
        return res.status(400).json({ success: false, error: 'Each item must have a unique productId' });
      }

      // Fetch products from DB — enforces store ownership and isActive
      const rows = await query(
        `SELECT ${STOREFRONT_PRODUCT_COLS}, "taxRate"
         FROM "Product"
         WHERE id = ANY($1) AND "ownerId" = $2 AND "isActive" = true`,
        [productIds, store.ownerId],
      );

      if (rows.rows.length !== productIds.length) {
        return res.status(400).json({ success: false, error: 'One or more products are unavailable for this store' });
      }

      const catalog = new Map(rows.rows.map((p) => [p.id, p]));

      let subtotal = 0;
      const lineItems = [];

      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
          return res.status(400).json({ success: false, error: `Invalid quantity for product ${item.productId}` });
        }

        const product = catalog.get(item.productId);
        if (!product) {
          return res.status(400).json({ success: false, error: `Product ${item.productId} not found in this store` });
        }

        if (Number(product.stock) < quantity) {
          return res.status(400).json({ success: false, error: `Insufficient stock for "${product.name}"` });
        }

        const price = Number(product.price);
        const lineTotal = Math.round(price * quantity * 100) / 100;
        subtotal += lineTotal;

        lineItems.push({
          productId: product.id,
          name: product.name,
          price,
          quantity,
          lineTotal,
        });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      let discountAmount = 0;
      let discountCodeData = null;
      let total = subtotal;

      if (discountCode) {
        try {
          const applied = await applyDiscount(discountCode.trim().toUpperCase(), store.ownerId, subtotal);
          discountAmount = applied.discountAmount;
          total = applied.finalTotal;
          discountCodeData = {
            code: applied.discountCodeData.code,
            discountType: applied.discountCodeData.discount_type,
            discountValue: applied.discountCodeData.discount_value,
            discountAmount,
          };
        } catch (err) {
          return res.status(400).json({ success: false, error: err.message || 'Invalid discount code' });
        }
      }

      res.json({
        success: true,
        data: {
          items: lineItems,
          subtotal,
          discountAmount,
          discountCode: discountCodeData,
          total,
        },
      });
    } catch (err) {
      logger.error('[Storefront.quote]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to compute quote' });
    }
  }

  // ── POST /api/storefront/stores/:slug/orders ──────────────────────────────
  async createOrder(req, res) {
    try {
      const store = await resolveStore(req.params.slug, res);
      if (!store) return;

      const {
        items,
        paymentMethod,
        customer,
        discountCode,
      } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'items array is required' });
      }

      if (!paymentMethod || typeof paymentMethod !== 'string') {
        return res.status(400).json({ success: false, error: 'paymentMethod is required' });
      }

      const productIds = [...new Set(items.map((i) => i.productId).filter(Boolean))];

      // ── Server-side pricing & validation ──────────────────────────────────
      const rows = await query(
        `SELECT ${STOREFRONT_PRODUCT_COLS}, "taxRate"
         FROM "Product"
         WHERE id = ANY($1) AND "ownerId" = $2 AND "isActive" = true`,
        [productIds, store.ownerId],
      );

      if (rows.rows.length !== productIds.length) {
        return res.status(400).json({ success: false, error: 'One or more products are unavailable for this store' });
      }

      const catalog = new Map(rows.rows.map((p) => [p.id, p]));

      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
          return res.status(400).json({ success: false, error: `Invalid quantity for product ${item.productId}` });
        }

        const product = catalog.get(item.productId);
        if (!product) {
          return res.status(400).json({ success: false, error: `Product ${item.productId} not found in this store` });
        }

        if (Number(product.stock) < quantity) {
          return res.status(400).json({ success: false, error: `Insufficient stock for "${product.name}"` });
        }

        const price = Number(product.price);
        subtotal += Math.round(price * quantity * 100) / 100;

        // Pass price:null so OrderService picks the DB price (same value, but prevents manipulation)
        validatedItems.push({ productId: item.productId, quantity });
      }

      subtotal = Math.round(subtotal * 100) / 100;

      // ── Discount application ───────────────────────────────────────────────
      let discountAmount = 0;
      let serverTotal = subtotal;
      let appliedPromoCode = null;

      if (discountCode) {
        try {
          const applied = await applyDiscount(discountCode.trim().toUpperCase(), store.ownerId, subtotal);
          discountAmount = applied.discountAmount;
          serverTotal = applied.finalTotal;
          appliedPromoCode = applied.discountCodeData.code;
        } catch (err) {
          return res.status(400).json({ success: false, error: err.message || 'Invalid discount code' });
        }
      }

      // ── Generate publicOrderToken ──────────────────────────────────────────
      const publicOrderToken = crypto.randomUUID();

      // ── Resolve or create guest user ──────────────────────────────────────
      const guestUserId = await resolveGuestUserId({
        storeSlug: req.params.slug,
        storeId: store.id,
        customer,
      });

      // ── Create order via existing service (prices come from DB) ───────────
      // We pass total = serverTotal (discounted) so the discount is reflected in
      // the order record. Items have no price — OrderService uses DB prices.
      const orderResult = await orderService.create(guestUserId, {
        items: validatedItems,
        paymentMethod,
        total: serverTotal,
        storeId: store.id,
        customer: customer || null,
        metadata: {
          promoCode: appliedPromoCode,
          discountAmount,
          totalBeforeVAT: subtotal,
          publicOrderToken,
          source: 'storefront',
        },
      });

      const order = orderResult.data;

      // Expose the publicOrderToken alongside the qrPaymentConfirmToken (QR-Rechnung orders)
      const responseData = orderReceiptDto(order, publicOrderToken);
      if (order.metadata?.qrPaymentConfirmToken) {
        responseData.qrPaymentConfirmToken = order.metadata.qrPaymentConfirmToken;
      }
      if (order.metadata?.qrrReference) {
        responseData.qrrReference = order.metadata.qrrReference;
      }

      res.status(201).json({ success: true, data: responseData });
    } catch (err) {
      logger.error('[Storefront.createOrder]', { error: err.message });
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, error: err.message || 'Failed to create order' });
    }
  }

  // ── GET /api/storefront/orders/:publicOrderToken ──────────────────────────
  async getOrderByToken(req, res) {
    try {
      const { publicOrderToken } = req.params;
      if (!publicOrderToken) {
        return res.status(400).json({ success: false, error: 'publicOrderToken is required' });
      }

      const result = await query(
        `SELECT id, status, total, "paymentMethod", "createdAt", metadata
         FROM "Order"
         WHERE metadata->>'publicOrderToken' = $1
         LIMIT 1`,
        [publicOrderToken],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const row = result.rows[0];
      const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {});

      const data = {
        publicOrderToken,
        status: row.status,
        total: Number(row.total),
        paymentMethod: row.paymentMethod,
        createdAt: row.createdAt,
      };
      if (meta.qrrReference) data.qrrReference = meta.qrrReference;

      res.json({ success: true, data });
    } catch (err) {
      logger.error('[Storefront.getOrderByToken]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
  }

  // ── GET /api/storefront/orders/:publicOrderToken/payment-qr ──────────────
  async getOrderPaymentQR(req, res) {
    try {
      const { publicOrderToken } = req.params;

      const result = await query(
        `SELECT id, status, total, "paymentMethod", "storeId", metadata
         FROM "Order"
         WHERE metadata->>'publicOrderToken' = $1
         LIMIT 1`,
        [publicOrderToken],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const order = result.rows[0];
      const meta = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : (order.metadata || {});

      // Delegate to the existing QR generation on the order (uses orderId internally)
      const fakeReq = { params: { id: order.id } };
      const QRBillService = require('../services/QRBillService');
      const { query: dbQuery } = require('../../lib/database');

      const qrrReference = meta.qrrReference;
      if (!qrrReference) {
        return res.status(400).json({ success: false, error: 'This order has no QR reference' });
      }

      let creditorConfig = meta.qrCreditorSnapshot || null;
      if (!creditorConfig) {
        const pmResult = await dbQuery(
          `SELECT config FROM "PaymentMethod" WHERE "storeId" = $1 AND code = 'qr-rechnung' AND "isActive" = true LIMIT 1`,
          [order.storeId],
        );
        creditorConfig = pmResult.rows[0]?.config || null;
      }

      if (!creditorConfig) {
        return res.status(400).json({ success: false, error: 'QR-Rechnung not configured for this store' });
      }

      const validation = QRBillService.validateQRIBAN(creditorConfig.qrIban || '');
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      const amount = Number(meta.totalWithVAT || order.total);
      const additionalInfo = `Bestellung ${order.id.slice(0, 8).toUpperCase()}`;

      const qrSvg = QRBillService.generateQROnlySVG({ creditorConfig, amount, reference: qrrReference, additionalInfo });
      const billSvg = QRBillService.generateQRCodeSVG({ creditorConfig, amount, reference: qrrReference, additionalInfo, language: 'DE' });

      res.json({
        success: true,
        data: { qrSvg, billSvg, qrrReference, amount },
      });
    } catch (err) {
      logger.error('[Storefront.getOrderPaymentQR]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to generate QR code' });
    }
  }

  // ── POST /api/storefront/orders/:publicOrderToken/payment-confirmations ───
  async confirmPayment(req, res) {
    try {
      const { publicOrderToken } = req.params;
      const confirmToken = typeof req.body?.confirmToken === 'string' ? req.body.confirmToken.trim() : '';

      if (!confirmToken) {
        return res.status(400).json({ success: false, error: 'confirmToken is required' });
      }

      const result = await query(
        `SELECT id, status, "paymentMethod", metadata FROM "Order"
         WHERE metadata->>'publicOrderToken' = $1 LIMIT 1`,
        [publicOrderToken],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const order = result.rows[0];
      const meta = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : (order.metadata || {});

      if (order.paymentMethod !== 'qr-rechnung') {
        return res.status(400).json({ success: false, error: 'Guest confirmation is only available for QR-Rechnung orders' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ success: false, error: `Order is already '${order.status}'` });
      }

      const expected = meta.qrPaymentConfirmToken;
      if (typeof expected !== 'string' || !expected) {
        return res.status(400).json({ success: false, error: 'This order cannot be guest-confirmed (missing token)' });
      }

      const a = Buffer.from(confirmToken, 'utf8');
      const b = Buffer.from(expected, 'utf8');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(403).json({ success: false, error: 'Invalid confirmation token' });
      }

      const confirmedAt = new Date().toISOString();

      await query(
        `UPDATE "Order" SET status='completed', metadata=metadata||$1::jsonb, "updatedAt"=CURRENT_TIMESTAMP WHERE id=$2`,
        [JSON.stringify({ confirmedAt, confirmedBy: 'guest_storefront' }), order.id],
      );
      await query(
        `UPDATE "Invoice" SET status='paid', "paidAt"=CURRENT_TIMESTAMP, "updatedAt"=CURRENT_TIMESTAMP WHERE "orderId"=$1`,
        [order.id],
      );

      res.json({ success: true, data: { publicOrderToken, status: 'completed', confirmedAt } });
    } catch (err) {
      logger.error('[Storefront.confirmPayment]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to confirm payment' });
    }
  }

  // ── POST /api/storefront/stores/:slug/orders/:publicOrderToken/invoice ────
  async createInvoice(req, res) {
    try {
      const { publicOrderToken } = req.params;

      const result = await query(
        `SELECT id, status, total, "paymentMethod", "storeId", metadata FROM "Order"
         WHERE metadata->>'publicOrderToken' = $1 LIMIT 1`,
        [publicOrderToken],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const order = result.rows[0];

      // Check if invoice already exists for this order
      const existingInvoice = await query(
        `SELECT id, "shareToken", "invoiceNumber" FROM "Invoice" WHERE "orderId" = $1 LIMIT 1`,
        [order.id],
      );

      if (existingInvoice.rows.length > 0) {
        const inv = existingInvoice.rows[0];
        return res.json({ success: true, data: { shareToken: inv.shareToken, invoiceNumber: inv.invoiceNumber } });
      }

      // Build invoice from the order
      const meta = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : (order.metadata || {});
      const { customerName, customerEmail, customerAddress, customerCity, customerPostalCode, customerPhone } = req.body;

      const storeInfo = await storeService.getById(order.storeId);
      const store = storeInfo?.success ? storeInfo.data : null;

      // Fetch order items for invoice lines
      const itemsResult = await query(
        `SELECT oi."productId", oi.quantity, oi.price, oi."taxRate",
                p.name, p.sku
         FROM "OrderItem" oi
         LEFT JOIN "Product" p ON p.id = oi."productId"
         WHERE oi."orderId" = $1`,
        [order.id],
      );

      const invoiceItems = itemsResult.rows.map((i) => ({
        productId: i.productId,
        productName: i.name || 'Produkt',
        productSku: i.sku || '',
        quantity: i.quantity,
        price: Number(i.price),
        subtotal: Number(i.price) * i.quantity,
      }));

      const inv = await invoiceService.create({
        orderId: order.id,
        customerName: customerName || meta.customer?.name || null,
        customerEmail: customerEmail || meta.customer?.email || null,
        customerAddress: customerAddress || meta.customer?.address || null,
        customerCity: customerCity || null,
        customerPostalCode: customerPostalCode || null,
        customerPhone: customerPhone || meta.customer?.phone || null,
        storeId: order.storeId,
        storeName: store?.name || null,
        storeAddress: store?.address || null,
        storePhone: store?.phone || null,
        storeEmail: store?.email || null,
        storeLogo: store?.logo || null,
        items: invoiceItems,
        subtotal: meta.totalBeforeVAT || Number(order.total),
        discountAmount: meta.discountAmount || 0,
        total: Number(order.total),
        paymentMethod: order.paymentMethod,
        metadata: { source: 'storefront' },
        qrrReference: meta.qrrReference || null,
        qrCreditorSnapshot: meta.qrCreditorSnapshot || null,
      });

      res.status(201).json({
        success: true,
        data: { shareToken: inv.data?.shareToken, invoiceNumber: inv.data?.invoiceNumber },
      });
    } catch (err) {
      logger.error('[Storefront.createInvoice]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to create invoice' });
    }
  }

  // ── GET /api/storefront/invoices/:shareToken ──────────────────────────────
  async getInvoice(req, res) {
    try {
      const { shareToken } = req.params;
      if (!shareToken) return res.status(400).json({ success: false, error: 'shareToken is required' });

      const result = await invoiceService.findByShareToken(shareToken);
      if (!result.success) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }

      // Strip internal fields before returning
      const inv = result.data;
      const safe = {
        invoiceNumber: inv.invoiceNumber,
        shareToken: inv.shareToken,
        status: inv.status,
        customerName: inv.customerName,
        customerEmail: inv.customerEmail,
        customerAddress: inv.customerAddress,
        customerCity: inv.customerCity,
        customerPostalCode: inv.customerPostalCode,
        customerPhone: inv.customerPhone,
        storeName: inv.storeName,
        storeLogo: inv.storeLogo,
        storeAddress: inv.storeAddress,
        storePhone: inv.storePhone,
        storeEmail: inv.storeEmail,
        items: inv.items,
        subtotal: inv.subtotal,
        discountAmount: inv.discountAmount,
        taxAmount: inv.taxAmount,
        total: inv.total,
        paymentMethod: inv.paymentMethod,
        createdAt: inv.createdAt,
        paidAt: inv.paidAt,
        qrrReference: inv.qrrReference || null,
        qrCreditorSnapshot: inv.qrCreditorSnapshot || null,
      };

      res.json({ success: true, data: safe });
    } catch (err) {
      logger.error('[Storefront.getInvoice]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
    }
  }

  // ── GET /api/storefront/invoices/:shareToken/pdf ──────────────────────────
  async getInvoicePdf(req, res) {
    try {
      const { shareToken } = req.params;
      if (!shareToken) return res.status(400).json({ success: false, error: 'shareToken is required' });

      const result = await invoiceService.findByShareToken(shareToken);
      if (!result.success || !result.data) {
        return res.status(404).json({ success: false, error: 'Invoice not found' });
      }

      const invoiceData = result.data;
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      const filename = `invoice-${invoiceData.invoiceNumber || shareToken.slice(0, 8)}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (err) {
      logger.error('[Storefront.getInvoicePdf]', { error: err.message });
      res.status(500).json({ success: false, error: 'Failed to generate invoice PDF' });
    }
  }
}

const storefrontController = new StorefrontController();
module.exports = storefrontController;

// Expose cache so admin product mutations can invalidate it
module.exports.catalogCache = catalogCache;
