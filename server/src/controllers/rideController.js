const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

/**
 * @desc    Create a new ride offer
 * @route   POST /api/rides
 * @access  Private
 */
const createRide = async (req, res) => {
  try {
    const { source, destination, departureTime, totalSeats } = req.body;

    if (!source || !source.name || !source.coordinates) {
      return res.status(400).json({ message: 'Source location with name and coordinates is required' });
    }
    if (!destination || !destination.name || !destination.coordinates) {
      return res.status(400).json({ message: 'Destination location with name and coordinates is required' });
    }
    if (!departureTime) {
      return res.status(400).json({ message: 'Departure time is required' });
    }
    if (!totalSeats || totalSeats < 1) {
      return res.status(400).json({ message: 'Total seats must be at least 1' });
    }

    const newRide = new Ride({
      driverId: req.user.id,
      source,
      destination,
      departureTime,
      totalSeats,
      availableSeats: totalSeats, // availableSeats initially equals totalSeats
      status: 'CREATED' // status defaults to CREATED
    });

    await newRide.save();

    return res.status(201).json({
      message: 'Ride offered successfully',
      ride: newRide
    });
  } catch (error) {
    console.error('Error in createRide:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get all rides with optional filtering
 * @route   GET /api/rides
 * @access  Private
 */
const getRides = async (req, res) => {
  try {
    const { source, destination, status } = req.query;
    const filterQuery = {};

    // Filter by source name (case-insensitive substring match)
    if (source) {
      filterQuery['source.name'] = { $regex: source, $options: 'i' };
    }

    // Filter by destination name (case-insensitive substring match)
    if (destination) {
      filterQuery['destination.name'] = { $regex: destination, $options: 'i' };
    }

    // Filter by status
    if (status) {
      filterQuery.status = status;
    }

    const rides = await Ride.find(filterQuery)
      .populate('driverId', 'name email')
      .sort({ departureTime: 1 });

    return res.status(200).json(rides);
  } catch (error) {
    console.error('Error in getRides:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get a single ride detail
 * @route   GET /api/rides/:id
 * @access  Private
 */
const getRideDetails = async (req, res) => {
  try {
    const rideId = req.params.id;

    // Populate driver information and exclude password
    const ride = await Ride.findById(rideId).populate('driverId', 'name email');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    return res.status(200).json(ride);
  } catch (error) {
    console.error('Error in getRideDetails:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Update a ride
 * @route   PUT /api/rides/:id
 * @access  Private
 */
const updateRide = async (req, res) => {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;
    const { source, destination, departureTime, totalSeats, status } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Business Rule: Only ride owner (driver) can update
    if (ride.driverId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this ride' });
    }

    // Can only edit ride specifications (locations, time, seats) if ride is still in CREATED status
    if (ride.status !== 'CREATED' && (source || destination || departureTime || totalSeats)) {
      return res.status(400).json({ message: 'Cannot edit ride parameters once the ride is ACTIVE, COMPLETED, or CANCELLED' });
    }

    // Update locations & details if provided
    if (source) ride.source = source;
    if (destination) ride.destination = destination;
    if (departureTime) ride.departureTime = departureTime;

    // Adjust seat capacity and validate
    if (totalSeats !== undefined) {
      const bookedSeats = ride.totalSeats - ride.availableSeats;
      if (totalSeats < bookedSeats) {
        return res.status(400).json({ message: `Cannot set total seats below current booked seats (${bookedSeats})` });
      }
      ride.totalSeats = totalSeats;
      ride.availableSeats = totalSeats - bookedSeats;
    }

    // Update status if provided
    if (status) {
      const allowedStatuses = ['CREATED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status transition' });
      }
      
      // If cancelling, also cancel associated bookings
      if (status === 'CANCELLED') {
        await Booking.updateMany({ rideId: ride._id }, { status: 'CANCELLED' });
        ride.availableSeats = ride.totalSeats; // Reset available seats
      }
      
      ride.status = status;
    }

    await ride.save();

    return res.status(200).json({
      message: 'Ride updated successfully',
      ride
    });
  } catch (error) {
    console.error('Error in updateRide:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Cancel/delete a ride (Sets status to CANCELLED and cancels bookings)
 * @route   DELETE /api/rides/:id
 * @access  Private
 */
const deleteRide = async (req, res) => {
  try {
    const rideId = req.params.id;
    const userId = req.user.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Business Rule: Only ride owner can cancel/delete
    if (ride.driverId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete/cancel this ride' });
    }

    if (ride.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Ride is already cancelled' });
    }
    if (ride.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Cannot cancel a completed ride' });
    }

    // Cancel the ride
    ride.status = 'CANCELLED';
    ride.availableSeats = ride.totalSeats; // Reset available seats
    await ride.save();

    // Cancel related bookings
    await Booking.updateMany({ rideId: ride._id }, { status: 'CANCELLED' });

    return res.status(200).json({
      message: 'Ride and associated bookings cancelled successfully',
      ride
    });
  } catch (error) {
    console.error('Error in deleteRide:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRide,
  getRides,
  getRideDetails,
  updateRide,
  deleteRide
};
