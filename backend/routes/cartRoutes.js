const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateQuantity);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;

