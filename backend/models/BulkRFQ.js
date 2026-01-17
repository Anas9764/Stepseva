const mongoose = require('mongoose');

const bulkRFQItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantityRequired: { type: Number, required: true, min: 1 },
    size: { type: String, trim: true },
    color: { type: String, trim: true },
  },
  { _id: false }
);

const bulkRFQSchema = new mongoose.Schema(
  {
    buyerName: { type: String, required: true, trim: true },
    buyerEmail: { type: String, required: true, trim: true, lowercase: true },
    buyerPhone: { type: String, required: true, trim: true },
    buyerCity: { type: String, required: true, trim: true },
    buyerState: { type: String, trim: true },
    buyerCountry: { type: String, default: 'India' },
    businessType: { type: String, default: 'other' },
    companyName: { type: String, trim: true },
    gstNumber: { type: String, trim: true },

    inquiryType: { type: String, default: 'bulk_inquiry' },
    notes: { type: String, trim: true },
    requirements: { type: String, trim: true },

    items: { type: [bulkRFQItemSchema], required: true, validate: [(v) => Array.isArray(v) && v.length > 0, 'At least one item is required'] },

    buyerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    businessAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessAccount' },

    source: { type: String, default: 'website' },
    status: { type: String, default: 'new', enum: ['new', 'in_progress', 'quoted', 'won', 'lost', 'closed'] },
    priority: { type: String, default: 'low', enum: ['low', 'medium', 'high'] },

    ipAddress: { type: String },
    userAgent: { type: String },

    adminNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

bulkRFQSchema.index({ createdAt: -1 });
bulkRFQSchema.index({ buyerEmail: 1, createdAt: -1 });

module.exports = mongoose.model('BulkRFQ', bulkRFQSchema);
