const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/SuperAdminController');
const analyticsController = require('../controllers/AnalyticsController');
const telemetryController = require('../controllers/TelemetryController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

/**
 * Rutas del Super Admin
 * Todas requieren autenticación y rol SUPER_ADMIN
 */

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Todas las rutas requieren rol SUPER_ADMIN
router.use(requireRole('SUPER_ADMIN'));

/**
 * @swagger
 * /api/super-admin/stats:
 *   get:
 *     summary: Obtener estadísticas generales de la plataforma
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', superAdminController.getPlatformStats);

/**
 * @swagger
 * /api/super-admin/stores:
 *   get:
 *     summary: Obtener todas las tiendas
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tiendas
 */
router.get('/stores', superAdminController.getAllStores);

/**
 * @swagger
 * /api/super-admin/stores/{id}:
 *   get:
 *     summary: Obtener detalles de una tienda específica
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles de la tienda
 *       404:
 *         description: Tienda no encontrada
 */
router.get('/stores/:id', superAdminController.getStoreDetails);

/**
 * @swagger
 * /api/super-admin/stores/{id}:
 *   put:
 *     summary: Actualizar información de una tienda
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               logo:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               isOpen:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tienda actualizada exitosamente
 *       404:
 *         description: Tienda no encontrada
 */
router.put('/stores/:id', superAdminController.updateStore);

/**
 * @swagger
 * /api/super-admin/stores/{id}/status:
 *   put:
 *     summary: Activar o desactivar una tienda
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado de la tienda actualizado
 *       404:
 *         description: Tienda no encontrada
 */
router.put('/stores/:id/status', superAdminController.toggleStoreStatus);

/**
 * @swagger
 * /api/super-admin/stores/{id}/regenerate-qr:
 *   post:
 *     summary: Regenerar código QR de una tienda
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code regenerado exitosamente
 *       404:
 *         description: Tienda no encontrada
 */
router.post('/stores/:id/regenerate-qr', superAdminController.regenerateQRCode);

/**
 * @swagger
 * /api/super-admin/stores/{id}/analytics:
 *   get:
 *     summary: Obtener analytics de una tienda específica
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: Analytics de la tienda
 *       404:
 *         description: Tienda no encontrada
 */
router.get('/stores/:id/analytics', superAdminController.getStoreAnalytics);

/**
 * @swagger
 * /api/super-admin/stores/{id}/orders:
 *   get:
 *     summary: Obtener órdenes de una tienda específica
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de órdenes de la tienda
 *       404:
 *         description: Tienda no encontrada
 */
router.get('/stores/:id/orders', superAdminController.getStoreOrders);

/**
 * @swagger
 * /api/super-admin/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, CUSTOMER, SUPER_ADMIN]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/users', superAdminController.getAllUsers);

/**
 * @swagger
 * /api/super-admin/products:
 *   get:
 *     summary: Obtener todos los productos agrupados por tienda
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/products', superAdminController.getAllProducts);

/**
 * @swagger
 * /api/super-admin/analytics/sales-over-time:
 *   get:
 *     summary: Obtener ventas agregadas por periodo
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         description: Fecha de inicio (ISO8601)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         description: Fecha de fin (ISO8601)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       200:
 *         description: Serie temporal de ventas
 */
router.get('/analytics/sales-over-time', analyticsController.getSalesOverTime);

/**
 * @swagger
 * /api/super-admin/analytics/store-performance:
 *   get:
 *     summary: Obtener rendimiento de tiendas
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de tiendas con métricas de ventas
 */
router.get('/analytics/store-performance', analyticsController.getStorePerformance);

/**
 * @swagger
 * /api/super-admin/analytics/top-products:
 *   get:
 *     summary: Obtener productos destacados por ventas
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [revenue, units]
 *     responses:
 *       200:
 *         description: Lista de productos destacados
 */
router.get('/analytics/top-products', analyticsController.getTopProducts);

/**
 * @swagger
 * /api/super-admin/analytics/active-overview:
 *   get:
 *     summary: Obtener resumen de usuarios activos
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: interval
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Resumen por rol
 */
router.get('/analytics/active-overview', analyticsController.getActiveOverview);

/**
 * @swagger
 * /api/super-admin/analytics/active-stores:
 *   get:
 *     summary: Obtener clientes activos por tienda
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: interval
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Clientes activos agrupados por tienda
 */
router.get('/analytics/active-stores', analyticsController.getActiveCustomersByStore);

/**
 * @swagger
 * /api/super-admin/payment-methods/global-config:
 *   get:
 *     summary: Obtener configuraciones globales de métodos de pago
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuraciones obtenidas exitosamente
 */
router.get('/payment-methods/global-config', superAdminController.getGlobalPaymentMethodConfigs);

/**
 * @swagger
 * /api/super-admin/payment-methods/global-config:
 *   put:
 *     summary: Actualizar configuración global de método de pago
 *     tags: [Super Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - disabledGlobally
 *             properties:
 *               code:
 *                 type: string
 *               disabledGlobally:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 */
router.put('/payment-methods/global-config', superAdminController.updateGlobalPaymentMethodConfig);

module.exports = router;

