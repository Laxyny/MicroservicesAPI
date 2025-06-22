const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Routes Notifications
router.post('/', notificationController.sendNotification);
router.get('/:userId', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;