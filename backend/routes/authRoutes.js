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
const requireDbConnection = require('../middleware/dbCheck');

// Public authentication routes (guarded with DB connection check)
router.post('/register', requireDbConnection, validateRegister, register);
router.post('/login', requireDbConnection, validateLogin, login);
router.post('/logout', logout);

// Protected user profile routes
router.get('/me', requireDbConnection, protect, getMe);
router.get('/profile', requireDbConnection, protect, getMe);
router.put('/profile', requireDbConnection, protect, validateProfileUpdate, updateProfile);

module.exports = router;

