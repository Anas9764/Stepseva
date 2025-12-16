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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL
]
  .filter(Boolean) // Remove undefined values
  .map(url => url.trim().replace(/\/$/, '')); // Remove trailing slashes and whitespace

// Log allowed origins in development
if (process.env.NODE_ENV !== 'production') {
  console.log('🌐 Allowed CORS Origins:', allowedOrigins);
  logger.info('CORS Configuration', { allowedOrigins });
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    
    // Check for exact match
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.trim().replace(/\/$/, '');
      return normalizedOrigin === normalizedAllowed || normalizedOrigin.startsWith(normalizedAllowed);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', normalizedOrigin);
      console.warn('✅ Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS. Origin: ${normalizedOrigin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api', paymentRoutes);
app.use('/api/contact', contactRoutes);

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

