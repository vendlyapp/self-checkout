const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateUUID } = require('../middleware/validation');

router.get('/', authMiddleware, notificationController.list);
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);
router.patch('/:id/read', authMiddleware, validateUUID('id'), notificationController.markAsRead);

module.exports = router;
