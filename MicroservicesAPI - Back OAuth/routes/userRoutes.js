const express = require('express');
const router = express.Router();
const passport = require('../services/passportConfig');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes Users
router.get('/users', userController.getAllUsers);
router.get('/user', authMiddleware, userController.getUserFromToken);
router.get('/user/:id', userController.getUser);
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logout);

router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);

//Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.loginWithGoogle);

module.exports = router;