const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Add order count and total spent for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id, paymentStatus: 'Paid' });
        const orderCount = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        return {
          ...user.toObject(),
          orderCount,
          totalSpent: Math.round(totalSpent * 100) / 100,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's order stats
    const orders = await Order.find({ user: user._id, paymentStatus: 'Paid' });
    const orderCount = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        orderCount,
        totalSpent: Math.round(totalSpent * 100) / 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (user or admin)',
      });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting yourself
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

