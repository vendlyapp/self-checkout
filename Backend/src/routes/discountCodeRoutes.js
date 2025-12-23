const express = require('express');
const router = express.Router();
const discountCodeController = require('../controllers/DiscountCodeController');
const { validateUUID } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @swagger
 * /api/discount-codes:
 *   get:
 *     summary: Obtener todos los códigos de descuento
 *     description: Retorna todos los códigos de descuento del usuario autenticado
 *     tags: [DiscountCodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Códigos obtenidos exitosamente
 *       401:
 *         description: No autenticado
 */
router.get('/', discountCodeController.getAllDiscountCodes);

/**
 * @swagger
 * /api/discount-codes/stats:
 *   get:
 *     summary: Obtener estadísticas de códigos de descuento
 *     description: Retorna estadísticas (total, activos, inactivos)
 *     tags: [DiscountCodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 */
router.get('/stats', discountCodeController.getStats);

/**
 * @swagger
 * /api/discount-codes/archived:
 *   get:
 *     summary: Obtener todos los códigos archivados
 *     description: Retorna todos los códigos de descuento archivados del usuario autenticado
 *     tags: [DiscountCodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Códigos archivados obtenidos exitosamente
 *       401:
 *         description: No autenticado
 */
router.get('/archived', discountCodeController.getArchivedDiscountCodes);

/**
 * @swagger
 * /api/discount-codes/validate/{code}:
 *   get:
 *     summary: Validar un código de descuento
 *     description: Valida si un código de descuento es válido y está activo
 *     tags: [DiscountCodes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de descuento a validar
 *     responses:
 *       200:
 *         description: Código válido
 *       400:
 *         description: Código inválido o expirado
 */
router.get('/validate/:code', discountCodeController.validateDiscountCode);

/**
 * @swagger
 * /api/discount-codes/{id}:
 *   get:
 *     summary: Obtener código de descuento por ID
 *     description: Retorna un código de descuento específico
 *     tags: [DiscountCodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Código encontrado
 *       404:
 *         description: Código no encontrado
 */
router.get('/:id', validateUUID('id'), discountCodeController.getDiscountCodeById);

/**
 * @swagger
 * /api/discount-codes:
 *   post:
 *     summary: Crear nuevo código de descuento
 *     description: Crea un nuevo código de descuento
 *     tags: [DiscountCodes]
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
 *               - discountType
 *               - discountValue
 *               - maxRedemptions
 *               - validFrom
 *             properties:
 *               code:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               maxRedemptions:
 *                 type: integer
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Código creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', discountCodeController.createDiscountCode);

/**
 * @swagger
 * /api/discount-codes/{id}:
 *   put:
 *     summary: Actualizar código de descuento
 *     description: Actualiza un código de descuento existente
 *     tags: [DiscountCodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discountType:
 *                 type: string
 *               discountValue:
 *                 type: number
 *               maxRedemptions:
 *                 type: integer
 *               validFrom:
 *                 type: string
 *               validUntil:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Código actualizado exitosamente
 *       404:
 *         description: Código no encontrado
 */
router.put('/:id', validateUUID('id'), discountCodeController.updateDiscountCode);

/**
 * @swagger
 * /api/discount-codes/{id}:
 *   delete:
 *     summary: Eliminar código de descuento
 *     description: Elimina un código de descuento
 *     tags: [DiscountCodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Código eliminado exitosamente
 *       404:
 *         description: Código no encontrado
 */
router.delete('/:id', validateUUID('id'), discountCodeController.deleteDiscountCode);

module.exports = router;

