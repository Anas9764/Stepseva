const express = require('express');
const router = express.Router();
const {
  getStats,
  getSalesData,
  getRecentOrders,
  getRecentLeads,
  getUpcomingFollowups,
  getRecentActivities,
} = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// All dashboard routes require authentication and admin role
router.get('/stats', protect, admin, getStats);
router.get('/sales', protect, admin, getSalesData);
router.get('/recent-orders', protect, admin, getRecentOrders);
router.get('/recent-leads', protect, admin, getRecentLeads);
router.get('/upcoming-followups', protect, admin, getUpcomingFollowups);
router.get('/recent-activities', protect, admin, getRecentActivities);

module.exports = router;

