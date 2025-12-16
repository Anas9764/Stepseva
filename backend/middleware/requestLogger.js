const logger = require('../config/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Override res.end to log response time
  const originalEnd = res.end;
  res.end = function (...args) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalEnd.apply(this, args);
  };

  next();
};

module.exports = requestLogger;

