import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { questionService } from '../services/questionService';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { MessageCircle, Trash2, Filter, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useNotifications from '../hooks/useNotifications';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    productId: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const { markQuestionsAsSeen, notificationItems, markAsRead } = useNotifications();

  // Track last fetch time to prevent excessive calls
  const lastFetchRef = useRef(0);
  const MIN_FETCH_INTERVAL = 30000; // 30 seconds minimum between fetches

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters,
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const response = await questionService.getAllQuestions(params);
      if (response.success) {
        setQuestions(response.data.questions || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalItems(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.response?.data?.message || 'Failed to fetch questions');
      toast.error(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, itemsPerPage]);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;

    // Only fetch if enough time has passed since last fetch
    if (timeSinceLastFetch >= MIN_FETCH_INTERVAL) {
      fetchQuestions();
      lastFetchRef.current = now;
    }
  }, [fetchQuestions]);

  // Mark questions as seen when page loads (separate effect to avoid dependency issues)
  useEffect(() => {
    markQuestionsAsSeen();
    // Mark all question notifications as read when viewing questions page
    notificationItems
      .filter(n => n.type === 'question' && !n.read)
      .forEach(n => markAsRead(n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Smart refresh: Only check for updates when tab becomes visible (with throttling)
  useEffect(() => {
    let intervalId;
    let lastCheckTime = Date.now();
    const REFRESH_INTERVAL = 180000; // 3 minutes

    // Function to check if we should refresh (only if tab is visible)
    const checkForUpdates = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        // Only refresh if it's been more than 3 minutes since last check
        if (timeSinceLastCheck > REFRESH_INTERVAL) {
          const timeSinceLastFetch = Date.now() - lastFetchRef.current;
          // Also check minimum fetch interval
          if (timeSinceLastFetch >= MIN_FETCH_INTERVAL) {
            fetchQuestions();
            lastCheckTime = Date.now();
            lastFetchRef.current = Date.now();
          }
        }
      }
    };

    // Check when tab becomes visible (with throttling)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastCheck = Date.now() - lastCheckTime;
        const timeSinceLastFetch = Date.now() - lastFetchRef.current;
        // Only refresh if enough time has passed
        if (timeSinceLastCheck > REFRESH_INTERVAL && timeSinceLastFetch >= MIN_FETCH_INTERVAL) {
          fetchQuestions();
          lastCheckTime = Date.now();
          lastFetchRef.current = Date.now();
        }
      }
    };

    // Set up interval to check every 3 minutes (only if tab is visible)
    intervalId = setInterval(checkForUpdates, REFRESH_INTERVAL);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchQuestions]); // Include fetchQuestions to use latest version

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await questionService.deleteQuestion(questionId);
      toast.success('Question deleted successfully');

      // Optimize: Remove from local state instead of full refetch
      setQuestions(prevQuestions => prevQuestions.filter(q => q._id !== questionId));
      setTotalItems(prev => Math.max(0, prev - 1));

      // Close modal if deleted question was selected
      if (selectedQuestion?._id === questionId) {
        setIsModalOpen(false);
        setSelectedQuestion(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete question');
      // Fallback to full refetch on error
      fetchQuestions();
    }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      await questionService.deleteAnswer(questionId, answerId);
      toast.success('Answer deleted successfully');

      // Optimize: Update local state instead of full refetch
      if (selectedQuestion?._id === questionId) {
        // Update selected question in modal
        setSelectedQuestion(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            answers: (prev.answers || []).filter(a => a._id !== answerId)
          };
        });
      }

      // Update question in the list
      setQuestions(prev => prev.map(q =>
        q._id === questionId
          ? { ...q, answers: (q.answers || []).filter(a => a._id !== answerId) }
          : q
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete answer');
      // Fallback to full refetch on error
      fetchQuestions();
    }
  };

  const handleViewDetails = (question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
    setAnswerText('');
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !selectedQuestion) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const response = await questionService.answerQuestion(selectedQuestion._id, answerText);
      toast.success('Answer submitted successfully');
      setAnswerText('');

      // Optimize: Update local state instead of refetching all questions
      if (response.success && response.data) {
        // Get the new answer from response
        const newAnswer = response.data.answers?.[response.data.answers.length - 1];

        if (newAnswer) {
          // Update selected question with new answer
          setSelectedQuestion(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              answers: [...(prev.answers || []), newAnswer]
            };
          });

          // Update question in the list
          setQuestions(prev => prev.map(q =>
            q._id === selectedQuestion._id
              ? { ...q, answers: [...(q.answers || []), newAnswer] }
              : q
          ));
        } else {
          // Fallback: Only fetch if response structure is unexpected
          fetchQuestions();
        }
      } else {
        // Fallback: Only fetch if response structure is unexpected
        fetchQuestions();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit answer');
      // Fallback to full refetch on error
      fetchQuestions();
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Filter questions by search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter(
      (question) =>
        question.user?.name?.toLowerCase().includes(query) ||
        question.product?.name?.toLowerCase().includes(query) ||
        question.product?._id?.toLowerCase().includes(query) ||
        question.product?._id?.slice(-8).toLowerCase().includes(query) || // Last 8 chars of ID
        question.questionText?.toLowerCase().includes(query) ||
        question.question?.toLowerCase().includes(query) // Fallback for older data
    );
  }, [questions, searchQuery]);

  const columns = [
    {
      header: 'Product',
      render: (question) => (
        <div className="flex items-center gap-3">
          {question.product?.image && (
            <img
              src={question.product.image}
              alt={question.product.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{question.product?.name || 'N/A'}</div>
            <div className="text-sm text-gray-500">ID: {question.product?._id?.slice(-8) || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'User',
      render: (question) => (
        <div>
          <div className="font-medium text-gray-900">{question.user?.name || 'Anonymous'}</div>
          <div className="text-sm text-gray-500">{question.user?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Question',
      render: (question) => (
        <div className="max-w-md">
          <div className="font-medium text-gray-900 line-clamp-2">{question.questionText || question.question}</div>
        </div>
      ),
    },
    {
      header: 'Answers',
      render: (question) => {
        const activeAnswers = question.answers?.filter(a => a.isActive !== false) || [];
        return (
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {activeAnswers.length} {activeAnswers.length === 1 ? 'Answer' : 'Answers'}
            </span>
            {activeAnswers.some(a => a.isAdmin) && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                <CheckCircle size={12} />
                Admin
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Date',
      render: (question) => (
        <div className="text-sm text-gray-600">
          {new Date(question.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: 'Actions',
      render: (question) => (
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleViewDetails(question)}
            className="whitespace-nowrap"
          >
            <MessageCircle size={16} className="mr-1" />
            View
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteQuestion(question._id)}
            className="whitespace-nowrap"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  if (loading && questions.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions & Answers</h1>
          <p className="text-gray-600 mt-1">Manage customer questions and answers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product ID</label>
              <input
                type="text"
                value={filters.productId}
                onChange={(e) => {
                  setFilters({ ...filters, productId: e.target.value });
                  setCurrentPage(1);
                }}
                placeholder="Enter product ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by user name, product name, product ID, or question..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <Loader />
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-500">No questions found</p>
          {questions.length === 0 && !error && (
            <p className="text-sm text-gray-400 mt-2">Try running the seed script: npm run seed:reviews</p>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table data={filteredQuestions} columns={columns} />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            align="right"
          />
        </>
      )}

      {/* Question Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedQuestion(null);
        }}
        title="Question Details"
        size="lg"
      >
        {selectedQuestion && (
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{selectedQuestion.user?.name || 'Anonymous'}</div>
                  <div className="text-sm text-gray-500">{selectedQuestion.user?.email || 'N/A'}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedQuestion.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-800 mt-2">{selectedQuestion.question}</p>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              {selectedQuestion.product?.image && (
                <img
                  src={selectedQuestion.product.image}
                  alt={selectedQuestion.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <div className="font-semibold text-gray-900">{selectedQuestion.product?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500">Product ID: {selectedQuestion.product?._id || 'N/A'}</div>
              </div>
            </div>

            {/* Answers */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Answers ({selectedQuestion.answers?.filter(a => a.isActive !== false).length || 0})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedQuestion.answers?.filter(a => a.isActive !== false).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No answers yet</p>
                ) : (
                  selectedQuestion.answers
                    ?.filter(a => a.isActive !== false)
                    .map((answer) => (
                      <div
                        key={answer._id}
                        className={`p-4 rounded-lg border ${answer.isAdmin
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-900">
                              {answer.answeredBy?.name || 'Anonymous'}
                            </div>
                            {answer.isAdmin && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-gray-800 mb-2">{answer.answerText || answer.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Helpful: {answer.helpful || 0}
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteAnswer(selectedQuestion._id, answer._id)}
                            className="whitespace-nowrap"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Answer Form */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Add Your Answer <span className="text-blue-600">(Admin Reply)</span>
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3 resize-none"
                  placeholder="Type your answer here... (This will be marked as an admin reply)"
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAnswerText('')}
                    disabled={submittingAnswer}
                    className="whitespace-nowrap"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitAnswer}
                    disabled={!answerText.trim() || submittingAnswer}
                    className="whitespace-nowrap"
                  >
                    {submittingAnswer ? 'Submitting...' : 'Submit Answer'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Questions;

