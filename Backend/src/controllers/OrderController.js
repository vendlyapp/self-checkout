const { randomUUID } = require('crypto');
const { query: dbQuery } = require('../../lib/database');
const orderService = require('../services/OrderService');
const storeService = require('../services/StoreService');
const userService = require('../services/UserService');
const analyticsService = require('../services/AnalyticsService');
const QRBillService = require('../services/QRBillService');
const { HTTP_STATUS } = require('../types');

/**
 * Controlador de órdenes
 * Maneja todas las operaciones relacionadas con órdenes de compra
 * @class OrderController
 */
class OrderController {
  constructor() {
    this.createOrderSimple = this.createOrderSimple.bind(this);
    this.confirmPayment = this.confirmPayment.bind(this);
    this.getQRCode = this.getQRCode.bind(this);
  }

  /**
   * Obtiene todas las órdenes de un usuario específico
   * @route GET /api/orders/user/:userId
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.userId - ID del usuario
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de órdenes a retornar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de órdenes del usuario
   * @throws {500} Si hay error en el servidor
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todas las órdenes del sistema (admin)
   * Endpoint solo para administradores
   * @route GET /api/orders
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit] - Límite de órdenes a retornar
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con lista de todas las órdenes
   * @throws {500} Si hay error en el servidor
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene una orden específica por su ID
   * @route GET /api/orders/:id
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.id - ID de la orden
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con los datos de la orden
   * @throws {404} Si la orden no existe
   * @throws {500} Si hay error en el servidor
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const result = await orderService.findById(id);
      const order = result.data;
      const allowed = await this._canViewOrder(req.user, order);
      if (!allowed) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Bestellung nicht gefunden',
        });
      }
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const notFound =
        error.message.includes('no encontrada') ||
        error.message.includes('nicht gefunden');
      const statusCode = notFound
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

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
   * Crea una nueva orden para un usuario específico
   * Valida stock y actualiza inventario
   * @route POST /api/orders/:userId
   * @param {Object} req - Request object de Express
   * @param {Object} req.params - Parámetros de ruta
   * @param {string} req.params.userId - ID del usuario
   * @param {Object} req.body - Datos de la orden
   * @param {Array} req.body.items - Items de la orden
   * @param {string} req.body.items[].productId - ID del producto
   * @param {number} req.body.items[].quantity - Cantidad del producto
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la orden creada
   * @throws {400} Si hay stock insuficiente o producto no encontrado
   * @throws {500} Si hay error en el servidor
   */
  async createOrder(req, res) {
    try {
      const { userId } = req.params;
      const { items } = req.body || {};

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'La orden debe incluir al menos un item',
        });
      }

      const result = await orderService.create(userId, req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrado') ||
                        error.message.includes('Stock insuficiente')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva orden (método simplificado)
   * Recibe userId e items en el body en lugar de params
   * @route POST /api/orders
   * @param {Object} req - Request object de Express
   * @param {Object} req.body - Datos de la orden
   * @param {string} req.body.userId - ID del usuario
   * @param {Array} req.body.items - Items de la orden
   * @param {string} req.body.items[].productId - ID del producto
   * @param {number} req.body.items[].quantity - Cantidad del producto
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con la orden creada
   * @throws {400} Si faltan userId o items, o hay stock insuficiente
   * @throws {500} Si hay error en el servidor
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
          error: 'La orden debe incluir items válidos',
        });
      }

      let resolvedUserId = userId;

      // Si hay un userId, verificar si es el dueño de la tienda
      // Si es el dueño, NO usar ese userId, sino crear un usuario invitado con los datos del formulario
      if (resolvedUserId && storeId) {
        const isStoreOwner = await this.isStoreOwner(resolvedUserId, storeId);
        if (isStoreOwner) {
          // El usuario logueado es el dueño de la tienda, crear usuario invitado con datos del formulario
          resolvedUserId = null; // Forzar creación de usuario invitado
        }
      }

      // Si no hay userId o era el dueño, crear usuario invitado con datos del formulario
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
      const statusCode = error.message.includes('no encontrado') ||
                        error.message.includes('Stock insuficiente')
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Verifica si un usuario es el dueño de una tienda
   * @param {string} userId - ID del usuario
   * @param {string} storeId - ID de la tienda
   * @returns {Promise<boolean>} True si es el dueño
   */
  async isStoreOwner(userId, storeId) {
    try {
      const store = await this.findStore(null, storeId);
      if (!store) {
        return false;
      }
      return store.ownerId === userId;
    } catch (error) {
      console.error('Error verificando dueño de tienda:', error);
      return false;
    }
  }

  /**
   * Genera y devuelve el SVG del QR Code suizo para una orden QR-Rechnung.
   * Público (no requiere auth) — el kiosko lo llama justo después de crear la orden.
   * @route GET /api/orders/:id/qr-code
   */
  async getQRCode(req, res) {
    try {
      const { id } = req.params;

      const orderResult = await orderService.findById(id);
      if (!orderResult.success || !orderResult.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Orden no encontrada' });
      }

      const order = orderResult.data;

      if (order.paymentMethod !== 'qr-rechnung') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Esta orden no es de tipo QR-Rechnung' });
      }

      const metadata = order.metadata || {};
      const qrrReference = metadata.qrrReference;

      if (!qrrReference) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'Esta orden no tiene referencia QRR generada' });
      }

      const { query: dbQuery } = require('../../lib/database');
      const pmResult = await dbQuery(
        `SELECT config FROM "PaymentMethod" WHERE "storeId" = $1 AND code = 'qr-rechnung' AND "isActive" = true LIMIT 1`,
        [order.storeId]
      );

      const creditorConfig = pmResult.rows[0]?.config;
      if (!creditorConfig) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El método QR-Rechnung no está configurado para esta tienda. Configura el QR-IBAN en el panel de administración.',
        });
      }

      const validation = QRBillService.validateQRIBAN(creditorConfig.qrIban || '');
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: validation.error });
      }

      const amount = Number(metadata.totalWithVAT || order.total);
      const additionalInfo = `Bestellung ${id.slice(0, 8).toUpperCase()}`;

      // qrSvg: solo el cuadrado QR (para mostrar en kiosko, escaneable)
      // billSvg: QR Bill completo con Zahlteil + Empfangsschein (para imprimir en factura)
      const qrSvg = QRBillService.generateQROnlySVG({
        creditorConfig,
        amount,
        reference: qrrReference,
        additionalInfo,
      });

      const billSvg = QRBillService.generateQRCodeSVG({
        creditorConfig,
        amount,
        reference: qrrReference,
        additionalInfo,
        language: 'DE',
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { qrSvg, billSvg, qrrReference, amount, orderId: id },
      });
    } catch (error) {
      console.error('Error al generar QR Code para orden:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al generar el QR Code',
      });
    }
  }

  /**
   * Confirma el pago de una orden QR-Rechnung pendiente.
   * Solo el admin de la tienda puede confirmar.
   * @route PATCH /api/orders/:id/confirm-payment
   */
  async confirmPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, error: 'Autenticación requerida' });
      }

      const orderResult = await orderService.findById(id);
      if (!orderResult.success || !orderResult.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Orden no encontrada' });
      }

      const order = orderResult.data;

      // Verificar que la orden pertenece a la tienda del usuario autenticado
      const isOwner = await this.isStoreOwner(userId, order.storeId);
      if (!isOwner) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'No tienes permiso para confirmar esta orden' });
      }

      if (order.status !== 'pending') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `La orden ya está en estado '${order.status}'. Solo se pueden confirmar órdenes en estado 'pending'.`,
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
        message: 'Zahlung erfolgreich bestätigt',
      });
    } catch (error) {
      console.error('Error al confirmar pago:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al confirmar el pago',
      });
    }
  }

  async resolveGuestUserId(context = {}) {
    const { storeSlug, storeId, customer } = context;

    const normalizedEmail = customer?.email?.trim().toLowerCase();
    const hasCustomerData = customer && (customer.name || customer.email);
    
    // Determinar el nombre a usar
    let displayName = null;
    
    if (hasCustomerData && customer.name && customer.name.trim().length > 0) {
      // Si el cliente llenó el formulario con su nombre, usar ese nombre real
      displayName = customer.name.trim();
    } else if (hasCustomerData && normalizedEmail) {
      // Si hay email pero no nombre, usar la parte del email antes del @
      displayName = normalizedEmail.split('@')[0];
    } else {
      // Si NO hay datos del formulario (cliente eligió "Weiter ohne Daten"), usar "Invitado de X tienda"
      const store = await this.findStore(storeSlug, storeId);
      if (store?.name) {
        displayName = `Invitado de ${store.name}`;
      } else {
        displayName = 'Invitado';
      }
    }

    // Si hay email del formulario, buscar usuario existente o crear uno nuevo
    if (normalizedEmail) {
      try {
        const existingUser = await userService.findByEmail(normalizedEmail);
        if (existingUser?.data?.id) {
          // Si el usuario existe, actualizar su nombre si tenemos uno mejor del formulario
          if (hasCustomerData && customer.name && customer.name.trim().length > 0) {
            const currentName = existingUser.data.name || '';
            if (currentName !== customer.name.trim()) {
              try {
                await userService.update(existingUser.data.id, {
                  name: customer.name.trim()
                });
              } catch (updateError) {
                console.warn('No se pudo actualizar el nombre del usuario:', updateError.message);
              }
            }
          }
          return existingUser.data.id;
        }
      } catch (error) {
        if (!error.message?.toLowerCase().includes('no encontrado')) {
          throw error;
        }
      }
    }

    // Generar email si no hay uno del formulario
    const generatedEmail = normalizedEmail || this.generateGuestEmail(storeSlug, storeId);
    const password = randomUUID();

    // Crear usuario con los datos disponibles
    // Si hay datos del formulario, usar esos datos reales
    // Si no hay datos, usar "Invitado de X tienda"
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
   * Top productos más vendidos de la tienda (para Bestseller en dashboard).
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtiene estadísticas de órdenes
   * Retorna totales de ventas, número de órdenes, etc.
   * @route GET /api/orders/stats
   * @param {Object} req - Request object de Express
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con estadísticas de órdenes
   * @throws {500} Si hay error en el servidor
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene las órdenes más recientes
   * @route GET /api/orders/recent
   * @param {Object} req - Request object de Express
   * @param {Object} req.query - Query parameters
   * @param {number} [req.query.limit=10] - Número de órdenes a retornar (default: 10)
   * @param {Object} res - Response object de Express
   * @returns {Promise<void>} JSON con las órdenes recientes
   * @throws {500} Si hay error en el servidor
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
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza el estado de una orden
   * @route PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El estado es requerido',
        });
      }

      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
        });
      }

      const result = await orderService.updateStatus(id, status);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      const statusCode = error.message.includes('no encontrada')
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new OrderController();
