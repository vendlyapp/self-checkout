require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { globalLimiter } = require('./src/middleware/rateLimiter');

const indexRoutes = require("./routes/index");
const authRoutes = require("./src/routes/authRoutes");
const usersRoutes = require("./src/routes/userRoutes");
const productsRoutes = require("./src/routes/productRoutes");
const categoriesRoutes = require("./src/routes/categoryRoutes");
const ordersRoutes = require("./src/routes/orderRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const superAdminRoutes = require("./src/routes/superAdminRoutes");
const discountCodeRoutes = require("./src/routes/discountCodeRoutes");
const paymentMethodRoutes = require("./src/routes/paymentMethodRoutes");
const customerRoutes = require("./src/routes/customerRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");

const app = express();

// Trust the first hop reverse proxy (Fly.io, Render, Vercel) so rate limiters
// and Morgan use the real client IP from X-Forwarded-For, not the proxy IP.
app.set('trust proxy', 1);

// Security headers — sets X-Content-Type-Options, X-Frame-Options, HSTS,
// Content-Security-Policy, removes X-Powered-By, and more.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // CSP managed at the frontend (Next.js) layer
  permissionsPolicy: {
    features: {
      geolocation: [],
      camera: [],
      microphone: [],
      payment: [],
    },
  },
}));

// Compress all responses — reduces payload size by 60-80% for JSON responses
app.use(compression({ level: 6, threshold: 1024 }));

// Global backstop rate limiter — 500 req/min per IP
app.use(globalLimiter);

app.use(morgan("combined"));

// CORS — fail-fast in production if CORS_ORIGIN is not explicitly configured.
// Supports comma-separated list for multiple allowed origins.
const rawCorsOrigin = process.env.CORS_ORIGIN;
if (!rawCorsOrigin && process.env.NODE_ENV === 'production') {
  throw new Error('CORS_ORIGIN env variable must be set in production');
}
const allowedOrigins = rawCorsOrigin
  ? rawCorsOrigin.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl in dev)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Swagger docs disabled in production — exposes full API surface to attackers.
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Vendly Checkout API Documentation',
  }));
}

app.use("/", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/discount-codes", discountCodeRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", customerRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     description: Verifies the health status of the server and its services
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System running correctly
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
 *                   description: Server uptime in seconds
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);
app.use("*", notFoundHandler);

module.exports = app;
