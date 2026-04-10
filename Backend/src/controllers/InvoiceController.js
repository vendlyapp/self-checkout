const { query } = require('../../lib/database');
const invoiceService = require('../services/InvoiceService');
const orderService = require('../services/OrderService');
const storeService = require('../services/StoreService');
const userService = require('../services/UserService');
const QRBillService = require('../services/QRBillService');
const { generateInvoicePDF } = require('../services/InvoicePDFService');
const { HTTP_STATUS } = require('../types');
const logger = require('../utils/logger');

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
          error: 'orderId is required',
        });
      }

      // Obtener la orden completa
      let order;
      try {
        const orderResult = await orderService.findById(orderId);
        if (!orderResult.success || !orderResult.data) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: 'Order not found',
          });
        }
        order = orderResult.data;
      } catch (error) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Order not found',
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
        logger.warn('[InvoiceController.createInvoice] Failed to fetch product taxRate, using 2.6% fallback', { error: taxErr.message });
      }

      const invoiceItems = order.items.map((item) => {
        if (!item.productName) {
          logger.warn('[InvoiceController.createInvoice] Item without productName', {
            productId: item.productId,
            hasProductName: !!item.productName,
            itemKeys: Object.keys(item),
          });
        }
        const taxRate = taxRateByProduct.get(item.productId) ?? 0.026;
        return {
          productId: item.productId,
          productName: item.productName || 'Product',
          productSku: item.productSku || '',
          quantity: item.quantity,
          price: Number(item.price),
          subtotal: Number(item.price) * item.quantity,
          taxRate,
          metadata: { taxRate },
        };
      });
      
      logger.debug('[InvoiceController.createInvoice] Prepared invoice items', {
        itemsCount: invoiceItems.length,
        itemsWithNames: invoiceItems.filter(i => i.productName && i.productName !== 'Product').length,
        itemsWithoutNames: invoiceItems.filter(i => !i.productName || i.productName === 'Product').length,
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
        // QR-Rechnung: pasar referencia QRR y snapshot del acreedor para guardar en factura
        qrrReference: order.paymentMethod === 'qr-rechnung' ? (metadata.qrrReference || null) : null,
        qrCreditorSnapshot: order.paymentMethod === 'qr-rechnung' ? await (async () => {
          try {
            const pmResult = await query(
              `SELECT config FROM "PaymentMethod" WHERE "storeId" = $1 AND code = 'qr-rechnung' AND "isActive" = true LIMIT 1`,
              [order.storeId]
            );
            return pmResult.rows[0]?.config || null;
          } catch { return null; }
        })() : null,
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
          logger.warn('[InvoiceController.createInvoice] Failed to sync customer data into order/user', { error: updateErr.message });
        }
      }

      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      logger.error('[InvoiceController.createInvoice] Failed to create invoice', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to create invoice',
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
      logger.error('[InvoiceController.getInvoiceById] Failed to fetch invoice', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to fetch invoice',
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
      logger.error('[InvoiceController.getInvoiceByNumber] Failed to fetch invoice', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to fetch invoice',
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
      logger.error('[InvoiceController.getInvoicesByOrderId] Failed to fetch invoices', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to fetch invoices',
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
      logger.error('[InvoiceController.getInvoicesByCustomerEmail] Failed to fetch invoices', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to fetch invoices',
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
          error: 'shareToken is required',
        });
      }

      const result = await invoiceService.findByShareToken(shareToken);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('[InvoiceController.getInvoiceByShareToken] Failed to fetch invoice', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to fetch invoice',
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
      logger.error('[InvoiceController.getInvoicesByStoreId] Failed to fetch invoices', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to fetch invoices',
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
          logger.warn('[InvoiceController.updateInvoice] Failed to sync customer data into order/user', { error: updateErr.message });
        }
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('[InvoiceController.updateInvoice] Failed to update invoice', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to update invoice',
      });
    }
  }

  /**
   * Genera y devuelve el SVG del QR Code suizo para una factura QR-Rechnung.
   * Usado por el kiosko para mostrar el código en pantalla y por la factura impresa.
   * @route GET /api/invoices/:id/qr-code
   */
  async getQRCode(req, res) {
    try {
      const { id } = req.params;

      const invoiceResult = await invoiceService.findById(id);
      if (!invoiceResult.success || !invoiceResult.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Invoice not found' });
      }

      const invoice = invoiceResult.data;

      if (invoice.paymentMethod !== 'qr-rechnung') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'This invoice is not a QR-Rechnung invoice' });
      }

      const qrrReference = invoice.qrrReference;
      const creditorConfig = invoice.qrCreditorSnapshot;

      if (!qrrReference || !creditorConfig) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Missing QR data (qrrReference or qrCreditorSnapshot). Verify that QR-Rechnung payment method is configured.',
        });
      }

      const validation = QRBillService.validateQRIBAN(creditorConfig.qrIban || '');
      if (!validation.valid) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: validation.error });
      }

      const additionalInfo = invoice.invoiceNumber ? `Rechnung ${invoice.invoiceNumber}` : undefined;
      const amount = Number(invoice.total);

      // Pasar datos del deudor (cliente) si están disponibles en la factura
      const debtor = invoice.customerName ? {
        name: invoice.customerName,
        address: invoice.customerAddress || '',
        buildingNumber: '',
        zip: invoice.customerPostalCode || '',
        city: invoice.customerCity || '',
        country: 'CH',
      } : undefined;

      const billSvg = QRBillService.generateQRCodeSVG({
        creditorConfig,
        amount,
        reference: qrrReference,
        additionalInfo,
        debtor,
        language: 'DE',
      });

      // qrSvg: solo el cuadrado QR (sin layout), usado en vista compacta mobile de la factura
      const qrSvg = QRBillService.generateQROnlySVG({
        creditorConfig,
        amount,
        reference: qrrReference,
        additionalInfo,
        debtor,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          billSvg,
          qrSvg,
          qrrReference,
          amount,
          invoiceNumber: invoice.invoiceNumber,
        },
      });
    } catch (error) {
      logger.error('[InvoiceController.getQRCode] Failed to generate QR code', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to generate QR code',
      });
    }
  }
  /**
   * Genera y devuelve el PDF de una factura.
   * Para QR-Rechnung incluye el Zahlschein en la página 2.
   * Accesible con auth (admin/store) o con shareToken como query param (cliente público).
   * @route GET /api/invoices/:id/pdf
   * @route GET /api/invoices/public/:shareToken/pdf
   */
  async downloadPDF(req, res) {
    try {
      const { id, shareToken: shareTokenParam } = req.params;
      const shareToken = req.query.shareToken || shareTokenParam;

      // Resolve invoice — by ID (authenticated) or shareToken (public)
      let invoiceResult;
      if (id) {
        invoiceResult = await invoiceService.findById(id);
      } else if (shareToken) {
        invoiceResult = await invoiceService.findByShareToken(shareToken);
      } else {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, error: 'id or shareToken is required' });
      }

      if (!invoiceResult.success || !invoiceResult.data) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: 'Invoice not found' });
      }

      const inv = invoiceResult.data;

      // Build the invoice shape expected by InvoicePDFService
      const isQR = inv.paymentMethod === 'qr-rechnung';
      const creditorConfig = isQR ? (inv.qrCreditorSnapshot || null) : null;

      // Resolve store website from metadata if stored
      const meta = inv.metadata || {};
      const storeWebsite = meta.storeWebsite || null;

      // Build issuer
      const issuer = {
        name: inv.storeName || 'Vendly',
        street: inv.storeAddress || undefined,
        zip: undefined,
        city: undefined,
        email: inv.storeEmail || undefined,
        phone: inv.storePhone || undefined,
        mwstNummer: meta.storeVatNumber || undefined,
        iban: isQR && creditorConfig ? creditorConfig.qrIban : undefined,
        website: storeWebsite || undefined,
      };

      // Parse store address
      if (inv.storeAddress) {
        const m = inv.storeAddress.match(/^(.+?),?\s*(\d{4})\s+(.+)$/);
        if (m) { issuer.street = m[1].trim(); issuer.zip = m[2]; issuer.city = m[3].trim(); }
      }
      if (isQR && creditorConfig) {
        if (creditorConfig.creditorStreet) issuer.street = `${creditorConfig.creditorStreet}${creditorConfig.creditorHouseNo ? ' ' + creditorConfig.creditorHouseNo : ''}`;
        if (creditorConfig.creditorZip) issuer.zip = creditorConfig.creditorZip;
        if (creditorConfig.creditorCity) issuer.city = creditorConfig.creditorCity;
        if (creditorConfig.creditorName) issuer.name = creditorConfig.creditorName;
      }

      // Build recipient
      const recipient = {
        name: inv.customerName || 'Kunde',
        street: inv.customerAddress || undefined,
        zip: inv.customerPostalCode || undefined,
        city: inv.customerCity || undefined,
        country: 'Schweiz',
        email: inv.customerEmail || undefined,
      };

      // Build items
      const items = (inv.items || []).map((item, i) => {
        const taxRate = item.taxRate ?? (item.metadata?.taxRate) ?? 0.026;
        const rate = typeof taxRate === 'number' ? taxRate : parseFloat(taxRate) || 0.026;
        const mwstCode = rate >= 0.075 ? 'A' : 'B';
        const totalBrutto = item.subtotal || (item.price * item.quantity) || 0;
        const unitPrice = item.price || (totalBrutto / (item.quantity || 1));
        return {
          id: item.productId || `item-${i}`,
          description: item.productName || `Produkt ${i + 1}`,
          detail: item.productSku ? String(item.productSku).trim() : undefined,
          quantity: item.quantity || 1,
          unitPrice: Math.round(unitPrice * 100) / 100,
          totalBrutto: Math.round(totalBrutto * 100) / 100,
          mwstRate: rate,
          mwstCode,
        };
      });

      const totalBrutto = inv.total || 0;
      const isDeferred = ['qr-rechnung', 'qr', 'rechnung'].includes((inv.paymentMethod || '').toLowerCase());

      const issuedDate = inv.issuedAt ? new Date(inv.issuedAt) : new Date();
      const dueDate = new Date(issuedDate);
      if (isDeferred) dueDate.setDate(dueDate.getDate() + 30);

      const PAYMENT_LABELS = {
        bargeld: 'Bargeld', twint: 'TWINT', 'debit-credit': 'Debit-/Kreditkarte',
        debit: 'Debitkarte', card: 'Karte', karte: 'Karte',
        'qr-rechnung': 'QR-Rechnung', qr: 'QR-Rechnung', rechnung: 'Rechnung',
        'apple-pay': 'Apple Pay',
      };
      const paymentDisplay = PAYMENT_LABELS[(inv.paymentMethod || '').toLowerCase()] || inv.paymentMethod || '—';

      const invoiceShape = {
        id: inv.id,
        nummer: inv.invoiceNumber || inv.id,
        datum: issuedDate.toISOString(),
        leistungsDatum: (inv.orderDate || issuedDate).toString(),
        faelligkeitsDatum: dueDate.toISOString(),
        zahlungsfrist: isDeferred ? 30 : 0,
        waehrung: 'CHF',
        referenz: inv.qrrReference || inv.invoiceNumber || inv.id,
        documentType: isDeferred ? 'Rechnung' : 'Quittung',
        paymentMethodDisplay: paymentDisplay,
        isDeferredPayment: isDeferred,
        showQRSection: isQR && !!inv.qrrReference && !!creditorConfig,
        discountAmount: inv.discountAmount || 0,
        totalBrutto: Math.round(totalBrutto * 100) / 100,
        orderId: inv.orderId || undefined,
        storeLogo: inv.storeLogo || undefined,
        notes: meta.notes || undefined,
        issuer,
        recipient,
        items,
      };

      const pdfBuffer = await generateInvoicePDF(invoiceShape, creditorConfig);

      const filename = `${invoiceShape.documentType}-${invoiceShape.nummer}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.end(pdfBuffer);
    } catch (error) {
      logger.error('[InvoiceController.downloadPDF] Failed to generate PDF', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Failed to generate PDF',
      });
    }
  }
}

module.exports = new InvoiceController();

