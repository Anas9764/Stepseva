const express = require('express');
const router = express.Router();
const {
  createBusinessAccount,
  getMyBusinessAccount,
  updateBusinessAccount,
  getAllBusinessAccounts,
  approveBusinessAccount,
  updateCreditLimit,
} = require('../controllers/businessAccountController');
const { protect, admin } = require('../middleware/authMiddleware');

// Business account routes
router.post('/', protect, createBusinessAccount);
router.get('/me', protect, getMyBusinessAccount);
router.put('/me', protect, updateBusinessAccount);

// Admin routes
router.get('/', protect, admin, getAllBusinessAccounts);
router.put('/:id/approve', protect, admin, approveBusinessAccount);
router.put('/:id/credit', protect, admin, updateCreditLimit);

module.exports = router;

