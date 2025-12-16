const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

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

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalUsers,
        totalProducts,
        totalOrders,
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
      .populate('user', 'name email')
      .populate('items.product', 'name image')
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

