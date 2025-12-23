const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Lead = require('../models/Lead');
const BusinessAccount = require('../models/BusinessAccount');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue from completed orders
    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // B2B Statistics
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'new' });
    const totalBusinessAccounts = await BusinessAccount.countDocuments();
    const activeBusinessAccounts = await BusinessAccount.countDocuments({ status: 'active' });
    const pendingBusinessAccounts = await BusinessAccount.countDocuments({ status: 'pending' });
    
    // B2B Revenue (orders with isB2BOrder flag)
    const b2bRevenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          isB2BOrder: true,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);
    const b2bRevenue = b2bRevenueData.length > 0 ? b2bRevenueData[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalUsers,
        totalProducts,
        totalOrders,
        // B2B Stats
        totalLeads,
        newLeads,
        totalBusinessAccounts,
        activeBusinessAccounts,
        pendingBusinessAccounts,
        b2bRevenue: Math.round(b2bRevenue * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales data for charts
// @route   GET /api/dashboard/sales
// @access  Private/Admin
exports.getSalesData = async (req, res, next) => {
  try {
    const { period = '30days' } = req.query;

    let daysBack = 30;
    if (period === '7days') daysBack = 7;
    if (period === '90days') daysBack = 90;
    if (period === '365days') daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get orders from the specified period
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      paymentStatus: 'Paid',
    }).sort({ createdAt: 1 });

    // Group by date
    const salesByDate = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += order.totalAmount;
    });

    // Convert to arrays for chart
    const labels = Object.keys(salesByDate);
    const values = Object.values(salesByDate);

    // If no data, provide sample data
    if (labels.length === 0) {
      const sampleLabels = [];
      const sampleValues = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      
      for (let i = 0; i < 6; i++) {
        sampleLabels.push(months[i]);
        sampleValues.push(Math.floor(Math.random() * 1000) + 500);
      }

      return res.status(200).json({
        success: true,
        data: {
          labels: sampleLabels,
          values: sampleValues,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        labels,
        values,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent orders
// @route   GET /api/dashboard/recent-orders
// @access  Private/Admin
exports.getRecentOrders = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name image')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent B2B leads
// @route   GET /api/dashboard/recent-leads
// @access  Private/Admin
exports.getRecentLeads = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const leads = await Lead.find()
      .populate('productId', 'name image')
      .populate('businessAccountId', 'companyName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming follow-ups
// @route   GET /api/dashboard/upcoming-followups
// @access  Private/Admin
exports.getUpcomingFollowups = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const followups = await Lead.find({
      followUpDate: {
        $gte: today,
        $lte: nextWeek,
      },
      status: { $in: ['new', 'contacted', 'interested', 'quoted', 'negotiating'] },
    })
      .populate('productId', 'name image')
      .populate('businessAccountId', 'companyName')
      .sort({ followUpDate: 1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: followups,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity logs
// @route   GET /api/dashboard/recent-activities
// @access  Private/Admin
exports.getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await ActivityLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

