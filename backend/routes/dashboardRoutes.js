const express = require('express');
const router = express.Router();
const {
  getStats,
  getSalesData,
  getRecentOrders,
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// All dashboard routes require authentication and admin role
router.get('/stats', protect, admin, getStats);
router.get('/sales', protect, admin, getSalesData);
router.get('/recent-orders', protect, admin, getRecentOrders);

module.exports = router;

