const Settings = require('../models/Settings');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Reads Settings once per request (cheap single doc) and enforces
// Settings.b2b.requireLoginForInquiry for unauthenticated users.
// Also verifies token if present (since protect middleware is not used on this route)
exports.requireAuthIfB2BInquiryLocked = async (req, res, next) => {
  try {
    const settings = await Settings.findOne().select('b2b.requireLoginForInquiry').lean();
    const requireLogin = Boolean(settings?.b2b?.requireLoginForInquiry);

    // Always try to set req.user if token is present (for optional user tracking)
    await setUserIfTokenPresent(req);

    // If login is not required, allow the request to proceed (even without auth)
    if (!requireLogin) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Login not required for inquiry, proceeding with or without auth');
      }
      return next();
    }

    // Login is required - check if user is authenticated
    if (!req.user) {
      // Log for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Login required but no user found. Token present?', !!req.headers.authorization);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Please login to submit an inquiry. This feature requires authentication.',
        requiresAuth: true,
      });
    }

    // User is authenticated, proceed
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ User authenticated for inquiry:', req.user.email);
    }
    next();
  } catch (error) {
    console.error('❌ Error in requireAuthIfB2BInquiryLocked:', error);
    // If token verification fails and login is required, return 401
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.',
        requiresAuth: true,
      });
    }
    next(error);
  }
};

// Helper function to verify token and set req.user if token is present
async function setUserIfTokenPresent(req) {
  try {
    let token;

    // Check if token exists in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return; // No token, req.user stays undefined
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not set in environment variables');
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (req.user && process.env.NODE_ENV !== 'production') {
      console.log('✅ User authenticated in b2bSettingsGate:', req.user.email, 'Role:', req.user.role);
    }
  } catch (error) {
    // If token verification fails, just log and continue (req.user stays undefined)
    // The calling function will handle the error appropriately
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Token verification failed in b2bSettingsGate:', error.message);
    }
    // Don't throw - let the calling function decide what to do
  }
}
