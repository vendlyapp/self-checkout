const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información general de la API
 *     description: Retorna información básica sobre la API de Vendly Checkout
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Información de la API obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vendly Checkout API"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: string
 *                       example: "/api/products"
 *                     users:
 *                       type: string
 *                       example: "/api/users"
 *                     orders:
 *                       type: string
 *                       example: "/api/orders"
 *                     health:
 *                       type: string
 *                       example: "/health"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', (req, res) => {
  res.json({
    message: 'Vendly Checkout API',
    version: '2.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
