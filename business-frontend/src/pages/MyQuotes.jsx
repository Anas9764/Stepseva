import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiEye,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiShoppingCart,
  FiDollarSign,
} from 'react-icons/fi';
import { fetchMyQuotes, fetchQuoteById, acceptQuote, rejectQuote, setFilters, setSelectedQuote } from '../store/slices/quotesSlice';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const MyQuotes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quotes, loading, filters, selectedQuote } = useSelector((state) => state.quotes);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { account } = useSelector((state) => state.businessAccount);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-quotes' } });
      return;
    }

    if (!account || account.status !== 'active') {
      navigate('/dashboard');
      return;
    }

    // Fetch quotes with current filters
    const params = {
      ...filters,
      search: searchQuery,
    };
    dispatch(fetchMyQuotes(params));
  }, [isAuthenticated, account, dispatch, navigate, filters, searchQuery]);

  const handleViewDetails = async (quoteId) => {
    try {
      await dispatch(fetchQuoteById(quoteId)).unwrap();
      setShowDetailsModal(true);
    } catch (error) {
      toast.error('Failed to load quote details');
    }
  };

  const handleAcceptQuote = async (quoteId) => {
    try {
      await dispatch(acceptQuote(quoteId)).unwrap();
      toast.success('Quote accepted successfully!');
      dispatch(fetchMyQuotes(filters));
    } catch (error) {
      toast.error(error || 'Failed to accept quote');
    }
  };

  const handleRejectQuote = async (quoteId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await dispatch(rejectQuote({ id: quoteId, reason: rejectReason })).unwrap();
      toast.success('Quote rejected');
      setShowRejectModal(false);
      setRejectReason('');
      dispatch(fetchMyQuotes(filters));
    } catch (error) {
      toast.error(error || 'Failed to reject quote');
    }
  };

  const handleDownloadPDF = async (quoteId) => {
    try {
      const { quoteService } = await import('../services/quoteService');
      const blob = await quoteService.downloadQuotePDF(quoteId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Quote PDF downloaded');
    } catch (error) {
      toast.error('Failed to download quote PDF');
    }
  };

  const handleConvertToOrder = async (quoteId) => {
    try {
      const { quoteService } = await import('../services/quoteService');
      await quoteService.convertQuoteToOrder(quoteId, {});
      toast.success('Quote converted to order successfully!');
      navigate('/my-orders');
    } catch (error) {
      toast.error(error || 'Failed to convert quote to order');
    }
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status: status || '' }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending', icon: FiClock },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted', icon: FiCheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: FiXCircle },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Expired', icon: FiClock },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || 0}`;
  };

  if (loading && quotes.length === 0) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-heading font-bold text-secondary mb-2">My Quotes</h1>
          <p className="text-gray-600">View and manage all quotes received from suppliers</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  !filters.status
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  filters.status === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilter('accepted')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  filters.status === 'accepted'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Accepted
              </button>
              <button
                onClick={() => handleStatusFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  filters.status === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quotes List */}
        {quotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-12 text-center"
          >
            <FiFileText className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-heading font-bold text-secondary mb-2">No Quotes Yet</h3>
            <p className="text-gray-600 mb-6">
              Quotes will appear here once you submit inquiries and suppliers respond.
            </p>
            <Link
              to="/my-inquiries"
              className="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
            >
              View My Inquiries
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote, index) => (
              <motion.div
                key={quote._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-secondary">
                            Quote #{quote.quoteNumber || quote._id.slice(-8)}
                          </h3>
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {quote.productId && (
                            <p><strong>Product:</strong> {quote.productId.name}</p>
                          )}
                          {quote.inquiryId && (
                            <p><strong>Inquiry:</strong> #{quote.inquiryId.slice(-8)}</p>
                          )}
                          <p><strong>Total Amount:</strong> {formatCurrency(quote.totalAmount)}</p>
                          {quote.validUntil && (
                            <p><strong>Valid Until:</strong> {new Date(quote.validUntil).toLocaleDateString()}</p>
                          )}
                          <p><strong>Created:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleViewDetails(quote._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <FiEye size={18} />
                      View Details
                    </button>
                    {quote.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptQuote(quote._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                        >
                          <FiCheckCircle size={18} />
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            dispatch(setSelectedQuote(quote));
                            setShowRejectModal(true);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                        >
                          <FiXCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                    {quote.status === 'accepted' && (
                      <button
                        onClick={() => handleConvertToOrder(quote._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                      >
                        <FiShoppingCart size={18} />
                        Convert to Order
                      </button>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(quote._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      <FiDownload size={18} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quote Details Modal */}
        {showDetailsModal && selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-heading font-bold">Quote Details</h2>
                  <p className="text-sm text-white/90">#{selectedQuote.quoteNumber || selectedQuote._id.slice(-8)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    dispatch(setSelectedQuote(null));
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Quote Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    {getStatusBadge(selectedQuote.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quote Number</p>
                    <p className="font-semibold">#{selectedQuote.quoteNumber || selectedQuote._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="font-semibold text-2xl text-primary">{formatCurrency(selectedQuote.totalAmount)}</p>
                  </div>
                  {selectedQuote.validUntil && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                      <p className="font-semibold">{new Date(selectedQuote.validUntil).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                {/* Products */}
                {selectedQuote.items && selectedQuote.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-secondary mb-3">Products</h3>
                    <div className="space-y-3">
                      {selectedQuote.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{item.productName || item.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
                              </p>
                            </div>
                            <p className="font-semibold text-primary">{formatCurrency(item.quantity * item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terms */}
                {selectedQuote.terms && (
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Terms & Conditions</h3>
                    <p className="bg-gray-50 p-3 rounded-lg text-sm">{selectedQuote.terms}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedQuote.notes && (
                  <div>
                    <h3 className="font-semibold text-secondary mb-2">Notes</h3>
                    <p className="bg-gray-50 p-3 rounded-lg text-sm">{selectedQuote.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  {selectedQuote.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleAcceptQuote(selectedQuote._id);
                          setShowDetailsModal(false);
                        }}
                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        Accept Quote
                      </button>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                      >
                        Reject Quote
                      </button>
                    </>
                  )}
                  {selectedQuote.status === 'accepted' && (
                    <button
                      onClick={() => {
                        handleConvertToOrder(selectedQuote._id);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Convert to Order
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadPDF(selectedQuote._id)}
                    className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reject Quote Modal */}
        {showRejectModal && selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
                <h2 className="text-2xl font-heading font-bold">Reject Quote</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejecting this quote..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectQuote(selectedQuote._id)}
                    className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Reject Quote
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyQuotes;

