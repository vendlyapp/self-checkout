const customerService = require('../services/CustomerService');
const { HTTP_STATUS } = require('../types');

class CustomerController {
  /**
   * Obtener todos los clientes de una tienda
   * @route GET /api/stores/:storeId/customers
   */
  async getCustomersByStore(req, res) {
    try {
      const { storeId } = req.params;
      const { limit, offset, search } = req.query;

      const result = await customerService.getByStoreId(storeId, {
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        search: search || null,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Abrufen der Kunden',
      });
    }
  }

  /**
   * Obtener un cliente por ID
   * @route GET /api/customers/:id
   */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      const result = await customerService.getById(id);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Abrufen des Kunden',
      });
    }
  }

  /**
   * Obtener un cliente por email y storeId
   * @route GET /api/stores/:storeId/customers/email/:email
   */
  async getCustomerByEmail(req, res) {
    try {
      const { storeId, email } = req.params;

      const result = await customerService.getByEmail(storeId, email);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener cliente por email:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Abrufen des Kunden',
      });
    }
  }

  /**
   * Crear o actualizar un cliente
   * @route POST /api/stores/:storeId/customers
   */
  async createOrUpdateCustomer(req, res) {
    try {
      const { storeId } = req.params;
      const customerData = req.body;

      const result = await customerService.createOrUpdate(storeId, customerData);

      res.status(result.isNew ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al crear/actualizar cliente:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Erstellen/Aktualisieren des Kunden',
      });
    }
  }

  /**
   * Obtener órdenes de un cliente en una tienda
   * @route GET /api/customers/:id/orders/:storeId
   */
  async getCustomerOrders(req, res) {
    try {
      const { id, storeId } = req.params;

      if (!storeId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Store-ID ist erforderlich',
        });
      }

      const result = await customerService.getCustomerOrders(id, storeId);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener órdenes del cliente:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Abrufen der Bestellungen',
      });
    }
  }

  /**
   * Obtener facturas de un cliente
   * @route GET /api/customers/:id/invoices/:storeId
   */
  async getCustomerInvoices(req, res) {
    try {
      const { id, storeId } = req.params;

      if (!storeId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Store-ID ist erforderlich',
        });
      }

      const result = await customerService.getCustomerInvoices(id, storeId);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al obtener facturas del cliente:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Abrufen der Rechnungen',
      });
    }
  }

  /**
   * Actualizar estadísticas de un cliente
   * @route PUT /api/customers/:id/stats
   */
  async updateCustomerStats(req, res) {
    try {
      const { id } = req.params;

      const result = await customerService.updateStats(id);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Aktualisieren der Statistiken',
      });
    }
  }

  /**
   * Eliminar un cliente
   * @route DELETE /api/customers/:id
   */
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      const result = await customerService.delete(id);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Fehler beim Löschen des Kunden',
      });
    }
  }
}

module.exports = new CustomerController();
