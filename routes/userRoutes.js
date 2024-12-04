const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');
const sellerMiddleware = require('../middlewares/sellerMiddleware');

// Routes Users
router.get('/users', userController.getAllUsers);
router.get('/user', authMiddleware, userController.getUserFromToken);
router.get('/user/:id', userController.getUser);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logout);

router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);

//Routes Stores
router.get('/seller', authMiddleware, sellerMiddleware); // Ne sert a rien pour le moment
router.get('/seller/stores', authMiddleware, sellerMiddleware, storeController.getAllStores);
router.get('/seller/store/:id', authMiddleware, sellerMiddleware, storeController.getStore);
router.post('/seller/createStore', authMiddleware, sellerMiddleware, storeController.createStore);
router.put('/seller/updateStore/:id', authMiddleware, sellerMiddleware, storeController.updateStore);
router.delete('/seller/deleteStore/:id', authMiddleware, sellerMiddleware, storeController.deleteStore);

module.exports = router;
