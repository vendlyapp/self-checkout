const rateLimit = require('express-rate-limit');

/**
 * Returns a plain JSON error response consistent with the rest of the API.
 */
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: 'Zu viele Anfragen. Bitte warte kurz und versuche es erneut.',
    retryAfter: Math.ceil(res.getHeader('Retry-After') || 60),
  });
};

// ─── Checkout / Order creation ────────────────────────────────────────────────
// The public checkout is the most sensitive endpoint: each request runs a DB
// transaction, decrements stock, creates an order record and (optionally) an
// invoice. 60 per 10 min per IP is generous for legitimate customers while
// blocking scripted abuse.
const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,   // 10 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ─── Discount code validation ─────────────────────────────────────────────────
// Prevents brute-forcing valid codes. 30 attempts per 15 min per IP covers
// normal usage (a customer trying a couple of codes) but stops enumeration.
const discountValidationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ─── General API limiter ──────────────────────────────────────────────────────
// Applied globally as a last-resort backstop: 500 req/min per IP.
// Authenticated dashboard usage rarely exceeds 50-60 req/min even on heavy
// pages; this only fires for true floods.
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = {
  checkoutLimiter,
  discountValidationLimiter,
  globalLimiter,
};
