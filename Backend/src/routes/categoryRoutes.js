const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const { validateUUID } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Retorna todas las categorías de productos
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
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
 *                         $ref: '#/components/schemas/ProductCategory'
 *                     count:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, categoryController.getAllCategories);

/**
 * @swagger
 * /api/categories/stats:
 *   get:
 *     summary: Obtener estadísticas de categorías
 *     description: Retorna estadísticas de categorías
 *     tags: [Categories]
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
 *                         withProducts:
 *                           type: integer
 *                         withoutProducts:
 *                           type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', authMiddleware, categoryController.getStats);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     description: Retorna una categoría específica
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductCategory'
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, validateUUID('id'), categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear nueva categoría
 *     description: Crea una nueva categoría de productos
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *                 example: "Panadería"
 *               count:
 *                 type: integer
 *                 description: Número de productos en la categoría
 *                 default: 0
 *               color:
 *                 type: string
 *                 description: Color de la categoría
 *                 example: "#10b981"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductCategory'
 *                     message:
 *                       type: string
 *                       example: "Categoría creada exitosamente"
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     description: Actualiza una categoría existente
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre de la categoría
 *               count:
 *                 type: integer
 *                 description: Número de productos en la categoría
 *               color:
 *                 type: string
 *                 description: Color de la categoría
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductCategory'
 *                     message:
 *                       type: string
 *                       example: "Categoría actualizada exitosamente"
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, validateUUID('id'), categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     description: Elimina una categoría del sistema
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Categoría eliminada exitosamente"
 *       400:
 *         description: No se puede eliminar porque tiene productos asociados
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, validateUUID('id'), categoryController.deleteCategory);

/**
 * @swagger
 * /api/categories/update-counts:
 *   patch:
 *     summary: Actualizar contadores de categorías
 *     description: Actualiza los contadores de productos en cada categoría
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Contadores actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Contadores de categorías actualizados"
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/update-counts', authMiddleware, categoryController.updateCounts);

module.exports = router;
