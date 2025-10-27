const express = require('express');
const router = express.Router();
const storeController = require('../controllers/StoreController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/store/my-store:
 *   get:
 *     summary: Obtener tienda del usuario autenticado
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-store', authMiddleware, storeController.getMyStore);

/**
 * @swagger
 * /api/store/my-store:
 *   put:
 *     summary: Actualizar tienda del usuario autenticado
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 */
router.put('/my-store', authMiddleware, storeController.updateMyStore);

/**
 * @swagger
 * /api/store/my-store/status:
 *   patch:
 *     summary: Actualizar estado de apertura de la tienda
 *     description: Permite abrir o cerrar la tienda para recibir pedidos
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isOpen
 *             properties:
 *               isOpen:
 *                 type: boolean
 *                 description: Estado de apertura de la tienda
 *                 example: true
 *     responses:
 *       200:
 *         description: Estado de la tienda actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Store'
 *                     message:
 *                       type: string
 *                       example: "Tienda abierta"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Usuario no autenticado
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
router.patch('/my-store/status', authMiddleware, storeController.updateStoreStatus);

/**
 * @swagger
 * /api/store/{slug}:
 *   get:
 *     summary: Obtener tienda por slug (pública)
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:slug', storeController.getStoreBySlug);

/**
 * @swagger
 * /api/store/{slug}/products:
 *   get:
 *     summary: Obtener productos de una tienda (pública)
 *     tags: [Store]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:slug/products', storeController.getStoreProducts);

module.exports = router;

