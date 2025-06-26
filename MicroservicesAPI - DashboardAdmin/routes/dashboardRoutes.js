const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.use(adminMiddleware);

//Route admin catégories
router.get('/dashboard/categories', dashboardController.getAllCategories);
router.get('/dashboard/category/:id', dashboardController.getCategory);
router.get('/dashboard/product/categories/:productId', dashboardController.getProductCategories);
router.put('/dashboard/category/:id', dashboardController.updateCategory);
router.delete('/dashboard/category/:id', dashboardController.deleteCategory);

//Route admin produits
router.get('/dashboard/products', dashboardController.getAllProducts);
router.get('/dashboard/product/:id', dashboardController.getProduct);
router.get('/dashboard/store/:storeId/products', dashboardController.getStoreProducts);
router.delete('/dashboard/product/:id', dashboardController.deleteProduct);
router.put('/dashboard/product/:id', dashboardController.updateProduct);

//Route admin boutiques/vendeurs
router.get('/dashboard/stores', dashboardController.getAllStores);
router.get('/dashboard/store/:id', dashboardController.getStore);
router.put('/dashboard/store/:id', dashboardController.updateStore);
router.delete('/dashboard/store/:id', dashboardController.deleteStore);

module.exports = router;