const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getActivityLogById,
  getActivityStats,
  deleteActivityLogs,
} = require('../controllers/activityLogController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(protect, admin);

router.get('/', getActivityLogs);
router.get('/stats', getActivityStats);
router.get('/:id', getActivityLogById);
router.delete('/', deleteActivityLogs);

module.exports = router;

