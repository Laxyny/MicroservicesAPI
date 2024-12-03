const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes Users
router.get('/users', userController.getAllUsers);
router.get('/user/:id', userController.getUser);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);

router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);

// Routes Stores
router.get('/stores', storeController.getAllStores);
router.get('/store/:id', storeController.getStore);
router.post('/createStore', authMiddleware("seller"), storeController.createStore); // Seuls les sellers peuvent créer un magasin

router.put('/updateStore/:id', storeController.updateStore);
router.delete('/deleteStore/:id', storeController.deleteStore);

module.exports = router;
