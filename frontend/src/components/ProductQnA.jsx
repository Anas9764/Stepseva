import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiThumbsUp, FiMessageCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { questionService } from '../services/questionService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ProductQnA = ({ productId }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [submittingAnswers, setSubmittingAnswers] = useState(new Set());
  const [markingHelpful, setMarkingHelpful] = useState(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [answerForms, setAnswerForms] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, [productId, page]);

  // Smart refresh: Only check for updates when tab becomes visible or after longer interval
  useEffect(() => {
    if (!productId) return;

    let intervalId;
    let lastCheckTime = Date.now();

    // Function to check if we should refresh (only if tab is visible)
    const checkForUpdates = () => {
      // Only refresh if tab is visible and enough time has passed
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        // Only refresh if it's been more than 2 minutes since last check
        if (timeSinceLastCheck > 120000) {
          fetchQuestions();
          lastCheckTime = Date.now();
        }
      }
    };

    // Check when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Refresh when user comes back to the tab
        fetchQuestions();
        lastCheckTime = Date.now();
      }
    };

    // Set up interval to check every 2 minutes (only if tab is visible)
    intervalId = setInterval(checkForUpdates, 120000); // 2 minutes

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getProductQuestions(productId, {
        page,
        limit: 10,
      });
      setQuestions(response.data.questions || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to ask a question');
      return;
    }

    // Frontend validation
    if (!questionText || questionText.trim().length === 0) {
      toast.error('Please enter your question');
      return;
    }

    if (questionText.trim().length > 1000) {
      toast.error('Question is too long (max 1000 characters)');
      return;
    }

    try {
      setSubmittingQuestion(true);
      await questionService.createQuestion({
        productId,
        question: questionText,
      });
      setShowQuestionForm(false);
      setQuestionText('');
      fetchQuestions();
      toast.success('Question submitted successfully!');
    } catch (error) {
      console.error('Error submitting question:', error);
      toast.error(error.response?.data?.message || 'Failed to submit question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (questionId, answerText) => {
    if (!isAuthenticated) {
      toast.error('Please login to answer a question');
      return;
    }

    // Frontend validation
    if (!answerText || answerText.trim().length === 0) {
      toast.error('Please enter your answer');
      return;
    }

    if (answerText.trim().length > 2000) {
      toast.error('Answer is too long (max 2000 characters)');
      return;
    }

    if (submittingAnswers.has(questionId)) {
      return; // Prevent double-click
    }

    try {
      setSubmittingAnswers(prev => new Set(prev).add(questionId));
      await questionService.answerQuestion(questionId, answerText);
      setAnswerForms({ ...answerForms, [questionId]: '' });
      fetchQuestions();
      toast.success('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmittingAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const handleMarkHelpful = async (questionId, answerId = null) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark as helpful');
      return;
    }

    const key = answerId ? `${questionId}-${answerId}` : questionId;
    if (markingHelpful.has(key)) {
      return; // Prevent double-click
    }

    try {
      setMarkingHelpful(prev => new Set(prev).add(key));
      await questionService.markHelpful(questionId, answerId);
      fetchQuestions();
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error marking helpful:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as helpful');
    } finally {
      setMarkingHelpful(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const toggleQuestion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary">Questions & Answers</h2>
        {isAuthenticated && (
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <FiMessageCircle />
            Ask a Question
          </button>
        )}
      </div>

      {/* Question Form */}
      {showQuestionForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200"
        >
          <h3 className="text-xl font-semibold mb-4">Ask a Question</h3>
          <form onSubmit={handleSubmitQuestion}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Your Question <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">
                  {questionText.length}/1000
                </span>
              </label>
              <textarea
                value={questionText}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setQuestionText(e.target.value);
                  }
                }}
                rows={4}
                required
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Type your question here..."
              />
              {questionText.length > 900 && (
                <p className="text-xs text-amber-600 mt-1">
                  {1000 - questionText.length} characters remaining
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submittingQuestion || !questionText.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submittingQuestion ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Question'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuestionForm(false);
                  setQuestionText('');
                }}
                disabled={submittingQuestion}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-8">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No questions yet. Be the first to ask a question!
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => {
            const isExpanded = expandedQuestions.has(question._id);
            const activeAnswers = question.answers?.filter((a) => a.isActive !== false) || [];

            return (
              <motion.div
                key={question._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Question Header */}
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleQuestion(question._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FiMessageCircle className="text-primary" />
                        <span className="font-semibold text-secondary">
                          {question.user?.name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-gray-500">
                          asked on {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{question.question}</p>
                    </div>
                    <button className="ml-4 text-gray-500 hover:text-primary transition-colors">
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkHelpful(question._id);
                      }}
                      disabled={markingHelpful.has(question._id)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {markingHelpful.has(question._id) ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FiThumbsUp />
                      )}
                      <span>Helpful ({question.helpful || 0})</span>
                    </button>
                    <span className="text-sm text-gray-500">
                      {activeAnswers.length} {activeAnswers.length === 1 ? 'Answer' : 'Answers'}
                    </span>
                  </div>
                </div>

                {/* Answers Section */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-white"
                  >
                    {activeAnswers.length === 0 ? (
                      <div className="text-gray-500 text-sm mb-4">
                        No answers yet. Be the first to answer!
                      </div>
                    ) : (
                      <div className="space-y-4 mb-4">
                        {activeAnswers.map((answer) => (
                          <div
                            key={answer._id}
                            className={`p-4 rounded-lg ${
                              answer.isAdmin
                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-secondary">
                                    {answer.answeredBy?.name || 'Anonymous'}
                                  </span>
                                  {answer.isAdmin && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(answer.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-800 mb-2">{answer.answer}</p>
                            <button
                              onClick={() => handleMarkHelpful(question._id, answer._id)}
                              disabled={markingHelpful.has(`${question._id}-${answer._id}`)}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {markingHelpful.has(`${question._id}-${answer._id}`) ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <FiThumbsUp />
                              )}
                              <span>Helpful ({answer.helpful || 0})</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Answer Form */}
                    {isAuthenticated && (
                      <div className="border-t border-gray-200 pt-4">
                        <label className="block text-sm font-semibold mb-2">
                          Your Answer
                          <span className="text-xs text-gray-500 ml-2">
                            {(answerForms[question._id] || '').length}/2000
                          </span>
                        </label>
                        <textarea
                          value={answerForms[question._id] || ''}
                          onChange={(e) => {
                            if (e.target.value.length <= 2000) {
                              setAnswerForms({
                                ...answerForms,
                                [question._id]: e.target.value,
                              });
                            }
                          }}
                          rows={3}
                          maxLength={2000}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                          placeholder="Type your answer here..."
                        />
                        {(answerForms[question._id] || '').length > 1800 && (
                          <p className="text-xs text-amber-600 mb-2">
                            {2000 - (answerForms[question._id] || '').length} characters remaining
                          </p>
                        )}
                        <button
                          onClick={() =>
                            handleSubmitAnswer(
                              question._id,
                              answerForms[question._id] || ''
                            )
                          }
                          disabled={!answerForms[question._id]?.trim() || submittingAnswers.has(question._id)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {submittingAnswers.has(question._id) ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            'Submit Answer'
                          )}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductQnA;

