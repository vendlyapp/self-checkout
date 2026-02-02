const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/stores/{storeId}/customers:
 *   get:
 *     summary: Obtener todos los clientes de una tienda
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stores/:storeId/customers', authMiddleware, customerController.getCustomersByStore);

/**
 * @swagger
 * /api/stores/{storeId}/customers:
 *   post:
 *     summary: Crear o actualizar un cliente en una tienda
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/stores/:storeId/customers', authMiddleware, customerController.createOrUpdateCustomer);

/**
 * @swagger
 * /api/stores/{storeId}/customers/email/{email}:
 *   get:
 *     summary: Obtener un cliente por email y storeId
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stores/:storeId/customers/email/:email', authMiddleware, customerController.getCustomerByEmail);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customers/:id', authMiddleware, customerController.getCustomerById);

/**
 * @swagger
 * /api/customers/{id}/orders/{storeId}:
 *   get:
 *     summary: Obtener órdenes de un cliente en una tienda
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customers/:id/orders/:storeId', authMiddleware, customerController.getCustomerOrders);

/**
 * @swagger
 * /api/customers/{id}/invoices:
 *   get:
 *     summary: Obtener facturas de un cliente en una tienda
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/customers/:id/invoices/:storeId', authMiddleware, customerController.getCustomerInvoices);

/**
 * @swagger
 * /api/customers/{id}/stats:
 *   put:
 *     summary: Actualizar estadísticas de un cliente
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.put('/customers/:id/stats', authMiddleware, customerController.updateCustomerStats);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Eliminar un cliente
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/customers/:id', authMiddleware, customerController.deleteCustomer);

module.exports = router;
