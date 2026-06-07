const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver ID is required']
    },
    source: {
      name: {
        type: String,
        required: [true, 'Source name is required'],
        trim: true
      },
      coordinates: {
        type: coordinateSchema,
        required: [true, 'Source coordinates are required']
      }
    },
    destination: {
      name: {
        type: String,
        required: [true, 'Destination name is required'],
        trim: true
      },
      coordinates: {
        type: coordinateSchema,
        required: [true, 'Destination coordinates are required']
      }
    },
    departureTime: {
      type: Date,
      required: [true, 'Departure time is required'],
      validate: {
        validator: function (value) {
          // Only validate future time on creation
          if (this.isNew) {
            return value > new Date();
          }
          return true;
        },
        message: 'Departure time must be in the future'
      }
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1']
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: [0, 'Available seats cannot be negative'],
      validate: {
        validator: function (value) {
          return value <= this.totalSeats;
        },
        message: 'Available seats cannot exceed total seats'
      }
    },
    status: {
      type: String,
      enum: {
        values: ['CREATED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
        message: 'Status must be CREATED, ACTIVE, COMPLETED, or CANCELLED'
      },
      default: 'CREATED',
      required: true
    },
    currentLocation: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for faster queries
rideSchema.index({ driverId: 1 });
rideSchema.index({ status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
