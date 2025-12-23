const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware to log admin activities
 * @param {Object} options - Configuration options
 * @param {String} options.action - Action type (create, update, delete, etc.)
 * @param {String} options.entityType - Entity type (product, order, etc.)
 * @param {Function} options.getEntityId - Function to get entity ID from request
 * @param {Function} options.getEntityName - Function to get entity name from request/response
 * @param {Function} options.getDescription - Function to generate description
 * @param {Function} options.getChanges - Function to get changes (for update actions)
 */
const activityLogger = (options = {}) => {
  return async (req, res, next) => {
    // Only log admin actions
    if (!req.user || req.user.role !== 'admin') {
      return next();
    }

    // Store original json method
    const originalJson = res.json;

    // Override res.json to capture response
    res.json = function (data) {
      res.locals.responseData = data;
      return originalJson.call(this, data);
    };

    // Continue to next middleware
    next();

    // Log after response is sent (async, don't block)
    setImmediate(async () => {
      try {
        const {
          action = 'view',
          entityType,
          getEntityId = (req) => req.params.id || req.body.id,
          getEntityName = (req, res) => null,
          getDescription = (req, res) => `${action} ${entityType}`,
          getChanges = (req, res) => null,
        } = options;

        // Skip if response was an error
        if (res.statusCode >= 400) {
          return;
        }

        const entityId = getEntityId(req, res);
        const entityName = getEntityName(req, res);
        const description = getDescription(req, res);
        const changes = getChanges(req, res);

        await ActivityLog.create({
          userId: req.user._id,
          userName: req.user.name,
          userEmail: req.user.email,
          action,
          entityType,
          entityId: entityId ? String(entityId) : null,
          entityName,
          description,
          changes,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
          },
        });
      } catch (error) {
        // Don't break the request if logging fails
        console.error('Activity log error:', error);
      }
    });
  };
};

/**
 * Helper function to log activities manually
 */
const logActivity = async (req, options) => {
  if (!req.user || req.user.role !== 'admin') {
    return;
  }

  try {
    const {
      action,
      entityType,
      entityId,
      entityName,
      description,
      changes,
      metadata = {},
    } = options;

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action,
      entityType,
      entityId: entityId ? String(entityId) : null,
      entityName,
      description,
      changes,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      metadata: {
        ...metadata,
        method: req.method,
        path: req.path,
      },
    });
  } catch (error) {
    console.error('Activity log error:', error);
  }
};

module.exports = { activityLogger, logActivity };

