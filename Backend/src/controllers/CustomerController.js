const customerService = require('../services/CustomerService');
const { HTTP_STATUS } = require('../types');
const logger = require('../utils/logger');

/**
 * Customer controller.
 * Handles customer CRUD, orders, invoices, and statistics.
 */
class CustomerController {
  /** @route GET /api/stores/:storeId/customers */
  async getCustomersByStore(req, res) {
    try {
      const { storeId } = req.params;
      const { role, storeId: userStoreId } = req.user;

      if (role !== 'SUPER_ADMIN' && userStoreId !== storeId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Access denied' });
      }

      const { limit, offset, search } = req.query;

      const result = await customerService.getByStoreId(storeId, {
        limit: limit ? Math.min(parseInt(limit), 500) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        search: search || null,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to fetch customers', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route GET /api/customers/:id */
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const result = await customerService.getById(id);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to fetch customer', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route GET /api/stores/:storeId/customers/email/:email */
  async getCustomerByEmail(req, res) {
    try {
      const { storeId, email } = req.params;
      const { role, storeId: userStoreId } = req.user;

      if (role !== 'SUPER_ADMIN' && userStoreId !== storeId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Access denied' });
      }

      const result = await customerService.getByEmail(storeId, email);

      if (!result.success) {
        return res.status(HTTP_STATUS.NOT_FOUND).json(result);
      }

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to fetch customer by email', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route POST /api/stores/:storeId/customers */
  async createOrUpdateCustomer(req, res) {
    try {
      const { storeId } = req.params;
      const { role, storeId: userStoreId } = req.user;

      if (role !== 'SUPER_ADMIN' && userStoreId !== storeId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Access denied' });
      }

      const result = await customerService.createOrUpdate(storeId, req.body);
      res.status(result.isNew ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to create/update customer', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route GET /api/customers/:id/orders/:storeId */
  async getCustomerOrders(req, res) {
    try {
      const { id, storeId } = req.params;
      const { role, storeId: userStoreId } = req.user;

      if (role !== 'SUPER_ADMIN' && userStoreId !== storeId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Access denied' });
      }

      if (!storeId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'storeId is required',
        });
      }

      const result = await customerService.getCustomerOrders(id, storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to fetch customer orders', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route GET /api/customers/:id/invoices/:storeId */
  async getCustomerInvoices(req, res) {
    try {
      const { id, storeId } = req.params;
      const { role, storeId: userStoreId } = req.user;

      if (role !== 'SUPER_ADMIN' && userStoreId !== storeId) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: 'Access denied' });
      }

      if (!storeId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'storeId is required',
        });
      }

      const result = await customerService.getCustomerInvoices(id, storeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to fetch customer invoices', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route PUT /api/customers/:id/stats */
  async updateCustomerStats(req, res) {
    try {
      const { id } = req.params;
      const result = await customerService.updateStats(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to update customer stats', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  /** @route DELETE /api/customers/:id */
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const result = await customerService.delete(id);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      logger.error('Failed to delete customer', { error: error.message });
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new CustomerController();
