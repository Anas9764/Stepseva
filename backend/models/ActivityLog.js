const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'create',
        'update',
        'delete',
        'view',
        'export',
        'import',
        'approve',
        'reject',
        'login',
        'logout',
        'status_change',
        'bulk_update',
        'bulk_delete',
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        'product',
        'category',
        'order',
        'user',
        'lead',
        'business_account',
        'review',
        'question',
        'coupon',
        'banner',
        'settings',
        'system',
      ],
    },
    entityId: {
      type: String,
      required: false,
    },
    entityName: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;

