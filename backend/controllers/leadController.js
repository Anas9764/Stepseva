const Lead = require('../models/Lead');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');
const logger = require('../config/logger');

// @desc    Create a new lead/inquiry
// @route   POST /api/leads
// @access  Public (buyers can submit inquiries without login)
exports.createLead = async (req, res, next) => {
  try {
    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerCity,
      buyerState,
      buyerCountry,
      businessType,
      companyName,
      gstNumber,
      productId,
      quantityRequired,
      size,
      color,
      inquiryType,
      notes,
      requirements,
    } = req.body;

    // Validate required fields
    if (!buyerName || !buyerEmail || !buyerPhone || !buyerCity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide buyer name, email, phone, and city',
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID',
      });
    }

    if (!quantityRequired || quantityRequired < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid quantity required (minimum 1)',
      });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user is authenticated (optional - for registered buyers)
    let buyerUserId = null;
    let businessAccountId = null;
    if (req.user) {
      buyerUserId = req.user._id;
      if (req.user.businessAccountId) {
        businessAccountId = req.user.businessAccountId;
      }
    }

    // Get IP address and user agent for tracking
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];

    // Create lead
    const lead = await Lead.create({
      buyerName,
      buyerEmail: buyerEmail.toLowerCase().trim(),
      buyerPhone: buyerPhone.trim(),
      buyerCity: buyerCity.trim(),
      buyerState: buyerState?.trim(),
      buyerCountry: buyerCountry || 'India',
      businessType: businessType || 'other',
      companyName: companyName?.trim(),
      gstNumber: gstNumber?.trim(),
      productId,
      productName: product.name,
      quantityRequired,
      size: size?.trim(),
      color: color?.trim(),
      inquiryType: inquiryType || 'get_best_price',
      notes: notes?.trim(),
      requirements: requirements?.trim(),
      buyerUserId,
      businessAccountId,
      ipAddress,
      userAgent,
      source: 'website',
      status: 'new',
      priority: quantityRequired >= 1000 ? 'high' : quantityRequired >= 500 ? 'medium' : 'low',
    });

    logger.info('New lead created', {
      leadId: lead._id,
      productId,
      buyerEmail,
      quantityRequired,
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully. We will contact you soon!',
      data: {
        lead: {
          _id: lead._id,
          status: lead.status,
          createdAt: lead.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error creating lead', { error: error.message });
    next(error);
  }
};

// @desc    Get all leads (Admin only)
// @route   GET /api/leads
// @access  Private (Admin)
exports.getAllLeads = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const {
      status,
      priority,
      productId,
      businessType,
      assignedTo,
      page = 1,
      limit = 20,
      search,
      startDate,
      endDate,
    } = req.query;

    // Build query
    let query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.productId = productId;
    }

    if (businessType) {
      query.businessType = businessType;
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      query.assignedTo = assignedTo;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { buyerName: { $regex: search, $options: 'i' } },
        { buyerEmail: { $regex: search, $options: 'i' } },
        { buyerPhone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.find(query)
      .populate('productId', 'name image price moq')
      .populate('assignedTo', 'name email')
      .populate('contactedBy', 'name email')
      .populate('buyerUserId', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    // Count leads by status for dashboard
    const statusCounts = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    logger.error('Error fetching leads', { error: error.message });
    next(error);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private (Admin or Lead Owner)
exports.getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID',
      });
    }

    const lead = await Lead.findById(id)
      .populate('productId', 'name image price moq description category')
      .populate('assignedTo', 'name email phone')
      .populate('contactedBy', 'name email phone')
      .populate('buyerUserId', 'name email phone')
      .populate('businessAccountId', 'companyName businessType');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check access: Admin can see all, buyer can see their own
    if (req.user) {
      if (req.user.role !== 'admin' && lead.buyerUserId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    res.status(200).json({
      success: true,
      data: { lead },
    });
  } catch (error) {
    logger.error('Error fetching lead', { error: error.message });
    next(error);
  }
};

// @desc    Update lead status and details
// @route   PUT /api/leads/:id
// @access  Private (Admin)
exports.updateLead = async (req, res, next) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const { id } = req.params;
    const {
      status,
      priority,
      assignedTo,
      quotedPrice,
      quoteNotes,
      quoteFile,
      followUpDate,
      followUpNotes,
      internalNotes,
      tags,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID',
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Update fields
    if (status) {
      lead.status = status;
      // Auto-update timestamps based on status
      if (status === 'contacted' && !lead.contactedAt) {
        lead.contactedAt = new Date();
        lead.contactedBy = req.user._id;
      }
      if (status === 'contacted') {
        lead.lastContactedAt = new Date();
      }
      if (status === 'quoted' && quotedPrice) {
        lead.quotedAt = new Date();
      }
    }

    if (priority) lead.priority = priority;
    if (assignedTo) lead.assignedTo = assignedTo;
    if (quotedPrice !== undefined) lead.quotedPrice = quotedPrice;
    if (quoteNotes) lead.quoteNotes = quoteNotes;
    if (quoteFile) lead.quoteFile = quoteFile;
    if (followUpDate) lead.followUpDate = new Date(followUpDate);
    if (followUpNotes) lead.followUpNotes = followUpNotes;
    if (internalNotes) lead.internalNotes = internalNotes;
    if (tags && Array.isArray(tags)) lead.tags = tags;

    await lead.save();

    logger.info('Lead updated', {
      leadId: lead._id,
      status: lead.status,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead },
    });
  } catch (error) {
    logger.error('Error updating lead', { error: error.message });
    next(error);
  }
};

// @desc    Get buyer's own leads (if registered)
// @route   GET /api/leads/my-inquiries
// @access  Private (Buyer)
exports.getMyInquiries = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get leads by buyer email or user ID
    const query = {
      $or: [
        { buyerEmail: req.user.email.toLowerCase() },
        { buyerUserId: req.user._id },
      ],
    };

    const leads = await Lead.find(query)
      .populate('productId', 'name image price moq')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching buyer inquiries', { error: error.message });
    next(error);
  }
};

// @desc    Get lead statistics (Admin dashboard)
// @route   GET /api/leads/stats
// @access  Private (Admin)
exports.getLeadStats = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const { startDate, endDate } = req.query;
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total leads
    const totalLeads = await Lead.countDocuments(dateFilter);

    // Leads by status
    const statusCounts = await Lead.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Leads by priority
    const priorityCounts = await Lead.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // New leads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newLeadsLast7Days = await Lead.countDocuments({
      ...dateFilter,
      createdAt: { $gte: sevenDaysAgo },
      status: 'new',
    });

    // Top products by lead count
    const topProducts = await Lead.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          productImage: '$product.image',
          leadCount: '$count',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priorityCounts: priorityCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        newLeadsLast7Days,
        topProducts,
      },
    });
  } catch (error) {
    logger.error('Error fetching lead stats', { error: error.message });
    next(error);
  }
};

