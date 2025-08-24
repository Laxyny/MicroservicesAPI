const express = require('express');
const router = express.Router();
const controller = require('../controllers/wishlistController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, controller.getWishlist);
router.post('/', authenticate, controller.addToWishlist);
router.delete('/', authenticate, controller.removeFromWishlist);

module.exports = router;
