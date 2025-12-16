const Question = require('../models/Question');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { socketHelpers } = require('../config/socket');
const logger = require('../config/logger');

// @desc    Get questions for a product
// @route   GET /api/questions/product/:productId
// @access  Public
exports.getProductQuestions = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let questions = await Question.find({
      product: productObjectId,
      isActive: true,
    })
      .populate('user', 'name email')
      .populate('answers.answeredBy', 'name email role')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out inactive answers from questions
    questions = questions.map(question => {
      const questionObj = question.toObject();
      questionObj.answers = questionObj.answers.filter(answer => answer.isActive !== false);
      return questionObj;
    });

    const total = await Question.countDocuments({
      product: productObjectId,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a question
// @route   POST /api/questions
// @access  Private
exports.createQuestion = async (req, res, next) => {
  try {
    const { productId, question } = req.body;

    // Validate required fields
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required',
      });
    }

    if (question.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Question is too long (max 1000 characters)',
      });
    }

    // Validate productId
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check for duplicate questions (similar question from same user for same product)
    const sanitizedQuestion = question.trim().toLowerCase();
    const existingQuestion = await Question.findOne({
      product: productId,
      user: req.user._id,
      question: { $regex: new RegExp(`^${sanitizedQuestion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      isActive: true,
    });

    if (existingQuestion) {
      return res.status(400).json({
        success: false,
        message: 'You have already asked a similar question for this product',
      });
    }

    const newQuestion = await Question.create({
      product: productId,
      user: req.user._id,
      question: question.trim(),
    });

    await newQuestion.populate('user', 'name email');
    await newQuestion.populate('product', 'name');

    // Emit real-time notification to admin
    socketHelpers.emitNewQuestion(newQuestion);

    logger.info('Question created', {
      questionId: newQuestion._id,
      productId,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Question submitted successfully',
      data: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Answer a question
// @route   POST /api/questions/:questionId/answer
// @access  Private
exports.answerQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    // Validate answer input
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Answer text is required',
      });
    }

    if (answer.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Answer is too long (max 2000 characters)',
      });
    }

    // Validate questionId
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID',
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Check if question is active
    if (!question.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This question has been deleted',
      });
    }

    // Check if user already answered (prevent duplicate answers)
    const existingAnswer = question.answers.find(
      (ans) => 
        ans.answeredBy.toString() === req.user._id.toString() &&
        ans.isActive !== false
    );

    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'You have already answered this question',
      });
    }

    // Sanitize answer
    const sanitizedAnswer = answer.trim();

    question.answers.push({
      answer: sanitizedAnswer,
      answeredBy: req.user._id,
      isAdmin: req.user.role === 'admin',
    });

    await question.save();
    await question.populate('user', 'name email');
    await question.populate('answers.answeredBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an answer
// @route   PUT /api/questions/:questionId/answer/:answerId
// @access  Private
exports.updateAnswer = async (req, res, next) => {
  try {
    const { questionId, answerId } = req.params;
    const { answer } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const answerToUpdate = question.answers.id(answerId);

    if (!answerToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
      });
    }

    // Check if user owns the answer or is admin
    if (
      answerToUpdate.answeredBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this answer',
      });
    }

    answerToUpdate.answer = answer;
    await question.save();
    await question.populate('user', 'name email');
    await question.populate('answers.answeredBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Answer updated successfully',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question (Admin only)
// @route   DELETE /api/questions/:questionId
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID',
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    // Admin can delete any question
    // For regular users (if needed in future), check ownership
    if (req.user.role !== 'admin' && question.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this question',
      });
    }

    // Soft delete by setting isActive to false
    question.isActive = false;
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    next(error);
  }
};

// @desc    Delete an answer (Admin only)
// @route   DELETE /api/questions/:questionId/answer/:answerId
// @access  Private/Admin
exports.deleteAnswer = async (req, res, next) => {
  try {
    const { questionId, answerId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(questionId) || !mongoose.Types.ObjectId.isValid(answerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question or answer ID',
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const answerToDelete = question.answers.id(answerId);

    if (!answerToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found',
      });
    }

    // Admin can delete any answer
    // For regular users (if needed in future), check ownership
    if (
      req.user.role !== 'admin' &&
      answerToDelete.answeredBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this answer',
      });
    }

    // Soft delete by setting isActive to false
    answerToDelete.isActive = false;
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Answer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting answer:', error);
    next(error);
  }
};

// @desc    Mark question/answer as helpful
// @route   POST /api/questions/:questionId/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { answerId } = req.query; // Optional: if provided, mark answer as helpful

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found',
      });
    }

    const userId = req.user._id.toString();

    if (answerId) {
      // Mark answer as helpful
      const answer = question.answers.id(answerId);
      if (!answer) {
        return res.status(404).json({
          success: false,
          message: 'Answer not found',
        });
      }

      const alreadyHelpful = answer.helpfulUsers.some((id) => id.toString() === userId);

      if (alreadyHelpful) {
        answer.helpfulUsers = answer.helpfulUsers.filter((id) => id.toString() !== userId);
        answer.helpful = Math.max(0, answer.helpful - 1);
      } else {
        answer.helpfulUsers.push(req.user._id);
        answer.helpful += 1;
      }
    } else {
      // Mark question as helpful
      const alreadyHelpful = question.helpfulUsers.some((id) => id.toString() === userId);

      if (alreadyHelpful) {
        question.helpfulUsers = question.helpfulUsers.filter((id) => id.toString() !== userId);
        question.helpful = Math.max(0, question.helpful - 1);
      } else {
        question.helpfulUsers.push(req.user._id);
        question.helpful += 1;
      }
    }

    await question.save();
    await question.populate('user', 'name email');
    await question.populate('answers.answeredBy', 'name email role');

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions (Admin)
// @route   GET /api/questions
// @access  Private/Admin
exports.getAllQuestions = async (req, res, next) => {
  try {
    const { productId, page = 1, limit = 20, includeInactive = false } = req.query;

    const query = {};
    // By default, only show active questions unless explicitly requested
    if (includeInactive !== 'true') {
      query.isActive = true;
    }
    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID',
        });
      }
      query.product = productId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Filter out questions with null products or users (in case they were deleted)
    let questions = await Question.find(query)
      .populate('product', 'name image')
      .populate('user', 'name email')
      .populate('answers.answeredBy', 'name email role')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out questions where product or user is null
    questions = questions.filter(question => question.product !== null && question.user !== null);

    // Filter out inactive answers from questions
    questions = questions.map(question => {
      const questionObj = question.toObject();
      questionObj.answers = questionObj.answers.filter(answer => answer.isActive !== false);
      return questionObj;
    });

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        questions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

