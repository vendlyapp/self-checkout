const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/TelemetryController');
const { optionalAuth, authMiddleware, requireRole } = require('../middleware/authMiddleware');
const { telemetryLimiter } = require('../middleware/rateLimiter');

router.post('/heartbeat', telemetryLimiter, optionalAuth, telemetryController.registerHeartbeat);
router.get('/active-stats', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), telemetryController.getStoreActiveStats);

module.exports = router;


