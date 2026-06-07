const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Helper function to generate a JWT token containing user ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ridesaathi_jwt_secret', {
    expiresIn: '30d' // Token valid for 30 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate request inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields (name, email, password)' });
    }

    // Validate email uniqueness beforehand
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user (password will be auto-hashed via Mongoose pre-save hook)
    const user = await User.create({
      name,
      email,
      password
    });

    if (user) {
      return res.status(201).json({
        message: 'User registered successfully',
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Authenticate user & retrieve token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    // Verify user email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords (using instance method in User model)
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // req.user has already been set by the authMiddleware
    return res.status(200).json({
      user: req.user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
