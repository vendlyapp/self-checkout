require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const indexRoutes = require("./routes/index");
const authRoutes = require("./src/routes/authRoutes");
const usersRoutes = require("./src/routes/userRoutes");
const productsRoutes = require("./src/routes/productRoutes");
const categoriesRoutes = require("./src/routes/categoryRoutes");
const ordersRoutes = require("./src/routes/orderRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");
const telemetryRoutes = require("./src/routes/telemetryRoutes");
const discountCodeRoutes = require("./src/routes/discountCodeRoutes");
const paymentMethodRoutes = require("./src/routes/paymentMethodRoutes");
const customerRoutes = require("./src/routes/customerRoutes");

const app = express();

app.use(morgan("combined"));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Vendly Checkout API Documentation'
}));

app.use("/", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/discount-codes", discountCodeRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api", customerRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del sistema
 *     description: Verifica el estado de salud del servidor y sus servicios
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Tiempo de actividad del servidor en segundos
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use(errorHandler);
app.use("*", notFoundHandler);

module.exports = app;
