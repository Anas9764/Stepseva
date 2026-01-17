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
const { requireAuthIfB2BInquiryLocked } = require('../middleware/b2bSettingsGate');

// Public route - optional login; can become login-required via Settings toggle
// NOTE: `protect` is not used here because we want anonymous inquiries when toggle is off.
router.post('/', requireAuthIfB2BInquiryLocked, createLead);

// Protected routes - Buyers can view their own inquiries
router.get('/my-inquiries', protect, getMyInquiries);

// Admin routes
router.get('/stats', protect, admin, getLeadStats);
router.get('/', protect, admin, getAllLeads);
router.get('/:id', protect, getLeadById);
router.put('/:id', protect, admin, updateLead);

module.exports = router;

