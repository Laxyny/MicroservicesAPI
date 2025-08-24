const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Routes Notifications
//router.post('/notifications/', notificationController.sendNotification);
router.post('/notifications/notify', notificationController.sendNotification);
router.get('/notifications/:userId', notificationController.getUserNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

module.exports = router;