const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRideDetails,
  updateRide,
  deleteRide,
  getMyOfferedRides,
  startRide,
  completeRide
} = require('../controllers/rideController');

// Import authentication middleware
const protect = require('../middleware/authMiddleware');

// All ride routes require authentication
router.post('/', protect, createRide);
router.get('/', protect, getRides);
router.get('/my-offered', protect, getMyOfferedRides);
router.get('/:id', protect, getRideDetails);
router.put('/:id/start', protect, startRide);
router.put('/:id/complete', protect, completeRide);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, deleteRide);

module.exports = router;
