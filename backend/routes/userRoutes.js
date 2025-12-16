const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id/role', protect, admin, updateUserRole);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;

