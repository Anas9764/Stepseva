const rateLimit = require('express-rate-limit');

// Rate limiter for review submissions
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 reviews per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many review submissions. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for question submissions
const questionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 questions per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many question submissions. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for answer submissions
const answerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 answers per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many answer submissions. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for helpful votes
const helpfulLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 helpful votes per 5 minutes per IP
  message: {
    success: false,
    message: 'Too many helpful votes. Please try again in 5 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for order creation
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 orders per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many orders. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for order status updates (admin)
const orderUpdateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 updates per minute
  message: {
    success: false,
    message: 'Too many order updates. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  reviewLimiter,
  questionLimiter,
  answerLimiter,
  helpfulLimiter,
  orderLimiter,
  orderUpdateLimiter,
};

