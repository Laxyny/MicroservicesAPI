const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactorController');

// Routes 2FA
router.get('/2fa/setup', twoFactorController.setup);
router.post('/2fa/verify', twoFactorController.verify);
router.get('/2fa/status', twoFactorController.status);
router.post('/2fa/disable', twoFactorController.disable);

module.exports = router;