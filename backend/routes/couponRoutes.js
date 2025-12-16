const express = require('express');
const router = express.Router();
const {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);

// Admin routes
router.get('/', protect, admin, getAllCoupons);
router.get('/:id', protect, admin, getCouponById);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;

