const express = require('express');
const router = express.Router();
const { uploadSingle, uploadImage } = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/authMiddleware');

// Upload image route
router.post('/', protect, admin, uploadSingle, uploadImage);

module.exports = router;

