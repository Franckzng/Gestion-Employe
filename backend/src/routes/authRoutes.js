// backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  login,
  register,
  getMe,
  changePassword
} = require('../controllers/authController');

// @route   POST /api/auth/login
router.post('/login', login);

// @route   POST /api/auth/register
router.post('/register', register);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, changePassword);

module.exports = router;