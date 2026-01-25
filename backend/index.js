const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import logger
const logger = require('./config/logger');

// Import Socket.io
const { initializeSocket } = require('./config/socket');

// Initialize Redis on startup (non-blocking)
const { getRedisClient } = require('./config/redis');
(async () => {
  try {
    const client = await getRedisClient();
    if (client) {
      logger.info('✅ Redis Client Connected');
      console.log('✅ Redis Client Connected');
    } else {
      logger.warn('⚠️ Redis not available - continuing without cache');
      console.log('⚠️ Redis not available - continuing without cache');
    }
  } catch (err) {
    logger.warn('⚠️ Redis connection failed - continuing without cache:', err.message);
    console.log('⚠️ Redis connection failed - continuing without cache');
  }
})();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const seedRoutes = require('./routes/seedRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const questionRoutes = require('./routes/questionRoutes');
const businessAccountRoutes = require('./routes/businessAccountRoutes');
const leadRoutes = require('./routes/leadRoutes');
const bulkRFQRoutes = require('./routes/bulkRFQRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
// B2B/B2C separated routes
const b2bCategoryRoutes = require('./routes/b2bCategoryRoutes');
const b2bProductRoutes = require('./routes/b2bProductRoutes');
const b2bBannerRoutes = require('./routes/b2bBannerRoutes');
const b2cCategoryRoutes = require('./routes/b2cCategoryRoutes');
const b2cProductRoutes = require('./routes/b2cProductRoutes');
const b2cBannerRoutes = require('./routes/b2cBannerRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
// Build allowed origins from environment variables
const allowedOrigins = [
  // Localhost URLs (always allowed in development)
  'http://localhost:5173', // Regular Frontend
  'http://localhost:5174', // Admin Panel
  'http://localhost:5175', // Business Frontend
  'http://localhost:3000',
  // Production URLs from environment variables
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
  process.env.BUSINESS_FRONTEND_URL
]
  .filter(Boolean) // Remove undefined values
  .map(url => url.trim().replace(/\/$/, '')); // Remove trailing slashes and whitespace

// Log allowed origins
if (process.env.NODE_ENV !== 'production') {
  console.log('🌐 Allowed CORS Origins:', allowedOrigins);
  console.log('📍 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 CLIENT_URL:', process.env.CLIENT_URL || 'not set');
  console.log('🔗 ADMIN_URL:', process.env.ADMIN_URL || 'not set');
  console.log('🔗 BUSINESS_FRONTEND_URL:', process.env.BUSINESS_FRONTEND_URL || 'not set');
  logger.info('CORS Configuration', {
    allowedOrigins,
    environment: process.env.NODE_ENV,
    clientUrl: process.env.CLIENT_URL,
    adminUrl: process.env.ADMIN_URL,
    businessFrontendUrl: process.env.BUSINESS_FRONTEND_URL
  });
} else {
  // In production, log CORS info for debugging
  console.log('🌐 Allowed CORS Origins Count:', allowedOrigins.length);
  console.log('🔗 BUSINESS_FRONTEND_URL:', process.env.BUSINESS_FRONTEND_URL || 'not set');
  logger.info('CORS Configuration', {
    allowedOriginsCount: allowedOrigins.length,
    allowedOrigins: allowedOrigins, // Include in production for debugging
    environment: 'production',
    businessFrontendUrl: process.env.BUSINESS_FRONTEND_URL
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize origin (remove trailing slash and whitespace)
    const normalizedOrigin = origin.trim().replace(/\/$/, '');

    // 1. Allow any localhost for development
    if (normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // 2. Allow any Vercel preview or production deployment
    if (normalizedOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // 3. Check for exact match in allowedOrigins from env
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.trim().replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', normalizedOrigin);
      console.warn('✅ Allowed origins list:', allowedOrigins);
      // In production, we might want to be strict, but for now let's allow common patterns
      // callback(new Error(`Not allowed by CORS. Origin: ${normalizedOrigin}`));

      // FALLBACK: If it contains 'vercel' or matches our known patterns, allow it
      if (normalizedOrigin.includes('vercel')) {
        return callback(null, true);
      }

      callback(new Error(`Not allowed by CORS. Origin: ${normalizedOrigin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Frontend-Type', 'Accept'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Database connection
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set in environment variables!');
  process.exit(1);
}

// Configure mongoose options
mongoose.set('strictPopulate', false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('✅ MongoDB Connected', { database: mongoose.connection.name });
    console.log('✅ MongoDB Connected');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    logger.error('❌ MongoDB Connection Error:', err);
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'StepSeva API is running',
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/business-accounts', businessAccountRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/bulk-rfqs', bulkRFQRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api', paymentRoutes);
app.use('/api/contact', contactRoutes);
// B2B/B2C separated routes
app.use('/api/b2b/categories', b2bCategoryRoutes);
app.use('/api/b2b/products', b2bProductRoutes);
app.use('/api/b2b/banners', b2bBannerRoutes);
app.use('/api/b2c/categories', b2cCategoryRoutes);
app.use('/api/b2c/products', b2cProductRoutes);
app.use('/api/b2c/banners', b2cBannerRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

