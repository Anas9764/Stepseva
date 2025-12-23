const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @desc    Get all activity logs with filters
// @route   GET /api/activity-logs
// @access  Private/Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      search,
    } = req.query;

    // Build filter object
    const filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (action) {
      filter.action = action;
    }

    if (entityType) {
      filter.entityType = entityType;
    }

    if (entityId) {
      filter.entityId = entityId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { entityName: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get logs with pagination
    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email')
      .lean();

    // Get total count
    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity log by ID
// @route   GET /api/activity-logs/:id
// @access  Private/Admin
exports.getActivityLogById = async (req, res, next) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Activity log not found',
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity statistics
// @route   GET /api/activity-logs/stats
// @access  Private/Admin
exports.getActivityStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get total logs
    const totalLogs = await ActivityLog.countDocuments(dateFilter);

    // Get logs by action
    const logsByAction = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get logs by entity type
    const logsByEntity = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get most active users
    const mostActiveUsers = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent activity (last 24 hours)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    const recentActivity = await ActivityLog.countDocuments({
      ...dateFilter,
      createdAt: { $gte: last24Hours },
    });

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        logsByAction,
        logsByEntity,
        mostActiveUsers,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity logs (older than specified days or by filter)
// @route   DELETE /api/activity-logs
// @access  Private/Admin
exports.deleteActivityLogs = async (req, res, next) => {
  try {
    const { days, action, entityType } = req.body;

    const filter = {};

    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
      filter.createdAt = { $lt: cutoffDate };
    }

    if (action) {
      filter.action = action;
    }

    if (entityType) {
      filter.entityType = entityType;
    }

    const result = await ActivityLog.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} activity log(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

