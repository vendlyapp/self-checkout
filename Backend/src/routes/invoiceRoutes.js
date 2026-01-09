const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/InvoiceController');
const { validateUUID } = require('../middleware/validation');

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Crear una nueva factura
 *     description: Crea una factura a partir de una orden existente
 *     tags: [Invoices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la orden
 *               customerName:
 *                 type: string
 *                 description: Nombre del cliente
 *               customerEmail:
 *                 type: string
 *                 description: Email del cliente
 *               customerAddress:
 *                 type: string
 *                 description: Dirección del cliente
 *               customerCity:
 *                 type: string
 *                 description: Ciudad del cliente
 *               customerPostalCode:
 *                 type: string
 *                 description: Código postal del cliente
 *               customerPhone:
 *                 type: string
 *                 description: Teléfono del cliente
 *               saveCustomerData:
 *                 type: boolean
 *                 description: Si se debe guardar la información del cliente
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices/number/{invoiceNumber}:
 *   get:
 *     summary: Obtener factura por número
 *     description: Obtiene una factura usando su número único
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: invoiceNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: Factura no encontrada
 */
router.get('/number/:invoiceNumber', invoiceController.getInvoiceByNumber);

/**
 * @swagger
 * /api/invoices/order/{orderId}:
 *   get:
 *     summary: Obtener facturas por orden
 *     description: Obtiene todas las facturas asociadas a una orden
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Lista de facturas
 */
router.get('/order/:orderId', validateUUID('orderId'), invoiceController.getInvoicesByOrderId);

/**
 * @swagger
 * /api/invoices/customer/{email}:
 *   get:
 *     summary: Obtener facturas por email del cliente
 *     description: Obtiene todas las facturas de un cliente por su email
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del cliente
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset de resultados
 *     responses:
 *       200:
 *         description: Lista de facturas
 */
router.get('/customer/:email', invoiceController.getInvoicesByCustomerEmail);

/**
 * @swagger
 * /api/invoices/store/{storeId}:
 *   get:
 *     summary: Obtener facturas por tienda
 *     description: Obtiene todas las facturas de una tienda específica
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tienda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Límite de resultados
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Offset de resultados
 *     responses:
 *       200:
 *         description: Lista de facturas
 */
/**
 * @swagger
 * /api/invoices/public/{shareToken}:
 *   get:
 *     summary: Obtener factura por token de compartir (público)
 *     description: Obtiene una factura usando su token de compartir. Esta ruta es pública y no requiere autenticación.
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de compartir de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: Factura no encontrada
 */
router.get('/public/:shareToken', invoiceController.getInvoiceByShareToken);

router.get('/store/:storeId', validateUUID('storeId'), invoiceController.getInvoicesByStoreId);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Obtener factura por ID
 *     description: Obtiene una factura por su ID único
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura encontrada
 *       404:
 *         description: Factura no encontrada
 *   patch:
 *     summary: Actualizar factura
 *     description: Actualiza los datos de una factura existente
 *     tags: [Invoices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *               customerEmail:
 *                 type: string
 *               customerAddress:
 *                 type: string
 *               customerCity:
 *                 type: string
 *               customerPostalCode:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Factura actualizada
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:id', validateUUID('id'), invoiceController.getInvoiceById);
router.patch('/:id', validateUUID('id'), invoiceController.updateInvoice);

module.exports = router;

