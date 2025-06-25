const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/cart', authMiddleware, cartController.getCart);
router.post('/cart/add', authMiddleware, cartController.addItem);
router.put('/cart/update', authMiddleware, cartController.updateItem);
router.delete('/cart/remove', authMiddleware, cartController.removeItem);
router.delete('/cart/empty', authMiddleware, cartController.emptyCart);

module.exports = router;