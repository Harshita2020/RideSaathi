const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

/**
 * Initializes Socket.IO server and registers JWT authentication middleware.
 * @param {object} server - HTTP Server instance
 */
const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // Allows all origins for MVP ease of testing; adjust for production
      methods: ['GET', 'POST']
    }
  });

  // Authentication Middleware for WebSocket Connections
  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.auth.token || socket.handshake.headers.authorization;
      
      let token = authHeader;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ridesaathi_secret');
      
      // Fetch user from DB, excluding password
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach authenticated user to the socket object
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // Register Event Handlers on connection
  const registerRideHandlers = require('../sockets/rideTracking');
  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id} (User ID: ${socket.user._id})`);
    registerRideHandlers(io, socket);
  });

  return io;
};

/**
 * Returns the initialized Socket.IO server instance.
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
