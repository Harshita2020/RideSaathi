const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes by validating JWT from the Authorization header.
 * Attaches the authenticated user to the request object (excluding the password).
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Decode/Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ridesaathi_jwt_secret');

      // Fetch user profile and attach to the request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user profile not found' });
      }

      next();
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = protect;
