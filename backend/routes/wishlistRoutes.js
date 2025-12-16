const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/', clearWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);

module.exports = router;

