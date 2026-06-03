'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/StorefrontController');
const { checkoutLimiter, discountValidationLimiter } = require('../middleware/rateLimiter');

const router = Router();

// ─── Store info ───────────────────────────────────────────────────────────────
// All read-only store endpoints are public and unauthenticated.

/** GET /api/storefront/active-slugs — ISR / generateStaticParams */
router.get('/active-slugs', ctrl.getActiveSlugs.bind(ctrl));

/** GET /api/storefront/stores/:slug */
router.get('/stores/:slug', ctrl.getStore.bind(ctrl));

/** GET /api/storefront/stores/:slug/catalog */
router.get('/stores/:slug/catalog', ctrl.getCatalog.bind(ctrl));

/** GET /api/storefront/stores/:slug/categories */
router.get('/stores/:slug/categories', ctrl.getCategories.bind(ctrl));

/** GET /api/storefront/stores/:slug/payment-options */
router.get('/stores/:slug/payment-options', ctrl.getPaymentOptions.bind(ctrl));

// ─── Discount validation ──────────────────────────────────────────────────────
/** POST /api/storefront/stores/:slug/discounts/validate */
router.post('/stores/:slug/discounts/validate', discountValidationLimiter, ctrl.validateDiscount.bind(ctrl));

// ─── Quote (server-side cart repricing) ──────────────────────────────────────
/** POST /api/storefront/stores/:slug/quote */
router.post('/stores/:slug/quote', ctrl.quote.bind(ctrl));

// ─── Order creation ───────────────────────────────────────────────────────────
/** POST /api/storefront/stores/:slug/orders */
router.post('/stores/:slug/orders', checkoutLimiter, ctrl.createOrder.bind(ctrl));

// ─── Order lookup & actions by publicOrderToken ──────────────────────────────

/** GET /api/storefront/orders/:publicOrderToken */
router.get('/orders/:publicOrderToken', ctrl.getOrderByToken.bind(ctrl));

/** GET /api/storefront/orders/:publicOrderToken/payment-qr */
router.get('/orders/:publicOrderToken/payment-qr', ctrl.getOrderPaymentQR.bind(ctrl));

/** POST /api/storefront/orders/:publicOrderToken/payment-confirmations */
router.post('/orders/:publicOrderToken/payment-confirmations', checkoutLimiter, ctrl.confirmPayment.bind(ctrl));

/** POST /api/storefront/orders/:publicOrderToken/invoice */
router.post('/orders/:publicOrderToken/invoice', ctrl.createInvoice.bind(ctrl));

// ─── Invoice lookup by shareToken ─────────────────────────────────────────────

/** GET /api/storefront/invoices/:shareToken */
router.get('/invoices/:shareToken', ctrl.getInvoice.bind(ctrl));

/** GET /api/storefront/invoices/:shareToken/pdf */
router.get('/invoices/:shareToken/pdf', ctrl.getInvoicePdf.bind(ctrl));

module.exports = router;
