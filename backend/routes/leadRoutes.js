const express = require('express');
const router = express.Router();
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  getMyInquiries,
  getLeadStats,
} = require('../controllers/leadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route - anyone can submit an inquiry
router.post('/', createLead);

// Protected routes - Buyers can view their own inquiries
router.get('/my-inquiries', protect, getMyInquiries);

// Admin routes
router.get('/stats', protect, admin, getLeadStats);
router.get('/', protect, admin, getAllLeads);
router.get('/:id', protect, getLeadById);
router.put('/:id', protect, admin, updateLead);

module.exports = router;

