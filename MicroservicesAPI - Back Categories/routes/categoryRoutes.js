const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const sellerMiddleware = require('../middlewares/sellerMiddleware');

//Routes Categories
router.get('/category', authMiddleware, sellerMiddleware);
router.get('/category/categories/:productId', categoryController.getProductCategories);
router.get('/category/listCategories', categoryController.getAllCategories);
router.get('/category/category/:id', categoryController.getCategory);
router.post('/category/createCategory', authMiddleware, categoryController.createCategory);
router.put('/category/updateCategory/:id', authMiddleware, sellerMiddleware, categoryController.updateCategory);
router.delete('/category/deleteCategory/:id', authMiddleware, sellerMiddleware, categoryController.deleteCategory);

module.exports = router;