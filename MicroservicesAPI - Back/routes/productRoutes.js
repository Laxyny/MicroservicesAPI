const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const sellerMiddleware = require('../middlewares/sellerMiddleware');
const { upload } = require('../services/cloudinaryConfig');

//Routes Products
router.get('/product', authMiddleware, sellerMiddleware);
router.get('/product/product', authMiddleware, productController.getUserProduct);
router.get('/product/products', authMiddleware, productController.getUserProducts);
router.get('/product/listProducts', authMiddleware, productController.getAllProducts);
router.get('/product/product/:id', authMiddleware, productController.getProduct);
router.post('/product/createProduct', authMiddleware, sellerMiddleware, productController.createProduct);
router.put('/product/updateProduct/:id', authMiddleware, sellerMiddleware, productController.updateProduct);
router.delete('/product/deleteProduct/:id', authMiddleware, sellerMiddleware, productController.deleteProduct);

router.post('/product/upload-logo', upload.single('file'), authMiddleware, sellerMiddleware, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }
    res.json({ imageUrl: req.file.path });
});

module.exports = router;