const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/b2bBannerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllBanners)
  .post(protect, admin, createBanner);

router.route('/:id')
  .get(getBannerById)
  .put(protect, admin, updateBanner)
  .delete(protect, admin, deleteBanner);

module.exports = router;

