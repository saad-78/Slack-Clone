const express = require('express');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Simple request logger for this router
router.use((req, res, next) => {
  console.log(`[AUTH] ${req.method} ${req.originalUrl}`, {
    body: req.body,
    headers: {
      origin: req.headers.origin,
    },
  });
  next();
});

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('[AUTH] Signup payload:', { username, email });

    // Validation
    if (!username || !email || !password) {
      console.warn('[AUTH] Signup validation failed:', { username, email, hasPassword: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all fields' 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    
    if (userExists) {
      console.warn('[AUTH] Signup user exists:', { username, email });
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Create user
    const user = await User.create({ username, email, password });
    console.log('[AUTH] User created:', { id: user._id, username: user.username, email: user.email });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[AUTH] SIGNUP ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[AUTH] Login payload:', { email });

    // Validation
    if (!email || !password) {
      console.warn('[AUTH] Login validation failed:', { email, hasPassword: !!password });
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.warn('[AUTH] Login user not found:', { email });
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.warn('[AUTH] Login invalid password for:', { email });
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('[AUTH] Login success:', { id: user._id, email: user.email });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[AUTH] LOGIN ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  console.log('[AUTH] /me requested by:', { id: req.user._id, email: req.user.email });

  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = router;
