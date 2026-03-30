const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const { validateUUID, validateOrder } = require('../middleware/validation');
const { checkoutLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Obtener estadísticas de órdenes
 *     description: Retorna estadísticas generales de órdenes del sistema
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total de órdenes
 *                         pending:
 *                           type: integer
 *                           description: Órdenes pendientes
 *                         completed:
 *                           type: integer
 *                           description: Órdenes completadas
 *                         cancelled:
 *                           type: integer
 *                           description: Órdenes canceladas
 *                         totalRevenue:
 *                           type: number
 *                           description: Ingresos totales
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', authMiddleware, orderController.getOrderStats);

// Top productos de la tienda (Bestseller) — requiere auth y storeId
router.get('/top-products', authMiddleware, orderController.getTopProducts);

// Ruta para admin - todas las órdenes
router.get('/', optionalAuth, orderController.getAllOrders);

/**
 * @swagger
 * /api/orders/recent:
 *   get:
 *     summary: Obtener órdenes recientes
 *     description: Retorna las órdenes más recientes del sistema
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de órdenes a retornar
 *     responses:
 *       200:
 *         description: Órdenes recientes obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Order'
 *                           - type: object
 *                             properties:
 *                               user:
 *                                 $ref: '#/components/schemas/User'
 *                               items:
 *                                 type: array
 *                                 items:
 *                                   allOf:
 *                                     - type: object
 *                                       properties:
 *                                         id:
 *                                           type: string
 *                                         quantity:
 *                                           type: integer
 *                                         price:
 *                                           type: number
 *                                     - type: object
 *                                       properties:
 *                                         product:
 *                                           $ref: '#/components/schemas/Product'
 *                     count:
 *                       type: integer
 *                       description: Número total de órdenes retornadas
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/recent', authMiddleware, orderController.getRecentOrders);

router.get('/today-customers', authMiddleware, orderController.getTodayCustomers);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     description: Retorna la información detallada de una orden específica
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Order'
 *                         - type: object
 *                           properties:
 *                             user:
 *                               $ref: '#/components/schemas/User'
 *                             items:
 *                               type: array
 *                               items:
 *                                 allOf:
 *                                   - type: object
 *                                     properties:
 *                                       id:
 *                                         type: string
 *                                       quantity:
 *                                         type: integer
 *                                       price:
 *                                         type: number
 *                                   - type: object
 *                                     properties:
 *                                       product:
 *                                         $ref: '#/components/schemas/Product'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// /user/:userId must stay before /:id (single-segment routes like /recent are registered above)
router.get('/user/:userId', authMiddleware, validateUUID('userId'), orderController.getOrdersByUserId);

router.get('/:id', authMiddleware, validateUUID('id'), orderController.getOrderById);

/**
 * Actualizar estado de una orden
 * @route PATCH /api/orders/:id/status
 */
router.patch('/:id/status', authMiddleware, validateUUID('id'), orderController.updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado de orden
 *     description: Actualiza el estado de una orden existente
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *                 description: Nuevo estado de la orden
 *                 example: "completed"
 *     responses:
 *       200:
 *         description: Estado de orden actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
 *                     message:
 *                       type: string
 *                       example: "Estado de orden actualizado exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Ruta para crear órdenes (pública: el checkout del cliente no requiere auth)
router.post('/', checkoutLimiter, optionalAuth, validateOrder, orderController.createOrderSimple);

/**
 * @swagger
 * /api/users/{userId}/orders:
 *   get:
 *     summary: Obtener órdenes de un usuario
 *     description: Retorna todas las órdenes de un usuario específico
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *         description: Filtrar por estado de la orden
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de órdenes a retornar
 *     responses:
 *       200:
 *         description: Órdenes del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Order'
 *                           - type: object
 *                             properties:
 *                               items:
 *                                 type: array
 *                                 items:
 *                                   allOf:
 *                                     - type: object
 *                                       properties:
 *                                         id:
 *                                           type: string
 *                                         quantity:
 *                                           type: integer
 *                                         price:
 *                                           type: number
 *                                     - type: object
 *                                       properties:
 *                                         product:
 *                                           $ref: '#/components/schemas/Product'
 *                     count:
 *                       type: integer
 *                       description: Número total de órdenes retornadas
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// QR Code para orden QR-Rechnung (público — el kiosko lo llama para mostrar el QR en pantalla)
router.get('/:id/qr-code', optionalAuth, validateUUID('id'), orderController.getQRCode);

// Confirmar pago de una orden QR-Rechnung pendiente (solo admin de la tienda)
router.patch('/:id/confirm-payment', authMiddleware, validateUUID('id'), orderController.confirmPayment);

module.exports = router;
