const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRideDetails,
  updateRide,
  deleteRide
} = require('../controllers/rideController');

// Import authentication middleware
const protect = require('../middleware/authMiddleware');

// All ride routes require authentication
router.post('/', protect, createRide);
router.get('/', protect, getRides);
router.get('/:id', protect, getRideDetails);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, deleteRide);

module.exports = router;
