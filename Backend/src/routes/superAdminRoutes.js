const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/SuperAdminController');
const analyticsController = require('../controllers/AnalyticsController');
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

module.exports = router;

