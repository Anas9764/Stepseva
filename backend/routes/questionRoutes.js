const express = require('express');
const router = express.Router();
const {
  getProductQuestions,
  createQuestion,
  answerQuestion,
  updateAnswer,
  deleteQuestion,
  deleteAnswer,
  markHelpful,
  getAllQuestions,
} = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');
const { questionLimiter, answerLimiter, helpfulLimiter } = require('../middleware/rateLimiter');
const { validate, questionSchemas } = require('../middleware/validation');

// Public routes
router.get('/product/:productId', getProductQuestions);

// Protected routes with rate limiting
router.post('/', protect, questionLimiter, validate(questionSchemas.create), createQuestion);
router.post('/:questionId/answer', protect, answerLimiter, validate(questionSchemas.answer), answerQuestion);
router.put('/:questionId/answer/:answerId', protect, updateAnswer);
router.post('/:questionId/helpful', protect, helpfulLimiter, markHelpful);

// Admin routes
router.get('/', protect, admin, getAllQuestions);
router.delete('/:questionId', protect, admin, deleteQuestion);
router.delete('/:questionId/answer/:answerId', protect, admin, deleteAnswer);

module.exports = router;

