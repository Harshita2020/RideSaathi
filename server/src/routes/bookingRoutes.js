const express = require('express');
const router = express.Router();
const {
  createBooking,
  cancelBooking,
  getMyBookings,
  getMyRidesBookings
} = require('../controllers/bookingController');

// Import authentication middleware (to be implemented)
const protect = require('../middleware/authMiddleware');

// All booking routes require authentication
router.post('/', protect, createBooking);
router.delete('/:id', protect, cancelBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/my-rides', protect, getMyRidesBookings);

module.exports = router;
