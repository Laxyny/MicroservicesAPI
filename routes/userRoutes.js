const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/users', userController.getAllUsers);
router.get('/user/:id', userController.getUser);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);

router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router;
