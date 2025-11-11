const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/TelemetryController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/heartbeat', optionalAuth, telemetryController.registerHeartbeat);

module.exports = router;


