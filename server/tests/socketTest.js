const mongoose = require('mongoose');
const http = require('http');
const express = require('express');
const { initSocket } = require('../src/config/socket');
// const { initSocket } = require('../../../../server/src/config/socket');
const User = require('../src/models/User');
const Ride = require('../src/models/Ride');
const Booking = require('../src/models/Booking');
const jwt = require('jsonwebtoken');
const { io: ClientIO } = require('socket.io-client');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const testPort = 5055;
const JWT_SECRET = process.env.JWT_SECRET || 'ridesaathi_secret';

async function runTest() {
  console.log("Connecting to Database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  // 1. Create clean test user data
  console.log("Creating test users...");
  const driverEmail = `test_driver_${Date.now()}@test.com`;
  const passengerEmail = `test_passenger_${Date.now()}@test.com`;
  const intruderEmail = `test_intruder_${Date.now()}@test.com`;

  const driver = await User.create({
    name: 'Test Driver',
    email: driverEmail,
    password: 'password123'
  });

  const passenger = await User.create({
    name: 'Test Passenger',
    email: passengerEmail,
    password: 'password123'
  });

  const intruder = await User.create({
    name: 'Test Intruder',
    email: intruderEmail,
    password: 'password123'
  });

  const driverToken = jwt.sign({ id: driver._id }, JWT_SECRET);
  const passengerToken = jwt.sign({ id: passenger._id }, JWT_SECRET);
  const intruderToken = jwt.sign({ id: intruder._id }, JWT_SECRET);

  console.log("Creating test ride...");
  const ride = await Ride.create({
    driverId: driver._id,
    source: { name: 'Source Point', coordinates: { latitude: 12.9716, longitude: 77.5946 } },
    destination: { name: 'Dest Point', coordinates: { latitude: 13.0827, longitude: 80.2707 } },
    departureTime: new Date(Date.now() + 3600000), // 1 hour from now
    totalSeats: 4,
    availableSeats: 3,
    status: 'CREATED'
  });

  console.log("Creating test booking for passenger...");
  const booking = await Booking.create({
    rideId: ride._id,
    passengerId: passenger._id,
    status: 'BOOKED'
  });

  // 2. Set up Socket.IO server
  console.log("Starting test server...");
  const app = express();
  const server = http.createServer(app);
  initSocket(server);
  
  await new Promise((resolve) => server.listen(testPort, resolve));
  console.log(`Server listening on port ${testPort}`);

  // Helpers to wait for event
  const waitForEvent = (client, event) => {
    return new Promise((resolve) => {
      client.once(event, (data) => {
        resolve(data);
      });
    });
  };

  // 3. Connect driver client
  console.log("Connecting driver socket...");
  const driverSocket = ClientIO(`http://localhost:${testPort}`, {
    auth: { token: driverToken }
  });

  await new Promise((resolve, reject) => {
    driverSocket.on('connect', resolve);
    driverSocket.on('connect_error', reject);
  });
  console.log("Driver socket connected.");

  // 4. Connect passenger client
  console.log("Connecting passenger socket...");
  const passengerSocket = ClientIO(`http://localhost:${testPort}`, {
    auth: { token: passengerToken }
  });

  await new Promise((resolve, reject) => {
    passengerSocket.on('connect', resolve);
    passengerSocket.on('connect_error', reject);
  });
  console.log("Passenger socket connected.");

  // 5. Connect intruder client
  console.log("Connecting intruder socket...");
  const intruderSocket = ClientIO(`http://localhost:${testPort}`, {
    auth: { token: intruderToken }
  });

  await new Promise((resolve, reject) => {
    intruderSocket.on('connect', resolve);
    intruderSocket.on('connect_error', reject);
  });
  console.log("Intruder socket connected.");

  // 6. Test join room authorization
  console.log("Testing join-ride-room authorization...");
  
  // Driver joins successfully
  driverSocket.emit('join-ride-room', { rideId: ride._id });
  // Passenger joins successfully
  passengerSocket.emit('join-ride-room', { rideId: ride._id });
  // Intruder tries to join and should fail
  intruderSocket.emit('join-ride-room', { rideId: ride._id });
  const intruderError = await waitForEvent(intruderSocket, 'ride-error');
  console.log("Intruder join result (expected error):", intruderError);

  // 7. Test start-ride
  console.log("Testing start-ride event...");
  // Passenger tries to start ride and should fail
  passengerSocket.emit('start-ride', { rideId: ride._id });
  const passengerError = await waitForEvent(passengerSocket, 'ride-error');
  console.log("Passenger start-ride result (expected error):", passengerError);

  // Driver starts ride successfully
  driverSocket.emit('start-ride', { rideId: ride._id });
  const statusChangePayload = await waitForEvent(passengerSocket, 'ride-status-changed');
  console.log("Passenger received status changed:", statusChangePayload);

  // Check DB state for start-ride
  const updatedRideAfterStart = await Ride.findById(ride._id);
  console.log("Ride status in DB (expected ACTIVE):", updatedRideAfterStart.status);

  // 8. Test update-location
  console.log("Testing update-location event...");
  driverSocket.emit('update-location', {
    rideId: ride._id,
    latitude: 12.9800,
    longitude: 77.6000
  });

  const locationPayload = await waitForEvent(passengerSocket, 'location-updated');
  console.log("Passenger received location update:", locationPayload);

  // Check DB state for location update
  const updatedRideAfterLoc = await Ride.findById(ride._id);
  console.log("Ride location in DB:", updatedRideAfterLoc.currentLocation);

  // 9. Test complete-ride
  console.log("Testing complete-ride event...");
  driverSocket.emit('complete-ride', { rideId: ride._id });
  const completedPayload = await waitForEvent(passengerSocket, 'ride-status-changed');
  console.log("Passenger received completed status change:", completedPayload);

  // Check DB state for complete-ride
  const updatedRideAfterComplete = await Ride.findById(ride._id);
  console.log("Ride status in DB (expected COMPLETED):", updatedRideAfterComplete.status);

  // 10. Clean up connections
  console.log("Cleaning up clients...");
  driverSocket.close();
  passengerSocket.close();
  intruderSocket.close();

  console.log("Stopping server...");
  server.close();

  console.log("Cleaning up test database documents...");
  await Booking.deleteOne({ _id: booking._id });
  await Ride.deleteOne({ _id: ride._id });
  await User.deleteMany({
    _id: { $in: [driver._id, passenger._id, intruder._id] }
  });
  
  await mongoose.disconnect();
  console.log("Tests finished successfully!");
}

runTest().catch(async (err) => {
  console.error("Test failed with error:", err);
  await mongoose.disconnect();
  process.exit(1);
});
