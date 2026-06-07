const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

/**
 * @desc    Create a new booking (Join a ride)
 * @route   POST /api/bookings
 * @access  Private
 */
const createBooking = async (req, res) => {
  try {
    const { rideId } = req.body;
    const passengerId = req.user.id; // Populated by authMiddleware

    if (!rideId) {
      return res.status(400).json({ message: 'Ride ID is required' });
    }

    // 1. Find the ride
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // 2. Validate ride status
    if (ride.status !== 'CREATED') {
      return res.status(400).json({ message: 'Cannot join a ride that is already active, completed, or cancelled' });
    }

    // 3. Business Rule: Passenger cannot join own ride
    if (ride.driverId.toString() === passengerId) {
      return res.status(400).json({ message: 'You cannot join your own offered ride' });
    }

    // 4. Business Rule: Prevent duplicate bookings
    let existingBooking = await Booking.findOne({ rideId, passengerId });

    if (existingBooking) {
      if (existingBooking.status === 'BOOKED') {
        return res.status(400).json({ message: 'You have already booked this ride' });
      }

      // If the passenger previously cancelled, they can re-book if seats are available
      if (existingBooking.status === 'CANCELLED') {
        // 5. Business Rule: Prevent overbooking
        if (ride.availableSeats <= 0) {
          return res.status(400).json({ message: 'No seats available on this ride' });
        }

        // Reactivate the booking
        existingBooking.status = 'BOOKED';
        await existingBooking.save();

        // 6. Business Rule: Reduce availableSeats
        ride.availableSeats -= 1;
        await ride.save();

        const populatedBooking = await existingBooking.populate([
          { path: 'rideId' },
          { path: 'passengerId', select: '-password' }
        ]);

        return res.status(200).json({
          message: 'Booking reactivated successfully',
          booking: populatedBooking
        });
      }
    }

    // 7. No existing booking: Check available seats and create new
    if (ride.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available on this ride' });
    }

    // Create booking
    const newBooking = new Booking({
      rideId,
      passengerId,
      status: 'BOOKED'
    });

    await newBooking.save();

    // Reduce available seats
    ride.availableSeats -= 1;
    await ride.save();

    const populatedBooking = await newBooking.populate([
      { path: 'rideId' },
      { path: 'passengerId', select: '-password' }
    ]);

    return res.status(201).json({
      message: 'Ride booked successfully',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Cancel an existing booking
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    // 1. Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // 2. Validate that the current user owns this booking
    if (booking.passengerId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
    }

    // 3. Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // 4. Update booking status
    booking.status = 'CANCELLED';
    await booking.save();

    // 5. Business Rule: Increase availableSeats when booking is cancelled
    const ride = await Ride.findById(booking.rideId);
    if (ride) {
      ride.availableSeats = Math.min(ride.totalSeats, ride.availableSeats + 1);
      await ride.save();
    }

    return res.status(200).json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get bookings made by the current user (Passenger view)
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
const getMyBookings = async (req, res) => {
  try {
    const passengerId = req.user.id;

    const bookings = await Booking.find({ passengerId })
      .populate({
        path: 'rideId',
        populate: {
          path: 'driverId',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get bookings for rides offered by the current user (Driver view)
 * @route   GET /api/bookings/my-rides
 * @access  Private
 */
const getMyRidesBookings = async (req, res) => {
  try {
    const driverId = req.user.id;

    // First find all rides offered by this driver
    const driverRides = await Ride.find({ driverId }).select('_id');
    const rideIds = driverRides.map(ride => ride._id);

    // Find bookings related to those rides
    const bookings = await Booking.find({ rideId: { $in: rideIds } })
      .populate('rideId')
      .populate('passengerId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error in getMyRidesBookings:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  cancelBooking,
  getMyBookings,
  getMyRidesBookings
};
