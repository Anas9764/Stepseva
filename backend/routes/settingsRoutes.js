const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route
router.get('/', getSettings);

// Admin route
router.put('/', protect, admin, updateSettings);

module.exports = router;

