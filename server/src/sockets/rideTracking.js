const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

/**
 * Registers WebSocket event handlers for ride tracking.
 * @param {object} io - Socket.IO Server instance
 * @param {object} socket - Client Socket instance
 */
module.exports = (io, socket) => {
  const userId = socket.user._id.toString();

  // 1. Join Ride Room (Client -> Server)
  socket.on('join-ride-room', async ({ rideId }) => {
    try {
      if (!rideId) {
        return socket.emit('ride-error', { message: 'Ride ID is required' });
      }

      // Fetch the ride
      const ride = await Ride.findById(rideId);
      if (!ride) {
        return socket.emit('ride-error', { message: 'Ride not found' });
      }

      // Check if driver
      const isDriver = ride.driverId.toString() === userId;
      let isAuthorized = isDriver;

      if (!isAuthorized) {
        // Check if passenger has a BOOKED booking for this ride
        const booking = await Booking.findOne({
          rideId,
          passengerId: userId,
          status: 'BOOKED'
        });
        if (booking) {
          isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        return socket.emit('ride-error', { message: 'Unauthorized to join this ride room' });
      }

      const roomName = `ride:${rideId}`;
      socket.join(roomName);
      console.log(`User ${socket.user.name} (${userId}) joined room: ${roomName}`);
    } catch (error) {
      console.error('Error joining ride room:', error);
      socket.emit('ride-error', { message: 'Server error while joining ride room' });
    }
  });

  // 2. Leave Ride Room (Client -> Server)
  socket.on('leave-ride-room', ({ rideId }) => {
    if (!rideId) {
      return socket.emit('ride-error', { message: 'Ride ID is required' });
    }
    const roomName = `ride:${rideId}`;
    socket.leave(roomName);
    console.log(`User ${socket.user.name} (${userId}) left room: ${roomName}`);
  });

  // 3. Start Ride (Client -> Server)
  socket.on('start-ride', async ({ rideId }) => {
    try {
      if (!rideId) {
        return socket.emit('ride-error', { message: 'Ride ID is required' });
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
        return socket.emit('ride-error', { message: 'Ride not found' });
      }

      // Authorization: Only the driver can start the ride
      if (ride.driverId.toString() !== userId) {
        return socket.emit('ride-error', { message: 'Only the driver can start the ride' });
      }

      // Business Rule: Can only start a CREATED ride
      if (ride.status !== 'CREATED') {
        return socket.emit('ride-error', { message: 'Ride can only be started from CREATED status' });
      }

      // Update Database
      ride.status = 'ACTIVE';
      await ride.save();

      const roomName = `ride:${rideId}`;
      // Broadcast Status Change (Server -> Client)
      io.to(roomName).emit('ride-status-changed', { rideId, status: 'ACTIVE' });
      console.log(`Ride ${rideId} status changed to ACTIVE by driver ${userId}`);
    } catch (error) {
      console.error('Error starting ride:', error);
      socket.emit('ride-error', { message: 'Server error while starting ride' });
    }
  });

  // 4. Update Location (Client -> Server)
  socket.on('update-location', async ({ rideId, latitude, longitude }) => {
    try {
      if (!rideId) {
        return socket.emit('ride-error', { message: 'Ride ID is required' });
      }
      if (latitude === undefined || longitude === undefined) {
        return socket.emit('ride-error', { message: 'Latitude and longitude are required' });
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
        return socket.emit('ride-error', { message: 'Ride not found' });
      }

      // Authorization: Only the driver can update location
      if (ride.driverId.toString() !== userId) {
        return socket.emit('ride-error', { message: 'Only the driver can update location' });
      }

      // Update Database
      ride.currentLocation = {
        latitude,
        longitude,
        updatedAt: new Date()
      };
      await ride.save();

      const roomName = `ride:${rideId}`;
      // Broadcast Location Update (Server -> Client)
      io.to(roomName).emit('location-updated', { rideId, latitude, longitude, updatedAt: new Date() });
      console.log(`Ride ${rideId} location updated to [${latitude}, ${longitude}]`);
    } catch (error) {
      console.error('Error updating location:', error);
      socket.emit('ride-error', { message: 'Server error while updating location' });
    }
  });

  // 5. Complete Ride (Client -> Server)
  socket.on('complete-ride', async ({ rideId }) => {
    try {
      if (!rideId) {
        return socket.emit('ride-error', { message: 'Ride ID is required' });
      }

      const ride = await Ride.findById(rideId);
      if (!ride) {
        return socket.emit('ride-error', { message: 'Ride not found' });
      }

      // Authorization: Only the driver can complete the ride
      if (ride.driverId.toString() !== userId) {
        return socket.emit('ride-error', { message: 'Only the driver can complete the ride' });
      }

      // Business Rule: Can only complete an ACTIVE ride
      if (ride.status !== 'ACTIVE') {
        return socket.emit('ride-error', { message: 'Ride can only be completed from ACTIVE status' });
      }

      // Update Database
      ride.status = 'COMPLETED';
      await ride.save();

      const roomName = `ride:${rideId}`;
      // Broadcast Status Change (Server -> Client)
      io.to(roomName).emit('ride-status-changed', { rideId, status: 'COMPLETED' });
      console.log(`Ride ${rideId} status changed to COMPLETED by driver ${userId}`);
    } catch (error) {
      console.error('Error completing ride:', error);
      socket.emit('ride-error', { message: 'Server error while completing ride' });
    }
  });

  // Handle Client Disconnect
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
};
