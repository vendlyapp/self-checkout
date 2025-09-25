const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { validateUUID, validateOrder } = require('../middleware/validation');

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
router.get('/stats', orderController.getOrderStats);

// Ruta para admin - todas las órdenes
router.get('/', orderController.getAllOrders);

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
router.get('/recent', orderController.getRecentOrders);

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
router.get('/:id', validateUUID('id'), orderController.getOrderById);

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
// Ruta simplificada para crear órdenes
router.post('/', validateOrder, orderController.createOrderSimple);

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
router.get('/users/:userId/orders', validateUUID('userId'), orderController.getOrdersByUserId);

/**
 * @swagger
 * /api/users/{userId}/orders:
 *   post:
 *     summary: Crear nueva orden
 *     description: Crea una nueva orden para un usuario con los productos especificados
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 description: Lista de productos en la orden
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                       description: ID del producto
 *                       example: "ff0fb280-ed4b-4fa1-8da5-7a8320aa7f11"
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Cantidad del producto
 *                       example: 2
 *                 example:
 *                   - productId: "ff0fb280-ed4b-4fa1-8da5-7a8320aa7f11"
 *                     quantity: 2
 *                   - productId: "another-product-id"
 *                     quantity: 1
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
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
 *                     message:
 *                       type: string
 *                       example: "Orden creada exitosamente"
 *       400:
 *         description: Datos de entrada inválidos o producto no encontrado
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
// Ruta para obtener órdenes de un usuario específico
router.get('/user/:userId', validateUUID('userId'), orderController.getOrdersByUserId);

module.exports = router;
