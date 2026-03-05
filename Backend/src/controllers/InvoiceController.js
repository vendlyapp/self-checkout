const { query } = require('../../lib/database');
const invoiceService = require('../services/InvoiceService');
const orderService = require('../services/OrderService');
const storeService = require('../services/StoreService');
const userService = require('../services/UserService');
const { HTTP_STATUS } = require('../types');

class InvoiceController {
  /**
   * Crea una nueva factura a partir de una orden
   * @route POST /api/invoices
   */
  async createInvoice(req, res) {
    try {
      const {
        orderId,
        customerName,
        customerEmail,
        customerAddress,
        customerCity,
        customerPostalCode,
        customerPhone,
        saveCustomerData = false,
      } = req.body;

      if (!orderId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El ID de la orden es requerido',
        });
      }

      // Obtener la orden completa
      let order;
      try {
        const orderResult = await orderService.findById(orderId);
        if (!orderResult.success || !orderResult.data) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: 'Orden no encontrada',
          });
        }
        order = orderResult.data;
      } catch (error) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Orden no encontrada',
        });
      }

      // Obtener información de la tienda
      let storeInfo = null;
      if (order.storeId) {
        const storeResult = await storeService.getById(order.storeId);
        if (storeResult.success && storeResult.data) {
          storeInfo = storeResult.data;
        }
      }

      // Obtener taxRate de cada producto directamente desde Product
      const productIds = [...new Set(order.items.map((it) => it.productId))];
      const taxRateByProduct = new Map();
      try {
        const productsTaxQuery = await query(
          'SELECT id, "taxRate" FROM "Product" WHERE id = ANY($1)',
          [productIds]
        );
        for (const row of productsTaxQuery.rows) {
          const tr = row.taxRate ?? row.taxrate;
          const val = tr != null && tr !== ''
            ? (typeof tr === 'number' ? tr : parseFloat(tr))
            : 0.026;
          taxRateByProduct.set(row.id, Number.isFinite(val) && val >= 0 ? val : 0.026);
        }
      } catch (taxErr) {
        console.warn('⚠️ [InvoiceController] Error al obtener taxRate de productos, usando 2.6% por defecto:', taxErr.message);
      }

      const invoiceItems = order.items.map((item) => {
        if (!item.productName) {
          console.warn('⚠️ [InvoiceController] Item sin productName:', {
            productId: item.productId,
            hasProductName: !!item.productName,
            itemKeys: Object.keys(item),
          });
        }
        const taxRate = taxRateByProduct.get(item.productId) ?? 0.026;
        return {
          productId: item.productId,
          productName: item.productName || 'Producto',
          productSku: item.productSku || '',
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.price) * item.quantity,
          taxRate,
          metadata: { taxRate },
        };
      });
      
      // Debug: verificar items antes de crear invoice
      console.log('📋 [InvoiceController] Items preparados para invoice:', {
        itemsCount: invoiceItems.length,
        itemsWithNames: invoiceItems.filter(i => i.productName && i.productName !== 'Producto').length,
        itemsWithoutNames: invoiceItems.filter(i => !i.productName || i.productName === 'Producto').length,
        sampleItem: invoiceItems[0],
      });

      // Calcular totales desde metadata si están disponibles
      const metadata = order.metadata || {};
      const subtotal = metadata.totalBeforeVAT || order.total;
      const discountAmount = metadata.discountAmount || 0;
      const taxAmount = metadata.totalWithVAT ? (metadata.totalWithVAT - subtotal + discountAmount) : 0;
      const total = metadata.totalWithVAT || order.total;

      // Preparar datos de la factura
      const storeVatNumber = storeInfo?.vatNumber || storeInfo?.vatnumber || null;
      const invoiceData = {
        orderId: order.id,
        customerName: customerName || order.metadata?.customerData?.name || null,
        customerEmail: customerEmail || order.metadata?.customerData?.email || null,
        customerAddress: customerAddress || order.metadata?.customerData?.address || null,
        customerCity: customerCity || null,
        customerPostalCode: customerPostalCode || null,
        customerPhone: customerPhone || order.metadata?.customerData?.phone || null,
        storeId: order.storeId || storeInfo?.id || null,
        storeName: storeInfo?.name || metadata.storeName || null,
        storeAddress: storeInfo?.address || null,
        storePhone: storeInfo?.phone || null,
        storeEmail: storeInfo?.email || null,
        storeLogo: storeInfo?.logo || null,
        items: invoiceItems,
        subtotal: Number(subtotal),
        discountAmount: Number(discountAmount),
        taxAmount: Number(taxAmount),
        total: Number(total),
        paymentMethod: order.paymentMethod || null,
        metadata: {
          ...metadata,
          saveCustomerData,
          storeVatNumber: storeVatNumber || undefined,
          createdAt: new Date().toISOString(),
        },
      };

      const result = await invoiceService.create(invoiceData);

      // Regla: la orden se crea sin datos del cliente (usuario invitado). Si el cliente SÍ registra
      // sus datos aquí (factura con nombre/email/etc.), actualizamos la orden y el usuario para que
      // la orden quede "a nombre de" ese cliente. Si el cliente NO registra datos, la orden queda
      // como invitado/Kunde (no hacemos nada).
      const hasCustomerData = customerName?.trim() || customerEmail?.trim() || customerAddress?.trim() || customerPhone?.trim();
      if (result.success && hasCustomerData) {
        try {
          await orderService.updateOrderCustomerData(orderId, {
            name: customerName?.trim() || null,
            email: customerEmail?.trim() || null,
            address: customerAddress?.trim() || null,
            phone: customerPhone?.trim() || null,
          });
          if (customerName?.trim() && order.userId) {
            await userService.update(order.userId, { name: customerName.trim() });
          }
        } catch (updateErr) {
          console.warn('InvoiceController: no se pudo actualizar orden/usuario con datos del cliente:', updateErr.message);
        }
      }

      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      console.error('Error al crear factura:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al crear la factura',
      });
    }
  }

  /**
   * Obtiene una factura por ID
   * @route GET /api/invoices/:id
   */
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const result = await invoiceService.findById(id);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener factura:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al obtener la factura',
      });
    }
  }

  /**
   * Obtiene una factura por número de factura
   * @route GET /api/invoices/number/:invoiceNumber
   */
  async getInvoiceByNumber(req, res) {
    try {
      const { invoiceNumber } = req.params;
      const result = await invoiceService.findByInvoiceNumber(invoiceNumber);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener factura:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al obtener la factura',
      });
    }
  }

  /**
   * Obtiene facturas por orderId
   * @route GET /api/invoices/order/:orderId
   */
  async getInvoicesByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const result = await invoiceService.findByOrderId(orderId);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al obtener las facturas',
      });
    }
  }

  /**
   * Obtiene facturas por email del cliente
   * @route GET /api/invoices/customer/:email
   */
  async getInvoicesByCustomerEmail(req, res) {
    try {
      const { email } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const result = await invoiceService.findByCustomerEmail(email, {
        limit: Math.min(parseInt(limit) || 50, 200),
        offset: parseInt(offset) || 0,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al obtener las facturas',
      });
    }
  }

  /**
   * Obtiene una factura por su token de compartir (público, sin autenticación)
   * @route GET /api/invoices/public/:shareToken
   */
  async getInvoiceByShareToken(req, res) {
    try {
      const { shareToken } = req.params;

      if (!shareToken) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'El token de compartir es requerido',
        });
      }

      const result = await invoiceService.findByShareToken(shareToken);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener factura por token:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al obtener la factura',
      });
    }
  }

  /**
   * Obtiene facturas por storeId
   * @route GET /api/invoices/store/:storeId
   */
  async getInvoicesByStoreId(req, res) {
    try {
      const { storeId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const result = await invoiceService.findByStoreId(storeId, {
        limit: Math.min(parseInt(limit) || 100, 500),
        offset: parseInt(offset) || 0,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener facturas por tienda:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al obtener las facturas',
      });
    }
  }

  /**
   * Actualiza una factura existente
   * @route PATCH /api/invoices/:id
   */
  async updateInvoice(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await invoiceService.update(id, updateData);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      const hasCustomerData = updateData.customerName?.trim() || updateData.customerEmail?.trim() ||
        updateData.customerAddress?.trim() || updateData.customerPhone?.trim();
      if (hasCustomerData && result.data?.orderId) {
        try {
          await orderService.updateOrderCustomerData(result.data.orderId, {
            name: updateData.customerName?.trim() || null,
            email: updateData.customerEmail?.trim() || null,
            address: updateData.customerAddress?.trim() || null,
            phone: updateData.customerPhone?.trim() || null,
          });
          if (updateData.customerName?.trim()) {
            const orderResult = await orderService.findById(result.data.orderId);
            if (orderResult.success && orderResult.data?.userId) {
              await userService.update(orderResult.data.userId, { name: updateData.customerName.trim() });
            }
          }
        } catch (updateErr) {
          console.warn('InvoiceController.updateInvoice: no se pudo actualizar orden/usuario:', updateErr.message);
        }
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Error al actualizar la factura',
      });
    }
  }
}

module.exports = new InvoiceController();

