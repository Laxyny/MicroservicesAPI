const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');
const sellerMiddleware = require('../middlewares/sellerMiddleware');
const { upload } = require('../services/cloudinaryConfig');

//Routes Stores
router.get('/seller', authMiddleware, sellerMiddleware); // Ne sert a rien pour le moment
router.get('/seller/store', authMiddleware, storeController.getUserStore);
router.get('/seller/stores',authMiddleware, storeController.getUserStores);
router.get('/seller/liststores', authMiddleware, storeController.getAllStores);
router.get('/seller/store/:id', authMiddleware, storeController.getStore);
router.post('/seller/createStore', authMiddleware, sellerMiddleware, storeController.createStore);
router.put('/seller/updateStore/:id', authMiddleware, sellerMiddleware, storeController.updateStore);
router.delete('/seller/deleteStore/:id', authMiddleware, sellerMiddleware, storeController.deleteStore);

router.post('/seller/upload-logo', upload.single('file'), authMiddleware, sellerMiddleware, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier envoyé' });
    }
    res.json({ imageUrl: req.file.path });
});

module.exports = router;