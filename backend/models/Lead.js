const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    // Buyer Information
    buyerName: {
      type: String,
      required: [true, 'Please provide buyer name'],
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: [true, 'Please provide buyer email'],
      trim: true,
      lowercase: true,
    },
    buyerPhone: {
      type: String,
      required: [true, 'Please provide buyer phone number'],
      trim: true,
    },
    buyerCity: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    buyerState: {
      type: String,
      trim: true,
    },
    buyerCountry: {
      type: String,
      default: 'India',
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['retailer', 'wholesaler', 'distributor', 'manufacturer', 'business_customer', 'other'],
      default: 'other',
    },
    companyName: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    
    // Product Information
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provide product ID'],
    },
    productName: {
      type: String,
      required: true,
    },
    quantityRequired: {
      type: Number,
      required: [true, 'Please provide quantity required'],
      min: 1,
    },
    size: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    
    // Inquiry Details
    inquiryType: {
      type: String,
      enum: ['get_best_price', 'request_callback', 'contact_supplier', 'bulk_order', 'customization', 'other'],
      default: 'get_best_price',
    },
    notes: {
      type: String,
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
    },
    
    // Lead Status & Management
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'quoted', 'negotiating', 'closed', 'rejected', 'lost'],
      default: 'new',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    
    // Supplier/Admin Response
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contactedAt: Date,
    lastContactedAt: Date,
    
    // Quote & Negotiation
    quotedPrice: {
      type: Number,
      min: 0,
    },
    quotedAt: Date,
    quoteNotes: {
      type: String,
      trim: true,
    },
    quoteFile: {
      type: String, // URL to quote PDF/document
      trim: true,
    },
    
    // Follow-up
    followUpDate: Date,
    followUpNotes: {
      type: String,
      trim: true,
    },
    
    // Source & Tracking
    source: {
      type: String,
      enum: ['website', 'phone', 'email', 'referral', 'other'],
      default: 'website',
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    
    // Buyer Account (if registered)
    buyerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    businessAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessAccount',
    },
    
    // Internal Notes (visible only to admin)
    internalNotes: {
      type: String,
      trim: true,
    },
    
    // Tags for categorization
    tags: [{
      type: String,
      trim: true,
    }],
    
    // Notification & Email
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ productId: 1 });
leadSchema.index({ buyerEmail: 1 });
leadSchema.index({ buyerPhone: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });

// Virtual for lead age (days since creation)
leadSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Lead', leadSchema);

