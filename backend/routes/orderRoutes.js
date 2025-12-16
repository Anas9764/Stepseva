const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderBySession,
  getOrderById,
  generateInvoice,
  exportOrdersCSV,
  addOrderNote,
  updateTracking,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const { orderLimiter, orderUpdateLimiter } = require('../middleware/rateLimiter');
const { validate, orderSchemas } = require('../middleware/validation');

router.route('/')
  .post(orderLimiter, validate(orderSchemas.create), createOrder)
  .get(protect, admin, getAllOrders);

router.get('/session/:sessionId', getOrderBySession);
router.get('/order/:id', getOrderById);
router.get('/export/csv', protect, admin, exportOrdersCSV);
router.get('/:id/invoice', protect, generateInvoice);

router.get('/:userId', protect, getUserOrders);

router.put('/:id', protect, admin, orderUpdateLimiter, validate(orderSchemas.updateStatus, 'body'), updateOrderStatus);
router.put('/:id/tracking', protect, admin, validate(orderSchemas.updateTracking), updateTracking);
router.post('/:id/notes', protect, admin, validate(orderSchemas.addNote), addOrderNote);

module.exports = router;

