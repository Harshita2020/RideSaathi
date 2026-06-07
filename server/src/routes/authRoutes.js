const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe
} = require('../controllers/authController');

// Import authentication middleware
const protect = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected authentication routes
router.get('/me', protect, getMe);

module.exports = router;
