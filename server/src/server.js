const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { initSocket } = require('./config/socket');

const path = require('path');

// Load environment variables from environment configuration using absolute path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to Database
connectDB();

const app = express();

// Create HTTP Server to attach socket.io
const server = http.createServer(app);

// Initialize Socket.IO with the server
initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());

// Routes Definitions
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);

// Base Health Check Route
app.get('/', (req, res) => {
  res.json({
    message: "RideSaathi API Running"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

