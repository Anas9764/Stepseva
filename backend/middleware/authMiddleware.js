const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Log for debugging (remove in production or use logger)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Protect middleware - Route:', req.path);
      console.log('🔐 Authorization header present:', !!req.headers.authorization);
      console.log('🔐 Token extracted:', token ? 'Yes' : 'No');
    }

    if (!token) {
      console.warn('⚠️ No token provided for route:', req.path);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please provide a valid token.',
      });
    }

    try {
      // Verify token
      if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET is not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.warn('⚠️ User not found for token:', decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ User authenticated:', req.user.email, 'Role:', req.user.role);
      }

      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('❌ Error in protect middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role === 'admin') {
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ Admin access granted for:', req.user.email);
    }
    next();
  } else {
    console.warn('⚠️ Non-admin user attempted admin access:', req.user.email, 'Role:', req.user.role);
    res.status(403).json({
      success: false,
      message: 'Not authorized as an admin. Admin privileges required.',
    });
  }
};

