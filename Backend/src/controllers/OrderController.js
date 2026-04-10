const { randomUUID } = require('crypto');
const { query: dbQuery } = require('../../lib/database');
const orderService = require('../services/OrderService');
const storeService = require('../services/StoreService');
const userService = require('../services/UserService');
const analyticsService = require('../services/AnalyticsService');
const QRBillService = require('../services/QRBillService');
const { HTTP_STATUS } = require('../types');
const logger = require('../utils/logger');

/**
 * Parses a combined Swiss address from the format "Strasse Nr., PLZ Ort"
 * into its individual parts for the QR Bill.
 * @param {string} address - e.g. "Bahnhofstrasse 12, 8001 Zürich"
 * @returns {{ street: string, buildingNumber: string, zip: string, city: string }}
 */
function _parseSwissAddress(address) {
  if (!address?.trim()) return { street: '', buildingNumber: '', zip: '', city: '' };
  const commaIdx = address.indexOf(',');
  let streetPart = address.trim();
  let plzOrtPart = '';
  if (commaIdx > 0) {
    streetPart = address.slice(0, commaIdx).trim();
    plzOrtPart = address.slice(commaIdx + 1).trim();
  }
  const nrMatch = streetPart.match(/\s+(\d+[a-z]?)$/i);
  const street = nrMatch ? streetPart.slice(0, nrMatch.index).trim() : streetPart;
  const buildingNumber = nrMatch ? nrMatch[1] : '';
  let zip = '';
  let city = '';
  const plzOrtMatch = plzOrtPart.match(/^(\d{4,5})\s+(.+)$/);
  if (plzOrtMatch) {
    zip = plzOrtMatch[1];
    city = plzOrtMatch[2].trim();
  }
  return { street, buildingNumber, zip, city };
}

/**
 * Order controller
 * Handles all operations related to purchase orders
 * @class OrderController
 */
class OrderController {
  constructor() {
    this.createOrderSimple = this.createOrderSimple.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.getQRCode = this.getQRCode.bind(this);
  }

  /**
   * Gets all orders for a specific user
   * @route GET /api/orders/user/:userId
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.userId - User ID
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Maximum number of orders to return
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON with user's order list
   * @throws {500} On server error
   */
  async getOrdersByUserId(req, res) {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const role = req.user?.role;
      const selfId = req.user?.userId;
      if (role !== 'SUPER_ADMIN' && userId !== selfId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Forbidden',
        });
      }

      const options = {};
      if (limit) options.limit = parseInt(limit);

      const result = await orderService.findByUserId(userId, options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets all orders in the system (admin)
   * Admin-only endpoint
   * @route GET /api/orders
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Maximum number of orders to return
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON with all orders list
   * @throws {500} On server error
   */
  async getAllOrders(req, res) {
    try {
      const { limit, offset, status } = req.query;
      const options = {};
      if (limit)  options.limit  = Math.min(parseInt(limit)  || 100, 500);
      if (offset) options.offset = parseInt(offset) || 0;
      if (status) options.status = status;

      // ── Tenant isolation ──────────────────────────────────────────────────
      // SUPER_ADMIN may pass an explicit storeId filter; everyone else is
      // automatically scoped to their own store. Unauthenticated callers on
      // optionalAuth routes receive an empty result.
      const role = req.user?.role;
      if (role === 'SUPER_ADMIN') {
        if (req.query.storeId) options.storeId = req.query.storeId;
      } else if (req.user?.storeId) {
        options.storeId = req.user.storeId;
      } else {
        // No authenticated user with a known store — return empty safely
        return res.status(HTTP_STATUS.OK).json({ success: true, data: [], count: 0, total: 0 });
      }

      const result = await orderService.findAll(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets a specific order by its ID
   * @route GET /api/orders/:id
   * Arrow property so Express calls the handler with correct `this` binding.
   */
  getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await orderService.findById(id);
      const order = result.data;
      const allowed = await this._canViewOrder(req.user, order);
      if (!allowed) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Order not found',
        });
      }
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  };

  /**
   * Returns whether the authenticated user may read full order details.
   */
  async _canViewOrder(user, order) {
    if (!user || !order) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (order.userId === user.userId) return true;
    if (user.role === 'ADMIN') {
      if (user.storeId && order.storeId && order.storeId === user.storeId) {
        return true;
      }
      return this._orderHasProductOwnedBy(order.id, user.userId);
    }
    return false;
  }

  async _orderHasProductOwnedBy(orderId, ownerUserId) {
    const r = await dbQuery(
      `SELECT 1 FROM "OrderItem" oi
       INNER JOIN "Product" p ON p.id = oi."productId"
       WHERE oi."orderId" = $1 AND p."ownerId" = $2
       LIMIT 1`,
      [orderId, ownerUserId]
    );
    return r.rows.length > 0;
  }

  /**
   * Creates a new order for a specific user
   * Validates stock and updates inventory
   * @route POST /api/orders/:userId
   * @param {Object} req - Express request object
   * @param {Object} req.params - Route parameters
   * @param {string} req.params.userId - User ID
   * @param {Object} req.body - Order data
   * @param {Array} req.body.items - Order items
   * @param {string} req.body.items[].productId - Product ID
   * @param {number} req.body.items[].quantity - Product quantity
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON with the created order
   * @throws {400} On insufficient stock or product not found
   * @throws {500} On server error
   */
  async createOrder(req, res) {
    try {
      const { userId } = req.params;
      const { items } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Order must include at least one item',
        });
      }

      const result = await orderService.create(userId, req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Creates a new order (simplified method)
   * Receives userId and items in the body instead of params
   * @route POST /api/orders
   * @param {Object} req - Express request object
   * @param {Object} req.body - Order data
   * @param {string} req.body.userId - User ID
   * @param {Array} req.body.items - Order items
   * @param {string} req.body.items[].productId - Product ID
   * @param {number} req.body.items[].quantity - Product quantity
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON with the created order
   * @throws {400} On missing userId or items, or insufficient stock
   * @throws {500} On server error
   */
  async createOrderSimple(req, res) {
    try {
      const {
        userId,
        items,
        storeSlug,
        storeId,
        customer,
        paymentMethod,
        total,
        metadata,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Order must include valid items',
        });
      }

      let resolvedUserId = userId;

      // If there is a userId, check if they are the store owner
      // If they are the owner, do NOT use that userId — create a guest user with form data instead
      if (resolvedUserId && storeId) {
        const isStoreOwner = await this.isStoreOwner(resolvedUserId, storeId);
        if (isStoreOwner) {
          // The logged-in user is the store owner — create a guest user with form data
          resolvedUserId = null; // Force guest user creation
        }
      }

      // If no userId or it was the owner, create a guest user with form data
      if (!resolvedUserId) {
        try {
          resolvedUserId = await this.resolveGuestUserId({
            storeSlug,
            storeId,
            customer,
          });
        } catch (guestError) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: guestError.message,
          });
        }
      }

      const result = await orderService.create(resolvedUserId, {
        items,
        paymentMethod,
        total,
        metadata,
        storeSlug,
        storeId,
        customer,
      });
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Checks if a user is the owner of a store
   * @param {string} userId - User ID
   * @param {string} storeId - Store ID
   * @returns {Promise<boolean>} True if the user is the owner
   */
  async isStoreOwner(userId, storeId) {
    try {
      const store = await this.findStore(null, storeId);
      if (!store) {
        return false;
      }
      return store.ownerId === userId;
    } catch (error) {
      logger.error('Error checking store owner', { userId, storeId, error: error.message });
      return false;
    }
  }

  /**
   * Generates and returns the Swiss QR Code SVG for a QR-Rechnung order.
   * Public (no auth required) — the kiosk calls this right after creating the order.
   * @route GET /api/orders/:id/qr-code
   */
  async getQRCode(req, res) {
    try {
      const { id } = req.params;

      const orderResult = await orderService.findById(id);
      if (!orderResult.success || !orderResult.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Order not found' });
      }

      const order = orderResult.data;

      if (order.paymentMethod !== 'qr-rechnung') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'This order is not a QR-Rechnung type' });
      }

      const metadata = order.metadata || {};
      const qrrReference = metadata.qrrReference;

      if (!qrrReference) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'This order has no generated QRR reference' });
      }

      // Use snapshot stored in the order (preferred) or query live config as fallback
      let creditorConfig = metadata.qrCreditorSnapshot || null;
      if (!creditorConfig) {
        const { query: dbQuery } = require('../../lib/database');
        const pmResult = await dbQuery(
          `SELECT config FROM "PaymentMethod" WHERE "storeId" = $1 AND code = 'qr-rechnung' AND "isActive" = true LIMIT 1`,
          [order.storeId]
        );
        creditorConfig = pmResult.rows[0]?.config || null;
      }

      if (!creditorConfig) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'The QR-Rechnung method is not configured for this store. Configure the QR-IBAN in the admin panel.',
        });
      }

      const validation = QRBillService.validateQRIBAN(creditorConfig.qrIban || '');
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: validation.error });
      }

      const amount = Number(metadata.totalWithVAT || order.total);
      const additionalInfo = `Bestellung ${id.slice(0, 8).toUpperCase()}`;

      // Build debtor data from metadata.customer if available.
      // Only included if we have name + full address (zip + city).
      const customer = metadata.customer;
      let debtor;
      if (customer?.name && customer?.address) {
        const parsed = _parseSwissAddress(customer.address);
        if (parsed.zip && parsed.city) {
          debtor = {
            name: customer.name,
            address: parsed.street || '',
            buildingNumber: parsed.buildingNumber || '',
            zip: parsed.zip,
            city: parsed.city,
            country: 'CH',
          };
        }
      }

      // qrSvg: just the QR square (for kiosk display, scannable)
      // billSvg: full QR Bill with Zahlteil + Empfangsschein (for invoice printing)
      const qrSvg = QRBillService.generateQROnlySVG({
        creditorConfig,
        amount,
        reference: qrrReference,
        additionalInfo,
        debtor,
      });

      const billSvg = QRBillService.generateQRCodeSVG({
        creditorConfig,
        amount,
        reference: qrrReference,
        additionalInfo,
        debtor,
        language: 'DE',
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { qrSvg, billSvg, qrrReference, amount, orderId: id },
      });
    } catch (error) {
      logger.error('Error generating QR Code for order', { error: error.message });
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message || 'Error generating QR Code',
      });
    }
  }

  /**
   * Confirms payment for a pending QR-Rechnung order.
   * Only the store admin can confirm.
   * @route PATCH /api/orders/:id/confirm-payment
   */
  async confirmPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId ?? req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Authentication required' });
      }

      const orderResult = await orderService.findById(id);
      if (!orderResult.success || !orderResult.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Order not found' });
      }

      const order = orderResult.data;

      // Verify the order belongs to the authenticated user's store
      const isOwner = await this.isStoreOwner(userId, order.storeId);
      if (!isOwner) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'You do not have permission to confirm this order' });
      }

      if (order.status !== 'pending') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Order is already in '${order.status}' status. Only 'pending' orders can be confirmed.`,
        });
      }

      const { query: dbQuery } = require('../../lib/database');
      const confirmedAt = new Date().toISOString();

      await dbQuery(
        `UPDATE "Order"
         SET status = 'completed',
             metadata = metadata || $1::jsonb,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [JSON.stringify({ confirmedAt, confirmedBy: userId }), id]
      );

      await dbQuery(
        `UPDATE "Invoice"
         SET status = 'paid',
             "paidAt" = CURRENT_TIMESTAMP,
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE "orderId" = $1`,
        [id]
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { orderId: id, status: 'completed', confirmedAt },
        message: 'Payment successfully confirmed',
      });
    } catch (error) {
      logger.error('Error confirming payment', { error: error.message });
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message || 'Error confirming payment',
      });
    }
  }

  async resolveGuestUserId(context = {}) {
    const { storeSlug, storeId, customer } = context;

    const normalizedEmail = customer?.email?.trim().toLowerCase();
    const hasCustomerData = customer && (customer.name || customer.email);

    // Determine the display name to use
    let displayName = null;

    if (hasCustomerData && customer.name && customer.name.trim().length > 0) {
      // If the customer filled in the form with their name, use that real name
      displayName = customer.name.trim();
    } else if (hasCustomerData && normalizedEmail) {
      // If there is an email but no name, use the part before @
      displayName = normalizedEmail.split('@')[0];
    } else {
      // If there is NO form data (customer chose "Weiter ohne Daten"), use "Guest of X store"
      const store = await this.findStore(storeSlug, storeId);
      if (store?.name) {
        displayName = `Invitado de ${store.name}`;
      } else {
        displayName = 'Invitado';
      }
    }

    // If there is an email from the form, look for an existing user or create a new one
    if (normalizedEmail) {
      try {
        const existingUser = await userService.findByEmail(normalizedEmail);
        if (existingUser?.data?.id) {
          // If the user exists, update their name if we have a better one from the form
          if (hasCustomerData && customer.name && customer.name.trim().length > 0) {
            const currentName = existingUser.data.name || '';
            if (currentName !== customer.name.trim()) {
              try {
                await userService.update(existingUser.data.id, {
                  name: customer.name.trim()
                });
              } catch (updateError) {
                logger.warn('Could not update user name', { error: updateError.message });
              }
            }
          }
          return existingUser.data.id;
        }
      } catch (error) {
        if (!error.message?.toLowerCase().includes('not found') && !error.message?.toLowerCase().includes('no encontrado')) {
          throw error;
        }
      }
    }

    // Generate email if there is none from the form
    const generatedEmail = normalizedEmail || this.generateGuestEmail(storeSlug, storeId);
    const password = randomUUID();

    // Create user with available data
    // If there is form data, use that real data
    // If there is no data, use "Guest of X store"
    const userData = {
      email: generatedEmail,
      password,
      name: displayName,
      role: 'CUSTOMER',
    };

    const createdUser = await userService.create(userData);

    return createdUser.data.id;
  }

  async findStore(storeSlug, storeId) {
    if (storeId) {
      const store = await storeService.getById(storeId);
      if (store) {
        return store;
      }
    }

    if (storeSlug) {
      const store = await storeService.getBySlug(storeSlug);
      if (store) {
        return store;
      }
    }

    return null;
  }

  generateGuestEmail(storeSlug, storeId) {
    const base = storeSlug || storeId || 'guest';
    const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    return `guest+${base}-${suffix}@vendly.guest`;
  }

  /**
   * Top selling products for the store (for Bestseller in dashboard).
   * @route GET /api/orders/top-products
   */
  async getTopProducts(req, res) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        return res.status(HTTP_STATUS.OK).json({ success: true, data: [] });
      }
      const { limit = 5, metric = 'units' } = req.query;
      const data = await analyticsService.getTopProductsByStore(storeId, {
        limit: parseInt(limit) || 5,
        metric: metric === 'revenue' ? 'revenue' : 'units',
      });
      res.status(HTTP_STATUS.OK).json({ success: true, data });
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Gets order statistics
   * Returns sales totals, number of orders, etc.
   * @route GET /api/orders/stats
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON with order statistics
   * @throws {500} On server error
   */
  async getOrderStats(req, res) {
    try {
      const role = req.user?.role;
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Forbidden',
        });
      }

      const { date, dateFrom, dateTo, ownerId: ownerIdQuery } = req.query;
      const options = {};

      if (date) {
        options.date = date;
      }
      if (dateFrom && dateTo) {
        options.dateFrom = dateFrom;
        options.dateTo = dateTo;
      }

      if (role === 'ADMIN') {
        options.ownerId = req.user.userId;
      } else if (role === 'SUPER_ADMIN') {
        if (ownerIdQuery) {
          options.ownerId = ownerIdQuery;
        }
      }

      const result = await orderService.getStats(options);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Gets the most recent orders
   * @route GET /api/orders/recent
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit=10] - Number of orders to return (default: 10)
   * @param {Object} res - Express response object
   * @returns {Promise<void>} JSON with recent orders
   * @throws {500} On server error
   */
  async getRecentOrders(req, res) {
    try {
      const role = req.user?.role;
      const { limit, status, storeId: storeIdQuery } = req.query;

      let effectiveStoreId = null;
      if (role === 'SUPER_ADMIN') {
        effectiveStoreId = storeIdQuery || null;
      } else if (role === 'ADMIN') {
        effectiveStoreId = req.user.storeId || null;
        if (!effectiveStoreId) {
          return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: [],
            count: 0,
          });
        }
      } else {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Forbidden',
        });
      }

      const result = await orderService.getRecentOrders(
        parseInt(limit, 10) || 10,
        status || null,
        effectiveStoreId
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * @route GET /api/orders/today-customers
   * Distinct customers with orders today (calendar day, default Europe/Zurich).
   */
  async getTodayCustomers(req, res) {
    try {
      const role = req.user?.role;
      const { storeId: storeIdQuery, timeZone: tzQuery } = req.query;

      let effectiveStoreId = null;
      if (role === 'SUPER_ADMIN') {
        effectiveStoreId = storeIdQuery || null;
        if (!effectiveStoreId) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            error: 'storeId is required',
          });
        }
      } else if (role === 'ADMIN') {
        effectiveStoreId = req.user.storeId || null;
        if (!effectiveStoreId) {
          return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
              totalCount: 0,
              customers: [],
              timeZone: 'Europe/Zurich',
            },
          });
        }
      } else {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          error: 'Forbidden',
        });
      }

      const timeZone =
        typeof tzQuery === 'string' && tzQuery.length > 0 ? tzQuery : 'Europe/Zurich';

      const result = await orderService.getTodayCustomersForStore(
        effectiveStoreId,
        timeZone,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Updates the status of an order
   * @route PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Status is required',
        });
      }

      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const result = await orderService.updateStatus(id, status);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const status = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new OrderController();
