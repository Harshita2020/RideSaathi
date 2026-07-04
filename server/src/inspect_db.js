  const path = require('path');
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../.env') });

  const mongoose = require('mongoose');
  const connectDB = require('./config/db');
  const Ride = require('./models/Ride');

  const inspect = async () => {
    try {
      // Connect to database
      await connectDB();

      // Query all rides
      const rides = await Ride.find({});
      console.log(`\n--- DATABASE INSPECTION RESULTS ---`);
      console.log(`Total Rides in Database: ${rides.length}`);
      
      if (rides.length > 0) {
        console.log(`\nExisting Rides List:`);
        rides.forEach((ride, i) => {
          console.log(`[${i + 1}] Source: "${ride.source.name}" ➜ Destination: "${ride.destination.name}" (Status: ${ride.status})`);
        });
      } else {
        console.log(`No rides currently exist in the database.`);
      }

      // Checking proposed seed routes against existing database records
      const proposedRoutes = [
        { source: 'Bathinda Bus Stand', destination: 'Chandigarh Sector 17 Bus Stand' },
        { source: 'Mohali Phase 7', destination: 'Punjab University Chandigarh' },
        { source: 'ISBT Sector 43 Chandigarh', destination: 'Infosys Campus Mohali' },
        { source: 'Amritsar Railway Station', destination: 'Jalandhar Bus Stand' },
        { source: 'Patiala Bus Stand', destination: 'Chitkara University Rajpura' }
      ];

      console.log(`\n--- PROPOSED SEED DUPLICATION CHECK ---`);
      proposedRoutes.forEach((route) => {
        const isDuplicate = rides.some(
          (r) => 
            r.source.name.toLowerCase() === route.source.toLowerCase() && 
            r.destination.name.toLowerCase() === route.destination.toLowerCase()
        );
        console.log(`Proposed Route: "${route.source}" ➜ "${route.destination}" | Status: ${isDuplicate ? '❌ WILL BE SKIPPED (Duplicate Found)' : '✅ WILL BE SEEDED (Unique)'}`);
      });

      console.log(`------------------------------------\n`);
      mongoose.connection.close();
    } catch (error) {
      console.error('Inspection error:', error);
      process.exit(1);
    }
  };

  inspect();
