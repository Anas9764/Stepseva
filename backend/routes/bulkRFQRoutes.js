const express = require('express');
const router = express.Router();

const {
  createBulkRFQ,
  getAllBulkRFQs,
  getBulkRFQById,
  updateBulkRFQ,
} = require('../controllers/bulkRFQController');

const { protect, admin } = require('../middleware/authMiddleware');
const { requireAuthIfB2BInquiryLocked } = require('../middleware/b2bSettingsGate');

// Public route - optional login; can become login-required via Settings toggle
router.post('/', requireAuthIfB2BInquiryLocked, createBulkRFQ);

// Admin routes
router.get('/', protect, admin, getAllBulkRFQs);
router.get('/:id', protect, admin, getBulkRFQById);
router.put('/:id', protect, admin, updateBulkRFQ);

module.exports = router;
