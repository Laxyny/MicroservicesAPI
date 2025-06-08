const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/orders', authMiddleware, orderController.getUserOrders);
router.get('/orders/:id', authMiddleware, orderController.getOrder);
router.post('/orders', authMiddleware, orderController.createOrder);
router.put('/orders/:id', authMiddleware, orderController.updateOrder);
router.delete('/orders/:id', authMiddleware, orderController.deleteOrder);

module.exports = router;