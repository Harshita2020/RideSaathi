const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Ride = require('./models/Ride');

const run = async () => {
  try {
    // Connect to database
    await connectDB();

    // Fetch users
    const users = await User.find({});
    console.log(`Found ${users.length} users in the database.`);
    
    if (users.length === 0) {
      console.log('Error: No users found in the database. Please register a user first through the web app.');
      mongoose.connection.close();
      return;
    }

    const driver = users[0];
    console.log(`Using driver account: ${driver.name} (${driver.email}) [ID: ${driver._id}]`);

    // Fetch existing rides
    const rides = await Ride.find({});
    console.log(`Found ${rides.length} rides in the database.`);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mockRides = [
      {
        driverId: driver._id,
        source: {
          name: 'Bathinda Bus Stand',
          coordinates: { latitude: 30.2110, longitude: 74.9455 }
        },
        destination: {
          name: 'Chandigarh Sector 17 Bus Stand',
          coordinates: { latitude: 30.7410, longitude: 76.7801 }
        },
        departureTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000), // tomorrow + 2 hrs
        totalSeats: 5,
        availableSeats: 4,
        status: 'CREATED'
      },
      {
        driverId: driver._id,
        source: {
          name: 'Mohali Phase 7',
          coordinates: { latitude: 30.7042, longitude: 76.7262 }
        },
        destination: {
          name: 'Punjab University Chandigarh',
          coordinates: { latitude: 30.7602, longitude: 76.7667 }
        },
        departureTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // tomorrow + 4 hrs
        totalSeats: 4,
        availableSeats: 2,
        status: 'CREATED'
      },
      {
        driverId: driver._id,
        source: {
          name: 'ISBT Sector 43 Chandigarh',
          coordinates: { latitude: 30.7125, longitude: 76.7415 }
        },
        destination: {
          name: 'Infosys Campus Mohali',
          coordinates: { latitude: 30.6789, longitude: 76.7228 }
        },
        departureTime: new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000), // tomorrow + 6 hrs
        totalSeats: 4,
        availableSeats: 3,
        status: 'CREATED'
      },
      {
        driverId: driver._id,
        source: {
          name: 'Amritsar Railway Station',
          coordinates: { latitude: 31.6340, longitude: 74.8723 }
        },
        destination: {
          name: 'Jalandhar Bus Stand',
          coordinates: { latitude: 31.3196, longitude: 75.5869 }
        },
        departureTime: new Date(tomorrow.getTime() + 8 * 60 * 60 * 1000), // tomorrow + 8 hrs
        totalSeats: 4,
        availableSeats: 1,
        status: 'CREATED'
      },
      {
        driverId: driver._id,
        source: {
          name: 'Patiala Bus Stand',
          coordinates: { latitude: 30.3398, longitude: 76.3869 }
        },
        destination: {
          name: 'Chitkara University Rajpura',
          coordinates: { latitude: 30.5161, longitude: 76.6596 }
        },
        departureTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000), // tomorrow + 10 hrs
        totalSeats: 3,
        availableSeats: 2,
        status: 'CREATED'
      }
    ];

    let seededCount = 0;
    for (const mockRide of mockRides) {
      // Check if ride already exists with same source and destination to prevent duplicates
      const exists = await Ride.findOne({
        'source.name': mockRide.source.name,
        'destination.name': mockRide.destination.name,
        driverId: mockRide.driverId
      });

      if (!exists) {
        const newRide = new Ride(mockRide);
        await newRide.save();
        seededCount++;
        console.log(`Seeded ride: ${mockRide.source.name} ➜ ${mockRide.destination.name}`);
      } else {
        console.log(`Ride already exists (skipped): ${mockRide.source.name} ➜ ${mockRide.destination.name}`);
      }
    }

    console.log(`Database seeding completed. Seeded ${seededCount} new rides.`);
    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error in seed script:', error);
    process.exit(1);
  }
};

run();
