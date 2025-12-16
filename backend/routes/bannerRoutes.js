const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  getAllBannersAdmin,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllBanners);

// Admin routes
router.get('/admin', protect, admin, getAllBannersAdmin);
router.post('/', protect, admin, createBanner);
router.put('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

// Public single banner route (placed after admin route definitions)
router.get('/:id', getBannerById);

module.exports = router;

