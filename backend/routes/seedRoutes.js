const express = require('express');
const { seedCatalogData } = require('../controllers/seedController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/catalog', protect, admin, seedCatalogData);

module.exports = router;

