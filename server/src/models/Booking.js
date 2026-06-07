const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Ride ID is required']
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Passenger ID is required']
    },
    status: {
      type: String,
      enum: {
        values: ['BOOKED', 'CANCELLED'],
        message: 'Status must be BOOKED or CANCELLED'
      },
      default: 'BOOKED',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate bookings for the same passenger/ride pair
bookingSchema.index({ rideId: 1, passengerId: 1 }, { unique: true });
bookingSchema.index({ passengerId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
