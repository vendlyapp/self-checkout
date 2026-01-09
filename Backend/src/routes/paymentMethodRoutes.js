const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/PaymentMethodController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateUUID } = require('../middleware/validation');

/**
 * @swagger
 * /api/payment-methods/store/{storeId}:
 *   get:
 *     summary: Obtener métodos de pago de un store
 *     description: Retorna todos los métodos de pago de un store específico
 *     tags: [Payment Methods]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del store
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Si es true, solo retorna métodos activos
 *     responses:
 *       200:
 *         description: Métodos de pago obtenidos exitosamente
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
 *                         $ref: '#/components/schemas/PaymentMethod'
 *                     count:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/store/:storeId', validateUUID('storeId'), paymentMethodController.getPaymentMethodsByStoreId);

/**
 * @swagger
 * /api/payment-methods/store/{storeId}:
 *   post:
 *     summary: Crear nuevo método de pago
 *     description: Crea un nuevo método de pago para un store
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del store
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - displayName
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del método de pago
 *                 example: "TWINT"
 *               displayName:
 *                 type: string
 *                 description: Nombre para mostrar
 *                 example: "TWINT"
 *               code:
 *                 type: string
 *                 description: Código único del método
 *                 example: "twint"
 *               icon:
 *                 type: string
 *                 description: Icono del método
 *                 example: "Smartphone"
 *               bgColor:
 *                 type: string
 *                 description: Color de fondo
 *                 example: "#25D076"
 *               textColor:
 *                 type: string
 *                 description: Color del texto
 *                 example: "#FFFFFF"
 *               isActive:
 *                 type: boolean
 *                 description: Si está activo
 *                 default: true
 *               sortOrder:
 *                 type: integer
 *                 description: Orden de clasificación
 *     responses:
 *       201:
 *         description: Método de pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentMethod'
 *                     message:
 *                       type: string
 *                       example: "Método de pago creado exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tienes permiso para crear métodos de pago en este store
 *       500:
 *         description: Error interno del servidor
 */
router.post('/store/:storeId', authMiddleware, validateUUID('storeId'), paymentMethodController.createPaymentMethod);

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   get:
 *     summary: Obtener método de pago por ID
 *     description: Retorna un método de pago específico
 *     tags: [Payment Methods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del método de pago
 *     responses:
 *       200:
 *         description: Método de pago encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentMethod'
 *       404:
 *         description: Método de pago no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', validateUUID('id'), paymentMethodController.getPaymentMethodById);

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   put:
 *     summary: Actualizar método de pago
 *     description: Actualiza un método de pago existente
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del método de pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               displayName:
 *                 type: string
 *               code:
 *                 type: string
 *               icon:
 *                 type: string
 *               bgColor:
 *                 type: string
 *               textColor:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Método de pago actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PaymentMethod'
 *                     message:
 *                       type: string
 *                       example: "Método de pago actualizado exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tienes permiso para actualizar métodos de pago de este store
 *       404:
 *         description: Método de pago no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, validateUUID('id'), paymentMethodController.updatePaymentMethod);

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   delete:
 *     summary: Eliminar método de pago
 *     description: Elimina un método de pago del sistema
 *     tags: [Payment Methods]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del método de pago
 *     responses:
 *       200:
 *         description: Método de pago eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Método de pago eliminado exitosamente"
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: No tienes permiso para eliminar métodos de pago de este store
 *       404:
 *         description: Método de pago no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, validateUUID('id'), paymentMethodController.deletePaymentMethod);

module.exports = router;
