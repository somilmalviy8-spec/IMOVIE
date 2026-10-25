const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
} = require('../middleware/validators');

// Public authentication routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected user profile routes
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.put('/profile', protect, validateProfileUpdate, updateProfile);

module.exports = router;
