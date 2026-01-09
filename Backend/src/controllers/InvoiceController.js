const invoiceService = require('../services/InvoiceService');
const orderService = require('../services/OrderService');
const storeService = require('../services/StoreService');
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

      // Preparar items de la factura
      const invoiceItems = order.items.map((item) => ({
        productId: item.productId,
        productName: item.product?.name || 'Producto',
        productSku: item.product?.sku || '',
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.price) * item.quantity,
      }));

      // Calcular totales desde metadata si están disponibles
      const metadata = order.metadata || {};
      const subtotal = metadata.totalBeforeVAT || order.total;
      const discountAmount = metadata.discountAmount || 0;
      const taxAmount = metadata.totalWithVAT ? (metadata.totalWithVAT - subtotal + discountAmount) : 0;
      const total = metadata.totalWithVAT || order.total;

      // Preparar datos de la factura
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
        items: invoiceItems,
        subtotal: Number(subtotal),
        discountAmount: Number(discountAmount),
        taxAmount: Number(taxAmount),
        total: Number(total),
        paymentMethod: order.paymentMethod || null,
        metadata: {
          ...metadata,
          saveCustomerData,
          createdAt: new Date().toISOString(),
        },
      };

      const result = await invoiceService.create(invoiceData);

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
        limit: parseInt(limit),
        offset: parseInt(offset),
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
   * Obtiene facturas por storeId
   * @route GET /api/invoices/store/:storeId
   */
  async getInvoicesByStoreId(req, res) {
    try {
      const { storeId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      const result = await invoiceService.findByStoreId(storeId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
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

