const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.register); // Register user
router.post('/login', userController.login); // Login user

router.post('/forgotPassword', userController.forgotPassword); // Forgot password
router.patch('/resetPassword/:token', userController.resetPassword); // Reset password

module.exports = router;
