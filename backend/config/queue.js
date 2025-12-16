const Queue = require('bull');
const emailService = require('../services/emailService');
const logger = require('./logger');

// Create Redis connection URL
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Email Queue
const emailQueue = new Queue('email', {
  redis: redisUrl,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  },
});

// Notification Queue
const notificationQueue = new Queue('notifications', {
  redis: redisUrl,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 1000,
    },
  },
});

// Handle notification queue connection errors gracefully
notificationQueue.on('error', (error) => {
  logger.error('Notification queue error:', error);
  console.error('⚠️ Notification queue error (Redis may not be available):', error.message);
});

// Process email jobs
emailQueue.process('order-confirmation', async (job) => {
  const { order } = job.data;
  logger.info(`Processing order confirmation email for order ${order.orderId || order._id}`);
  
  const result = await emailService.sendOrderConfirmation(order);
  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }
  
  return result;
});

emailQueue.process('order-status-update', async (job) => {
  const { order, newStatus } = job.data;
  logger.info(`Processing order status update email for order ${order.orderId || order._id}`);
  
  const result = await emailService.sendOrderStatusUpdate(order, newStatus);
  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }
  
  return result;
});

emailQueue.process('admin-notification', async (job) => {
  const { order } = job.data;
  logger.info(`Processing admin notification email for order ${order.orderId || order._id}`);
  
  const result = await emailService.sendAdminNewOrderNotification(order);
  if (!result.success) {
    throw new Error(result.error || 'Failed to send email');
  }
  
  return result;
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

notificationQueue.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed`);
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Notification job ${job.id} failed:`, err);
});

// Helper functions to add jobs
const queueHelpers = {
  // Add order confirmation email to queue
  addOrderConfirmationEmail: (order) => {
    return emailQueue.add('order-confirmation', { order }, {
      priority: 1, // High priority
      delay: 0,
    });
  },

  // Add order status update email to queue
  addOrderStatusUpdateEmail: (order, newStatus) => {
    return emailQueue.add('order-status-update', { order, newStatus }, {
      priority: 2,
      delay: 0,
    });
  },

  // Add admin notification email to queue
  addAdminNotificationEmail: (order) => {
    return emailQueue.add('admin-notification', { order }, {
      priority: 1,
      delay: 0,
    });
  },

  // Add notification to queue (for future use)
  addNotification: (type, data) => {
    return notificationQueue.add(type, data);
  },
};

module.exports = {
  emailQueue,
  notificationQueue,
  queueHelpers,
};

