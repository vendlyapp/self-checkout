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

