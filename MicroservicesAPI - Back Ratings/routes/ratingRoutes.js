const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes pour les notes
router.post('/rating/create', authMiddleware, ratingController.createRating);
router.get('/rating/product/:productId', ratingController.getProductRatings);
router.get('/rating/average/:productId', ratingController.getAverageRating);
router.get('/rating/user/:productId', authMiddleware, ratingController.getUserRating);
router.delete('/rating/:id', authMiddleware, ratingController.deleteRating);

module.exports = router;